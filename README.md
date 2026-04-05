# Claude Enterprise Starter

[English](#-english) | [中文](#-中文)

---

## 📖 English

> 🚀 Enterprise-grade Claude Code configuration template with Agent Team orchestration, Rage Mode automation, TDD workflow, and production-ready configurations.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://code.claude.com)
[![Version](https://img.shields.io/badge/Version-1.1.0-green)](./CLAUDE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

### Features

| Feature | Description |
|---------|-------------|
| **Agent Team** | 9 specialized roles collaborating in parallel (PM, PO, Architect, Designer, Frontend, Backend, QA, DevOps, Product Experience) |
| **Rage Mode** 🔴 | Full automation - auto GitHub push, agent health monitoring, phase advancement |
| **TDD Workflow** | Enforced Test-Driven Development with Red-Green-Refactor cycle |
| **Quality Gates** | 4-stage verification: functionality, code review, testing, documentation |
| **Skills System** | 9+ integrated skills: TDD, UI/UX, Prisma, React best practices |
| **Commands** | Custom slash commands: `/commit`, `/pr`, `/review` |
| **Output Styles** | 3 output modes: terse, detailed, enterprise |

### Quick Start

```bash
# Clone the template
git clone https://github.com/circleone1980/claude-enterprise-starter.git

# Copy to your project
cp -r claude-enterprise-starter/.claude your-project/
cp claude-enterprise-starter/.mcp.json your-project/

# Create local config (gitignored)
cp claude-enterprise-starter/CLAUDE.local.md.example your-project/CLAUDE.local.md
```

### Directory Structure

```
.claude/
├── CLAUDE.md              # Core instructions
├── settings.json          # Permissions, hooks, configs
├── rules/                 # Modular rules (6 files)
├── skills/                # Custom skills (9+ skills)
├── agents/                # Agent definitions (9 roles)
├── commands/              # Slash commands
├── output-styles/         # Output style variants
├── agent-memory/          # Persistent agent memory
├── automation/            # Rage mode configs
└── hooks/                 # Hook scripts
```

### Agent Team Roles

| Role | Responsibilities | Required Skills |
|------|------------------|-----------------|
| PM | Project management, task distribution | product-requirements, sprint-planning |
| PO | Requirements analysis, user stories | product-requirements, user-onboarding |
| Architect | System design, technical solutions | writing-plans 🔴, react-best-practices 🔴, code-review |
| UI Designer | Interface design, interaction | ui-ux-pro-max |
| Frontend | Frontend development | tdd, antfu, ui-ux-pro-max |
| Backend | Backend development | tdd, prisma-database-setup |
| QA | Testing, verification | tdd, code-review |
| DevOps | Deployment, CI/CD | code-review |
| Product Experience | User perspective testing | user-onboarding, ui-ux-pro-max |

### Rage Mode Features

| Automation | Trigger |
|------------|---------|
| Auto GitHub push | Every 30 min / phase complete |
| Agent health monitor | Every 5 minutes |
| Auto restart agents | On agent failure |
| Phase advancement | After validation passes |
| Safety guard | Every tool call |

### Usage

```bash
# Verify installation
/doctor

# Start with Agent Team
/plan Implement user authentication system

# Manual agent start
Agent --name "Backend-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "Use Skill tdd first, then implement login API"
```

### Verification Commands

| Command | Purpose |
|---------|---------|
| `/doctor` | Diagnose configuration |
| `/context` | View context usage |
| `/memory` | View loaded files |
| `/skills` | List available skills |
| `/agents` | View configured agents |

---

## 📖 中文

> 🚀 企业级 Claude Code 配置模板，包含 Agent Team 编排、狂暴模式自动化、TDD 工作流和生产级配置。

### 核心功能

| 功能 | 说明 |
|------|------|
| **Agent Team** | 9 个专业角色并行协作（PM、PO、架构师、设计师、前端、后端、QA、DevOps、产品体验师） |
| **狂暴模式** 🔴 | 全自动开发 - 自动 GitHub 推送、Agent 监控、阶段推进 |
| **TDD 工作流** | 强制测试驱动开发，Red-Green-Refactor 循环 |
| **质量门禁** | 4 阶段验证：功能、代码审查、测试、文档 |
| **技能系统** | 9+ 集成技能：TDD、UI/UX、Prisma、React 最佳实践 |
| **命令系统** | 自定义斜杠命令：`/commit`、`/pr`、`/review` |
| **输出风格** | 3 种输出模式：简洁、详细、企业级 |

### 快速开始

```bash
# 克隆模板
git clone https://github.com/circleone1980/claude-enterprise-starter.git

# 复制到你的项目
cp -r claude-enterprise-starter/.claude your-project/
cp claude-enterprise-starter/.mcp.json your-project/

# 创建本地配置（不提交到 Git）
cp claude-enterprise-starter/CLAUDE.local.md.example your-project/CLAUDE.local.md
```

### 目录结构

```
.claude/
├── CLAUDE.md              # 核心指令文件
├── settings.json          # 权限、钩子、配置
├── rules/                 # 模块化规则（6 个文件）
├── skills/                # 自定义技能（9+ 技能）
├── agents/                # 代理定义（9 个角色）
├── commands/              # 斜杠命令
├── output-styles/         # 输出风格变体
├── agent-memory/          # 代理持久记忆
├── automation/            # 狂暴模式配置
└── hooks/                 # 钩子脚本
```

### Agent Team 角色

| 角色 | 职责 | 必用技能 |
|------|------|---------|
| PM | 项目管理、任务分配 | product-requirements, sprint-planning |
| PO | 需求分析、用户故事 | product-requirements, user-onboarding |
| 架构师 | 系统设计、技术方案 | react-best-practices, code-review |
| UI 设计师 | 界面设计、交互规范 | ui-ux-pro-max |
| 前端开发 | 前端开发 | tdd, antfu, ui-ux-pro-max |
| 后端开发 | 后端开发 | tdd, prisma-database-setup |
| QA | 测试验证 | tdd, code-review |
| DevOps | 部署运维 | code-review |
| 产品体验师 | 用户视角测试 | user-onboarding, ui-ux-pro-max |

### 狂暴模式功能

| 自动化 | 触发条件 |
|--------|---------|
| 自动 GitHub 推送 | 每 30 分钟 / 阶段完成 |
| Agent 健康监控 | 每 5 分钟 |
| 自动重启 Agent | Agent 失败时 |
| 阶段自动推进 | 验证通过后 |
| 安全边界守护 | 每次工具调用 |

### 使用方式

```bash
# 验证安装
/doctor

# 使用 Agent Team
/plan 实现用户认证系统

# 手动启动 Agent
Agent --name "Backend-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "先调用 Skill tdd，然后实现登录 API"
```

### 验证命令

| 命令 | 用途 |
|------|------|
| `/doctor` | 诊断配置 |
| `/context` | 查看上下文使用 |
| `/memory` | 查看加载的文件 |
| `/skills` | 列出可用技能 |
| `/agents` | 查看配置的代理 |

---

## 📋 Checklist

### New Project Setup

- [ ] Copy `.claude/` directory to project
- [ ] Copy `.mcp.json` to project root
- [ ] Create `CLAUDE.local.md` from example
- [ ] Add to `.gitignore`: `CLAUDE.local.md`, `.claude/settings.local.json`
- [ ] Run `/doctor` to verify

### Development Workflow

- [ ] Use `/plan` to enter plan mode
- [ ] Follow TDD cycle (Red → Green → Refactor)
- [ ] Pass code review
- [ ] Test coverage >80%
- [ ] Update documentation
- [ ] Use `/commit` for commits

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- [Claude Code Docs](https://code.claude.com/docs)
- [DataCamp CLAUDE.md Guide](https://www.datacamp.com/tutorial/writing-the-best-claude-md)
- [eesel AI Best Practices](https://www.eesel.ai/blog/claude-code-best-practices)
- [FlorianBruniaux Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)

---

*Template Version: 1.1.0*
*Last Updated: 2026-04-05*
