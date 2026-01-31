# OpenClaw Agent Sandbox 知识点整理

## 概述

OpenClaw Agent Sandbox 是一个用于隔离和限制 OpenClaw 执行环境的安全机制，通过 Docker 容器实现工具执行的隔离，减少潜在的安全风险。

## 核心概念

### 1. 沙箱模式 (Sandbox Modes)

**`agents.defaults.sandbox.mode`** 控制沙箱的启用时机：

- `"off"`: 无沙箱，所有工具在主机上运行
- `"non-main"`: 仅非主会话沙箱化（默认值，适用于群组/频道会话）
- `"all"`: 所有会话都在沙箱中运行

### 2. 沙箱范围 (Sandbox Scope)

**`agents.defaults.sandbox.scope`** 控制容器创建方式：

- `"session"`: 每个会话一个容器（默认）
- `"agent"`: 每个代理一个容器
- `"shared"`: 所有沙箱会话共享一个容器

### 3. 工作区访问 (Workspace Access)

**`agents.defaults.sandbox.workspaceAccess`** 控制容器对代理工作区的访问：

- `"none"`: 沙箱有独立的工作区（默认）
- `"ro"`: 只读挂载代理工作区
- `"rw"`: 读写挂载代理工作区

## 配置结构

### 全局配置

```json5
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session",
        "workspaceAccess": "none",
        "docker": {
          "network": "none",
          "image": "openclaw-sandbox:bookworm-slim",
          "binds": [],
          "setupCommand": "",
          "readOnlyRoot": true,
          "user": "1000:1000"
        },
        "browser": {
          "autoStart": true,
          "autoStartTimeoutMs": 30000
        }
      }
    }
  }
}
```

### 多代理配置

```json5
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Personal Assistant",
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" },
        "tools": { "allow": ["group:openclaw"] }
      },
      {
        "id": "family",
        "name": "Family Bot",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit"]
        }
      }
    ]
  }
}
```

## 工具政策 (Tool Policy)

### 工具组 (Tool Groups)

OpenClaw 支持工具组简化配置：

- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:openclaw`: 所有内置 OpenClaw 工具

### 工具政策配置

```json5
{
  "tools": {
    "profile": "default",
    "allow": ["group:fs", "group:runtime"],
    "deny": ["browser"],
    "sandbox": {
      "tools": {
        "allow": ["group:fs", "group:sessions"],
        "deny": ["exec"]
      }
    },
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "whatsapp": ["+15551234567"]
      }
    }
  }
}
```

## 沙箱与工具政策关系

OpenClaw 的安全控制有三个层次：

1. **沙箱 (Sandbox)**: 决定工具在哪里运行（Docker vs 主机）
2. **工具政策 (Tool Policy)**: 决定哪些工具可用/被允许
3. **Elevated 模式**: 仅对 `exec` 的主机执行逃生舱口

### 工具过滤顺序

1. 工具配置文件 (`tools.profile`)
2. 全局工具政策 (`tools.allow`/`tools.deny`)
3. 代理特定工具政策 (`agents.list[].tools.allow`/`agents.list[].tools.deny`)
4. 沙箱工具政策 (`tools.sandbox.tools.allow`/`tools.sandbox.tools.deny`)

`deny` 规则总是优先于 `allow` 规则。

## 常见场景配置

### 1. 完全访问代理

```json5
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Personal Assistant",
        "sandbox": { "mode": "off" },
        "tools": { "allow": ["group:openclaw"] }
      }
    ]
  }
}
```

### 2. 只读访问代理

```json5
{
  "agents": {
    "list": [
      {
        "id": "read-only",
        "name": "Read-Only Agent",
        "sandbox": { "mode": "all" },
        "tools": {
          "allow": ["read"],
          "deny": ["write", "edit", "apply_patch", "exec"]
        }
      }
    ]
  }
}
```

### 3. 通信专用代理

```json5
{
  "agents": {
    "list": [
      {
        "id": "communication",
        "name": "Communication Agent",
        "sandbox": { "mode": "all" },
        "tools": {
          "allow": ["sessions_list", "sessions_send", "session_status", "message"],
          "deny": ["exec", "write", "edit", "read"]
        }
      }
    ]
  }
}
```

## 调试与监控

### 检查沙箱状态

```bash
# 解释沙箱配置
openclaw sandbox explain

# 检查特定会话
openclaw sandbox explain --session agent:main:main

# 检查特定代理
openclaw sandbox explain --agent work

# JSON 格式输出
openclaw sandbox explain --json
```

### 查看容器状态

```bash
# 列出沙箱容器
docker ps --filter "name=openclaw-sbx-"

# 查看容器日志
docker logs openclaw-sbx-<container-id>
```

### 监控沙箱活动

```bash
# 查看网关日志
tail -f "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/logs/gateway.log" | grep -E "routing|sandbox|tools"
```

## 常见问题

### 1. 代理没有沙箱化

**问题**: 设置了 `"mode": "all"` 但代理仍在主机上运行

**解决**:
- 检查是否有代理特定配置覆盖了全局配置
- 确认代理配置中设置了 `sandbox.mode: "all"`

```json5
{
  "agents": {
    "list": [
      {
        "id": "public",
        "sandbox": { "mode": "all" }
      }
    ]
  }
}
```

### 2. 工具被沙箱策略阻止

**问题**: 工具在沙箱中被阻止

**解决**:
- 查看调试信息：`openclaw sandbox explain`
- 在沙箱工具政策中允许该工具：

```json5
{
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["read", "write"]
      }
    }
  }
}
```

### 3. 工作区不可访问

**问题**: 工具无法读取工作区文件

**解决**:
- 检查工作区访问配置：`workspaceAccess: "ro"` 或 `"rw"`
- 确认路径权限
- 使用 `read` 工具检查工作区内容

## 最佳实践

### 1. 最小权限原则

- 仅允许代理需要的工具
- 优先使用 `deny` 规则
- 对公共面向的代理使用严格的沙箱配置

### 2. 隔离策略

- 个人代理使用无沙箱模式 (`mode: "off"`)
- 家庭/工作代理使用沙箱模式 (`mode: "all"`)
- 公共代理使用最严格的沙箱和工具政策

### 3. 定期更新

- 定期更新沙箱镜像
- 审查和更新工具政策
- 监控沙箱活动

## 相关文档

- [官方沙箱文档](/gateway/sandboxing)
- [多代理沙箱配置](/multi-agent-sandbox-tools)
- [沙箱 vs 工具政策](/gateway/sandbox-vs-tool-policy-vs-elevated)
- [工具政策配置](/gateway/configuration#tools)

---

**最后更新**: 2026年1月31日
**版本**: OpenClaw 2026.1.29
**状态**: 活跃 (Active)
