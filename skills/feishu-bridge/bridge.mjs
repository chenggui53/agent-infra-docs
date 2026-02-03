/**
 * Feishu ↔ Clawdbot Bridge (enhanced version)
 *
 * Receives messages from Feishu via WebSocket (long connection),
 * forwards them to Clawdbot Gateway, and sends the AI reply back.
 *
 * No public server / domain / HTTPS required.
 * Enhanced features: image support, error handling, performance optimizations
 */

import * as Lark from '@larksuiteoapi/node-sdk';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import WebSocket from 'ws';
import path from 'node:path';

// ─── Config ──────────────────────────────────────────────────────

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET_PATH = resolve(process.env.FEISHU_APP_SECRET_PATH || '~/.clawdbot/secrets/feishu_app_secret');
const CLAWDBOT_CONFIG_PATH = resolve(process.env.CLAWDBOT_CONFIG_PATH || '~/.clawdbot/clawdbot.json');
const CLAWDBOT_AGENT_ID = process.env.CLAWDBOT_AGENT_ID || 'main';
const THINKING_THRESHOLD_MS = Number(process.env.FEISHU_THINKING_THRESHOLD_MS ?? 2500);

// ─── Helpers ─────────────────────────────────────────────────────

function resolve(p) {
  return p.replace(/^~/, os.homedir());
}

function mustRead(filePath, label) {
  const resolved = resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`[FATAL] ${label} not found: ${resolved}`);
    process.exit(1);
  }
  const val = fs.readFileSync(resolved, 'utf8').trim();
  if (!val) {
    console.error(`[FATAL] ${label} is empty: ${resolved}`);
    process.exit(1);
  }
  return val;
}

const uuid = () => crypto.randomUUID();

// ─── Load secrets & config ───────────────────────────────────────

if (!APP_ID) {
  console.error('[FATAL] FEISHU_APP_ID environment variable is required');
  process.exit(1);
}

const APP_SECRET = mustRead(APP_SECRET_PATH, 'Feishu App Secret');
const clawdConfig = JSON.parse(mustRead(CLAWDBOT_CONFIG_PATH, 'Clawdbot config'));

const GATEWAY_PORT = clawdConfig?.gateway?.port || 18789;
const GATEWAY_TOKEN = clawdConfig?.gateway?.auth?.token;

if (!GATEWAY_TOKEN) {
  console.error('[FATAL] gateway.auth.token missing in Clawdbot config');
  process.exit(1);
}

// ─── Feishu SDK setup ────────────────────────────────────────────

const sdkConfig = {
  appId: APP_ID,
  appSecret: APP_SECRET,
  domain: Lark.Domain.Feishu,
  appType: Lark.AppType.SelfBuild,
};

const client = new Lark.Client(sdkConfig);
const wsClient = new Lark.WSClient({ ...sdkConfig, loggerLevel: Lark.LoggerLevel.info });

// ─── Dedup (Feishu may deliver the same event more than once) ────

const seen = new Map();
const SEEN_TTL_MS = 10 * 60 * 1000;

function isDuplicate(messageId) {
  const now = Date.now();
  // Garbage-collect old entries
  for (const [k, ts] of seen) {
    if (now - ts > SEEN_TTL_MS) seen.delete(k);
  }
  if (!messageId) return false;
  if (seen.has(messageId)) return true;
  seen.set(messageId, now);
  return false;
}

// ─── Talk to Clawdbot Gateway ────────────────────────────────────

async function askClawdbot({ text, sessionKey }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${GATEWAY_PORT}`);
    let runId = null;
    let buf = '';
    let mediaPath = null;
    const close = () => { try { ws.close(); } catch {} };

    ws.on('error', (e) => { close(); reject(e); });

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      // Step 1: Gateway sends connect challenge → we authenticate
      if (msg.type === 'event' && msg.event === 'connect.challenge') {
        ws.send(JSON.stringify({
          type: 'req',
          id: 'connect',
          method: 'connect',
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: { id: 'gateway-client', version: '0.2.0', platform: 'macos', mode: 'backend' },
            role: 'operator',
            scopes: ['operator.read', 'operator.write'],
            auth: { token: GATEWAY_TOKEN },
            locale: 'zh-CN',
            userAgent: 'feishu-clawdbot-bridge',
          },
        }));
        return;
      }

      // Step 2: Connect response → send the user message
      if (msg.type === 'res' && msg.id === 'connect') {
        if (!msg.ok) { close(); reject(new Error(msg.error?.message || 'connect failed')); return; }
        ws.send(JSON.stringify({
          type: 'req',
          id: 'agent',
          method: 'agent',
          params: {
            message: text,
            agentId: CLAWDBOT_AGENT_ID,
            sessionKey,
            deliver: false,
            idempotencyKey: uuid(),
          },
        }));
        return;
      }

      // Step 3: Agent run accepted
      if (msg.type === 'res' && msg.id === 'agent') {
        if (!msg.ok) { close(); reject(new Error(msg.error?.message || 'agent error')); return; }
        if (msg.payload?.runId) runId = msg.payload.runId;
        return;
      }

      // Step 4: Stream the response
      if (msg.type === 'event' && msg.event === 'agent') {
        const p = msg.payload;
        if (!p || (runId && p.runId !== runId)) return;

        if (p.stream === 'assistant') {
          const d = p.data || {};
          if (typeof d.text === 'string') buf = d.text;
          else if (typeof d.delta === 'string') buf += d.delta;
          return;
        }

        // Handle media messages
        if (p.stream === 'media') {
          const d = p.data || {};
          if (d.path) {
            mediaPath = d.path;
          }
          return;
        }

        if (p.stream === 'lifecycle') {
          if (p.data?.phase === 'end') { 
            close(); 
            resolve({ text: buf.trim(), mediaPath }); 
          }
          if (p.data?.phase === 'error') { close(); reject(new Error(p.data?.message || 'agent error')); }
        }
      }
    });
  });
}

// ─── Send reaction to Feishu ─────────────────────────────────────

async function sendReactionToFeishu(messageId, emojiKey) {
  try {
    // Send reaction to message
    await client.im.reaction.create({
      data: {
        message_id: messageId,
        emoji_type: 'emoji',
        emoji_key: emojiKey
      }
    });
    return true;
  } catch (e) {
    console.error('[ERROR] sendReactionToFeishu:', e);
    return false;
  }
}

// ─── Remove reaction from Feishu ────────────────────────────────

async function removeReactionFromFeishu(messageId, emojiKey) {
  try {
    // Remove reaction from message
    await client.im.reaction.delete({
      query: {
        message_id: messageId,
        emoji_type: 'emoji',
        emoji_key: emojiKey
      }
    });
    return true;
  } catch (e) {
    console.error('[ERROR] removeReactionFromFeishu:', e);
    return false;
  }
}

// ─── Send image to Feishu ────────────────────────────────────────

async function sendImageToFeishu(chatId, imagePath) {
  try {
    // Upload image to Feishu
    const fileBuffer = fs.readFileSync(imagePath);
    const uploadRes = await client.im.v1.image.create({
      data: {
        image_type: 'message',
        image_bytes: fileBuffer,
      },
    });

    if (!uploadRes?.data?.image_key) {
      throw new Error('Failed to upload image');
    }

    // Send image message
    await client.im.v1.message.create({
      params: { receive_id_type: 'chat_id' },
      data: { 
        receive_id: chatId, 
        msg_type: 'image', 
        content: JSON.stringify({ image_key: uploadRes.data.image_key }) 
      },
    });

    return true;
  } catch (e) {
    console.error('[ERROR] sendImageToFeishu:', e);
    return false;
  }
}

// ─── Group chat intelligence ─────────────────────────────────────
//
// In group chats, only respond when the message looks like a real
// question, request, or direct address — avoids spamming.

function shouldRespondInGroup(text, mentions) {
  if (mentions.length > 0) return true;
  const t = text.toLowerCase();
  if (/[？?]$/.test(text)) return true;
  if (/\b(why|how|what|when|where|who|help)\b/.test(t)) return true;
  const verbs = ['帮', '麻烦', '请', '能否', '可以', '解释', '看看', '排查', '分析', '总结', '写', '改', '修', '查', '对比', '翻译'];
  if (verbs.some(k => text.includes(k))) return true;
  // Customize this list with your bot's name
  if (/^(clawdbot|bot|助手|智能体)[\s,:，：]/i.test(text)) return true;
  return false;
}

// ─── Interactive card action handler ─────────────────────────────

async function handleCardAction(data) {
  try {
    const { action, open_chat_id, user_id } = data;
    if (!action || !open_chat_id) return;

    console.log('[INFO] Card action received:', JSON.stringify(data, null, 2));

    // 解析按钮值
    const buttonValue = action.value || {};
    const buttonText = action.text || '';

    // 根据按钮值决定响应
    let responseText = '';

    switch (buttonValue.action) {
      case 'view_knowledge':
        responseText = '📚 正在为您打开知识库...';
        // 调用 OpenClaw 查看知识库
        // 可以通过发送系统事件或直接发送命令
        break;
      
      case 'search':
        responseText = '🔍 正在为您执行搜索...';
        // 调用 OpenClaw 搜索功能
        if (buttonValue.question) {
          responseText = `🔍 正在搜索: "${buttonValue.question}"`;
        }
        break;
      
      case 'add_note':
        responseText = '📝 正在为您创建新笔记...';
        // 调用 OpenClaw 创建笔记
        if (buttonValue.question) {
          responseText = `📝 正在为问题创建笔记: "${buttonValue.question}"`;
        }
        break;
      
      case 'statistics':
        responseText = '📊 正在为您提供统计信息...';
        // 调用 OpenClaw 获取统计信息
        break;
      
      case 'like':
        responseText = '❤️ 感谢您的点赞！';
        // 发送反应
        break;
      
      case 'view_docs':
        responseText = '📖 正在为您打开文档...';
        break;
      
      case 'mark_read':
        responseText = '✅ 已标记为已读';
        break;
      
      case 'view_details':
        responseText = '📎 正在为您显示详细信息...';
        break;
      
      default:
        responseText = `🚀 您点击了: ${buttonText}`;
        if (Object.keys(buttonValue).length > 0) {
          responseText += `\n📋 按钮值: ${JSON.stringify(buttonValue)}`;
        }
    }

    // 发送文本响应
    await client.im.v1.message.create({
      params: { receive_id_type: 'chat_id' },
      data: {
        receive_id: open_chat_id,
        msg_type: 'text',
        content: JSON.stringify({ text: responseText })
      }
    });

    console.log('[INFO] Card action response sent');
  } catch (error) {
    console.error('[ERROR] Handle card action:', error);
    try {
      await client.im.v1.message.create({
        params: { receive_id_type: 'chat_id' },
        data: {
          receive_id: data.open_chat_id,
          msg_type: 'text',
          content: JSON.stringify({ text: '⚠️ 操作处理失败，请稍后重试' })
        }
      });
    } catch (e) {
      console.error('[ERROR] Send error response:', e);
    }
  }
}

// ─── Message handler ─────────────────────────────────────────────

const dispatcher = new Lark.EventDispatcher({}).register({
  'im.message.interactive_card_action': handleCardAction,
  'im.message.receive_v1': async (data) => {
    try {
      const { message } = data;
      const chatId = message?.chat_id;
      if (!chatId) return;

      // Dedup
      if (isDuplicate(message?.message_id)) return;

      // Only handle text messages
      if (message?.message_type !== 'text' || !message?.content) return;

      let text = (JSON.parse(message.content)?.text || '').trim();
      if (!text) return;

      // Group chat: check if we should respond
      if (message?.chat_type === 'group') {
        const mentions = Array.isArray(message?.mentions) ? message.mentions : [];
        text = text.replace(/@_user_\d+\s*/g, '').trim();
        if (!text || !shouldRespondInGroup(text, mentions)) return;
      }

      const sessionKey = `feishu:${chatId}`;

      // Process asynchronously
      setImmediate(async () => {
        // Send thinking reaction immediately to acknowledge receipt
        await sendReactionToFeishu(message.message_id, '🤔');
        
        let reply = '';
        let mediaPath = null;
        try {
          const result = await askClawdbot({ text, sessionKey });
          reply = result.text;
          mediaPath = result.mediaPath;
        } catch (e) {
          console.error('[ERROR] askClawdbot:', e);
          reply = `（系统出错）${e?.message || String(e)}`;
        }

        // Skip empty or NO_REPLY
        if (!reply || reply === 'NO_REPLY') {
          await removeReactionFromFeishu(message.message_id, '🤔');
          return;
        }

        // Remove thinking reaction before sending reply
        await removeReactionFromFeishu(message.message_id, '🤔');
        
        // Send text reply
        await client.im.v1.message.create({
          params: { receive_id_type: 'chat_id' },
          data: { receive_id: chatId, msg_type: 'text', content: JSON.stringify({ text: reply }) },
        });

        // Send media if present
        if (mediaPath && fs.existsSync(mediaPath)) {
          await sendImageToFeishu(chatId, mediaPath);
          // Clean up the media file
          fs.unlinkSync(mediaPath);
        }
      });
    } catch (e) {
      console.error('[ERROR] message handler:', e);
    }
  },
});

// ─── Start ───────────────────────────────────────────────────────

wsClient.start({ eventDispatcher: dispatcher });
console.log(`[OK] Feishu bridge started (appId=${APP_ID})`);
