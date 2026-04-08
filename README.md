# Claude Enterprise Starter

[English](#-english) | [中文](#-中文)

---

## 📖 English

> 🚀 Enterprise-grade Claude Code configuration template with Agent Team orchestration, Rage Mode automation, TDD workflow, and production-ready configurations.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://code.claude.com)
[![Version](https://img.shields.io/badge/Version-2.0.0-green)](./CLAUDE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

### Features

| Feature | Description |
|---------|-------------|
| **Agent Team** | 9 specialized roles collaborating in parallel (PM, PO, Architect, Designer, Frontend, Backend, QA, DevOps, Product Experience) |
| **Rage Mode** 🔴 | Full automation - auto GitHub push, agent health monitoring, phase advancement |
| **TDD Workflow** | Enforced Test-Driven Development with Red-Green-Refactor cycle |
| **Quality Gates** | 4-stage verification: functionality, code review, testing, documentation |
| **Skills System** | 10+ integrated skills: TDD, UI/UX, Prisma, React best practices, design-context |
| **Document System** 🆕 | Frozen/Evolution/ADR document layers with design-context skill for auto-loading |
| **Skill Triggers** 🆕 | 4-layer skill triggering mechanism (Rules + Skill + Task + Dynamic) |
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
├── rules/                 # Modular rules (8 files)
│   ├── 00_global.md       # Language, startup constraints
│   ├── 01_development.md  # Development constraints
│   ├── 02_database.md     # Database standards
│   ├── 03_quality.md      # Quality gates
│   ├── 04_agent_team.md   # Agent Team rules
│   ├── 05_security.md     # Security standards
│   ├── 06_document_lifecycle.md  # 🆕 Document lifecycle (Frozen/Evolution/ADR)
│   └── 07_skill_triggers.md      # 🆕 Skill trigger rules
├── skills/                # Custom skills (10+ skills)
│   ├── design-context/    # 🆕 Auto-load design docs by role
│   ├── tdd/               # TDD workflow
│   ├── code-review/       # Code review
│   └── ...
├── agents/                # Agent definitions (9 roles)
├── commands/              # Slash commands
├── output-styles/         # Output style variants
├── agent-memory/          # Persistent agent memory
├── automation/            # Rage mode configs
└── hooks/                 # Hook scripts

docs/                      # 🆕 Project documentation (from templates)
├── requirements/          # Frozen layer: PRD, user stories, acceptance criteria
├── design/                # Frozen layer: Architecture, DB, API, UI design
├── superpowers/           # ADR + brainstorming records
├── dev/                   # Evolution layer: Dev guides, coding standards
├── test/                  # Evolution layer: Test plans, cases, reports
├── fixes/                 # Evolution layer: Changelog, fix records
└── sql/                   # Database scripts
```

### Agent Team Roles

| Role | Responsibilities | Required Skills |
|------|------------------|-----------------|
| PM | Project management, task distribution | product-requirements, sprint-planning, **design-context** 🆕 |
| PO | Requirements analysis, user stories | product-requirements, user-onboarding, **design-context** 🆕 |
| Architect | System design, technical solutions | writing-plans 🔴, react-best-practices 🔴, code-review, **design-context** 🆕 |
| UI Designer | Interface design, interaction | ui-ux-pro-max, **design-context** 🆕 |
| Frontend | Frontend development | tdd, antfu, ui-ux-pro-max, **design-context** 🆕 |
| Backend | Backend development | tdd, prisma-database-setup, **design-context** 🆕 |
| QA | Testing, verification | tdd, code-review, **design-context** 🆕 |
| DevOps | Deployment, CI/CD | code-review, **design-context** 🆕 |
| Product Experience | User perspective testing | user-onboarding, ui-ux-pro-max, **design-context** 🆕 |

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
| **技能系统** | 10+ 集成技能：TDD、UI/UX、Prisma、React 最佳实践、design-context |
| **文档体系** 🆕 | 冻结层/演化层/ADR 三层文档体系，design-context 技能自动加载 |
| **技能触发** 🆕 | 四层技能触发机制（Rules + Skill + Task + Dynamic） |
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
├── rules/                 # 模块化规则（8 个文件）
│   ├── 06_document_lifecycle.md  # 🆕 文档生命周期（冻结/演化/ADR）
│   └── 07_skill_triggers.md      # 🆕 技能触发规则
├── skills/                # 自定义技能（10+ 技能）
│   ├── design-context/    # 🆕 按角色自动加载设计文档
│   └── ...
├── agents/                # 代理定义（9 个角色）
└── ...

docs/                      # 🆕 项目文档（来自模板）
├── requirements/          # 冻结层：PRD、用户故事、验收标准
├── design/                # 冻结层：架构、数据库、API、UI 设计
├── superpowers/           # ADR + 脑暴记录
├── dev/                   # 演化层：开发指南、编码规范
├── test/                  # 演化层：测试计划、用例、报告
└── ...
```

### Agent Team 角色

| 角色 | 职责 | 必用技能 |
|------|------|---------|
| PM | 项目管理、任务分配 | product-requirements, sprint-planning, **design-context** 🆕 |
| PO | 需求分析、用户故事 | product-requirements, user-onboarding, **design-context** 🆕 |
| 架构师 | 系统设计、技术方案 | writing-plans 🔴, react-best-practices 🔴, code-review, **design-context** 🆕 |
| UI 设计师 | 界面设计、交互规范 | ui-ux-pro-max, **design-context** 🆕 |
| 前端开发 | 前端开发 | tdd, antfu, ui-ux-pro-max, **design-context** 🆕 |
| 后端开发 | 后端开发 | tdd, prisma-database-setup, **design-context** 🆕 |
| QA | 测试验证 | tdd, code-review, **design-context** 🆕 |
| DevOps | 部署运维 | code-review, **design-context** 🆕 |
| 产品体验师 | 用户视角测试 | user-onboarding, ui-ux-pro-max, **design-context** 🆕 |

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

*Template Version: 2.0.0*
*Last Updated: 2026-04-08*
