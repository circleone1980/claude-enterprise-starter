# Agent Team 生命周期管理

> **注意**: 新版 Claude Code 已修复 TeamDelete bug，以下为标准流程

## 标准团队创建流程

```bash
# 1. 创建团队
TeamCreate --name "team-name"

# 2. 创建任务
TaskCreate --subject "任务名称" --description "任务描述"

# 3. 分配任务给 Agent
SendMessage --to "agent-name" --message "任务分配..."
```

## 优雅解散流程

### 正常关闭
```bash
# 1. 发送关闭请求（等待 Agent 确认）
SendMessage --to "*" --message '{"type": "shutdown_request"}'

# 2. 等待 30 秒让 Agent 完成清理

# 3. 删除团队
TeamDelete --name "team-name"
```

### 强制清理（异常情况）
```bash
# 清理指定团队
bash scripts/team-manager.sh clean <team-name>

# 清理所有非 default 团队
bash scripts/team-manager.sh nuke
```

## 异常处理

| 症状               | 解决方案                     |
| ------------------ | ---------------------------- |
| Agent 僵尸无响应   | `team-manager.sh clean`      |
| TeamDelete 失败    | `team-manager.sh nuke` + 重启 |
| 状态栏显示过期团队 | `/clear` 或重启 Claude Code  |

## 阶段推进自动清理

狂暴模式下，orchestrate.sh 在阶段推进时自动调用 team-manager.sh 清理上阶段 Team，防止僵尸团队阻塞新团队创建。

*加载顺序: 13*
