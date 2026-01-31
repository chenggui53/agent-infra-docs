# OpenClaw Agent Sandbox 快速参考

## 常用命令

### 检查配置
```bash
# 查看沙箱状态
openclaw sandbox explain

# 检查特定代理
openclaw sandbox explain --agent <agent-id>

# 检查特定会话
openclaw sandbox explain --session <session-key>

# 查看代理列表
openclaw agents list --bindings

# 查看运行状态
openclaw status
```

### 管理沙箱
```bash
# 查看正在运行的容器
docker ps --filter "name=openclaw-sbx-"

# 查看容器日志
docker logs openclaw-sbx-<container-id>

# 停止所有沙箱容器
docker stop $(docker ps -q --filter "name=openclaw-sbx-")

# 删除停止的沙箱容器
docker rm $(docker ps -q -f "status=exited" --filter "name=openclaw-sbx-")
```

### 重建沙箱镜像
```bash
# 构建默认沙箱镜像
scripts/sandbox-setup.sh

# 构建浏览器沙箱镜像
scripts/sandbox-browser-setup.sh
```

## 常见配置示例

### 1. 无沙箱配置
```json5
{
  "agents": {
    "defaults": {
      "sandbox": { "mode": "off" }
    }
  }
}
```

### 2. 全局沙箱配置
```json5
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "scope": "session",
        "workspaceAccess": "none"
      }
    }
  }
}
```

### 3. 代理特定配置
```json5
{
  "agents": {
    "list": [
      {
        "id": "public",
        "name": "Public Agent",
        "workspace": "~/.openclaw/workspace-public",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "sessions_list"],
          "deny": ["exec", "write"]
        }
      }
    ]
  }
}
```

### 4. 工具组配置
```json5
{
  "tools": {
    "allow": ["group:fs", "group:sessions"],
    "deny": ["group:ui"],
    "sandbox": {
      "tools": {
        "allow": ["group:runtime", "group:fs"],
        "deny": ["group:automation"]
      }
    }
  }
}
```

## 关键配置参数

### 沙箱模式
```json5
"mode": "off"          // 无沙箱
"mode": "non-main"     // 非主会话沙箱化（默认）
"mode": "all"          // 所有会话沙箱化
```

### 沙箱范围
```json5
"scope": "session"     // 每个会话一个容器（默认）
"scope": "agent"       // 每个代理一个容器
"scope": "shared"      // 共享容器
```

### 工作区访问
```json5
"workspaceAccess": "none"  // 独立沙箱工作区（默认）
"workspaceAccess": "ro"    // 只读挂载
"workspaceAccess": "rw"    // 读写挂载
```

## 工具组速查表

| 工具组 | 包含工具 |
|--------|----------|
| `group:runtime` | `exec`, `bash`, `process` |
| `group:fs` | `read`, `write`, `edit`, `apply_patch` |
| `group:sessions` | `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status` |
| `group:memory` | `memory_search`, `memory_get` |
| `group:ui` | `browser`, `canvas` |
| `group:automation` | `cron`, `gateway` |
| `group:messaging` | `message` |
| `group:nodes` | `nodes` |
| `group:openclaw` | 所有内置工具 |

## 安全最佳实践

### 1. 最小权限
```json5
{
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["read"],
        "deny": ["exec", "write"]
      }
    }
  }
}
```

### 2. 防止容器逃逸
```json5
{
  "agents": {
    "defaults": {
      "sandbox": {
        "docker": {
          "readOnlyRoot": true,
          "network": "none"
        }
      }
    }
  }
}
```

### 3. 限制主机访问
```json5
{
  "tools": {
    "elevated": {
      "enabled": false
    }
  }
}
```

## 故障排除

### 1. 沙箱未启用
- 检查代理配置：`"mode": "all"` 或 `"mode": "non-main"`
- 确认代理 ID 与会话 key 匹配

### 2. 工具被阻止
- 运行 `openclaw sandbox explain` 查看详细信息
- 检查工具政策配置
- 确认 `workspaceAccess` 设置正确

### 3. 容器无法启动
- 检查 Docker 是否正在运行
- 确认沙箱镜像已构建：`docker images | grep openclaw-sandbox`
- 查看网关日志：`openclaw logs --follow`

---

**最后更新**: 2026年1月31日
**版本**: OpenClaw 2026.1.29
