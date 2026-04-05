# 快速开始指南

## 5 分钟快速上手

### 第一步：复制模板

**Windows (PowerShell):**
```powershell
# 进入你的项目目录
cd C:\Projects\my-project

# 复制模板
Copy-Item -Recurse F:\Agr\.claude-template\.claude .claude
Copy-Item F:\Agr\.claude-template\.mcp.json .
Copy-Item F:\Agr\.claude-template\CLAUDE.local.md.example CLAUDE.local.md
Copy-Item F:\Agr\.claude-template\settings.local.json.example .claude\settings.local.json
```

**macOS / Linux (Bash):**
```bash
# 进入你的项目目录
cd ~/Projects/my-project

# 复制模板
cp -r F:/Agr/.claude-template/.claude .
cp F:/Agr/.claude-template/.mcp.json .
cp F:/Agr/.claude-template/CLAUDE.local.md.example CLAUDE.local.md
cp F:/Agr/.claude-template/settings.local.json.example .claude/settings.local.json
```

### 第二步：更新 .gitignore

```bash
echo "CLAUDE.local.md" >> .gitignore
echo ".claude/settings.local.json" >> .gitignore
```

### 第三步：验证安装

在 Claude Code 中运行：
```
/doctor
```

### 第四步：开始使用

**方式一：手动开发**
```
请帮我实现用户登录功能
```

**方式二：使用 Agent Team**
```
/plan 实现一个完整的用户认证系统
```

**方式三：狂暴模式（全自动）**
```
启用狂暴模式，创建一个博客系统
```

---

## 常用命令速查

| 命令 | 功能 |
|------|------|
| `/doctor` | 验证配置 |
| `/context` | 查看上下文使用 |
| `/memory` | 查看加载的文件 |
| `/skills` | 查看可用技能 |
| `/agents` | 查看配置的代理 |
| `/plan` | 进入计划模式 |
| `/commit` | 创建提交 |
| `/pr` | 创建 PR |
| `/review` | 代码审查 |
| `/compact` | 压缩上下文 |
| `/clear` | 清空对话 |

---

## 开发工作流示例

### 新功能开发

```
1. /plan 实现用户注册功能
   ↓
2. PM 分解需求 → 创建任务列表
   ↓
3. Architect 设计架构 → 技术方案
   ↓
4. Backend (TDD) → API 实现
   ↓
5. Frontend (TDD) → UI 组件
   ↓
6. QA 测试验证
   ↓
7. /review 代码审查
   ↓
8. /commit → /pr
```

### Bug 修复

```
1. 描述 Bug 现象
   ↓
2. 使用 Skill tdd 启动 TDD
   ↓
3. Red: 写失败测试
   ↓
4. Green: 修复代码
   ↓
5. Refactor: 优化代码
   ↓
6. /commit 修复: xxx
```

---

## 技能使用示例

### TDD 开发

```
Skill tdd

# Claude 会引导你：
# 1. 先写测试
# 2. 实现功能
# 3. 重构代码
```

### UI/UX 设计

```
Skill ui-ux-pro-max --stack react

# 获取 React 最佳实践
# 搜索: python3 skills/ui-ux-pro-max/scripts/search.py "performance"
```

### 数据库配置

```
Skill prisma-database-setup

# 获取 PostgreSQL/MySQL/SQLite 配置指导
```

---

## 下一步

1. 📖 阅读 [完整 README.md](README.md)
2. 📚 查看 [规则文件](rules/)
3. 🎯 探索 [可用技能](skills/)
4. 🤖 了解 [Agent Team](agents/)
5. 🔥 启用 [狂暴模式](automation/rage-mode.json)

---

*有问题？查看 [常见问题](README.md#-常见问题)*
