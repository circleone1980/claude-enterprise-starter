# Agent Memory（子代理持久记忆）

此目录用于存储子代理的持久记忆，让 Agent 可以跨会话保持上下文。

## 目录结构

```
agent-memory/
├── README.md           # 本说明文件
├── pm/                 # PM Agent 记忆
│   └── MEMORY.md
├── backend-1/          # Backend-1 Agent 记忆
│   └── MEMORY.md
├── frontend-1/         # Frontend-1 Agent 记忆
│   └── MEMORY.md
└── ...                 # 其他 Agent
```

## 使用说明

### 创建 Agent 记忆

1. 为每个 Agent 创建同名子目录
2. 在子目录中创建 `MEMORY.md` 文件
3. 记录 Agent 的重要上下文信息

### 记忆内容建议

```markdown
# [Agent Name] Memory

## 当前任务
- 任务描述
- 当前进度
- 待解决问题

## 已完成工作
- 完成项 1
- 完成项 2

## 技术决策
- 决策 1: 原因
- 决策 2: 原因

## 注意事项
- 重要信息 1
- 重要信息 2
```

## 自动记忆

Claude Code 的自动记忆系统会自动管理：
- 位置: `~/.claude/projects/<project>/memory/`
- 内容: 跨会话的上下文信息
- 用法: 使用 `/memory` 命令查看和管理

## 注意事项

- 此目录的记忆是项目级的，会提交到 git
- 敏感信息不要记录在这里
- 定期清理过时的记忆
