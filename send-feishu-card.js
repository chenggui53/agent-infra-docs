#!/usr/bin/env node
/**
 * 飞书卡片消息发送工具
 * 使用模板化的方式发送交互式卡片消息
 */

const Lark = require('@larksuiteoapi/node-sdk');
const FeishuCardTemplates = require('./feishu-card-templates');

// 飞书应用配置
const sdkConfig = {
  appId: 'cli_a9f6761d33f8dcc5',
  appSecret: '9Z6vwkkyvcQ9QW8JiF6QFc3tfJPbsGkb',
  domain: Lark.Domain.Feishu,
  appType: Lark.AppType.SelfBuild,
};

const client = new Lark.Client(sdkConfig);

// 目标用户
const targetUserId = 'ou_ca8d1b5ba25ea16407f6b975575ddb5d';

class FeishuCardSender {
  /**
   * 发送卡片消息
   */
  static async sendCard(cardType, data = {}) {
    try {
      let card;
      
      switch (cardType) {
        case 'welcome':
          card = FeishuCardTemplates.welcomeCard();
          break;
        case 'knowledge':
          card = FeishuCardTemplates.knowledgeCard();
          break;
        case 'question':
          card = FeishuCardTemplates.questionCard(data.question || '默认问题');
          break;
        case 'task':
          card = FeishuCardTemplates.taskCard();
          break;
        case 'learning':
          card = FeishuCardTemplates.learningCard(data.topic || '默认学习主题');
          break;
        case 'notification':
          card = FeishuCardTemplates.notificationCard(data.title || '通知', data.content || '通知内容');
          break;
        default:
          throw new Error(`不支持的卡片类型: ${cardType}`);
      }
      
      const response = await client.im.message.create({
        params: { receive_id_type: 'open_id' },
        data: {
          receive_id: targetUserId,
          msg_type: 'interactive',
          content: card.content
        }
      });
      
      console.log(`✅ 卡片消息发送成功！`);
      console.log(`消息ID: ${response.data?.message_id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ 发送失败:', error.message);
      if (error.response?.data) {
        console.error('详细错误:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }
  
  /**
   * 发送测试卡片
   */
  static async sendTestCards() {
    try {
      console.log('=== 发送测试卡片 ===\n');
      
      // 发送欢迎卡片
      console.log('1. 发送欢迎卡片...');
      await this.sendCard('welcome');
      await this.delay(1000);
      
      console.log('');
      
      // 发送知识库管理卡片
      console.log('2. 发送知识库管理卡片...');
      await this.sendCard('knowledge');
      await this.delay(1000);
      
      console.log('');
      
      // 发送任务管理卡片
      console.log('3. 发送任务管理卡片...');
      await this.sendCard('task');
      await this.delay(1000);
      
      console.log('');
      
      // 发送问题求解卡片
      console.log('4. 发送问题求解卡片...');
      await this.sendCard('question', {
        question: '如何在飞书中使用交互式卡片消息？'
      });
      
      console.log('\n=== 所有测试卡片发送成功！ ===');
      
    } catch (error) {
      console.error('❌ 测试失败:', error);
    }
  }
  
  /**
   * 延迟函数
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 如果直接运行，发送测试卡片
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法: node send-feishu-card.js <cardType> [data]');
    console.log('');
    console.log('支持的卡片类型:');
    console.log('  welcome      - 欢迎卡片');
    console.log('  knowledge    - 知识库管理卡片');
    console.log('  question     - 问题求解卡片');
    console.log('  task         - 任务管理卡片');
    console.log('  learning     - 学习卡片');
    console.log('  notification - 通知卡片');
    console.log('  test         - 发送所有测试卡片');
    console.log('');
    console.log('示例:');
    console.log('  node send-feishu-card.js question --question "如何使用飞书API？"');
    
  } else {
    const cardType = args[0];
    
    if (cardType === 'test') {
      FeishuCardSender.sendTestCards();
    } else {
      const data = {};
      
      // 解析参数
      for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith('--')) {
          const key = args[i].slice(2);
          const value = args[i + 1];
          data[key] = value;
          i++;
        }
      }
      
      FeishuCardSender.sendCard(cardType, data);
    }
  }
}

module.exports = FeishuCardSender;
