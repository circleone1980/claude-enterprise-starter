# Claude Enterprise Starter

[English](#-english) | [中文](#-中文)

---

## 📖 English

> 🚀 Enterprise-grade Claude Code configuration template with Agent Team orchestration, Rage Mode automation, TDD workflow, and production-ready configurations.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://code.claude.com)
[![Version](https://img.shields.io/badge/Version-2.1.0-green)](./CLAUDE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

### Features

| Feature | Description |
|---------|-------------|
| **Agent Team** | 9 specialized roles collaborating in parallel (PM, PO, Architect, Designer, Frontend, Backend, QA, DevOps, Product Experience) |
| **Rage Mode** 🔴 | Full automation - auto GitHub push, agent health monitoring, phase advancement |
| **TDD Workflow** | Enforced Test-Driven Development with Red-Green-Refactor cycle |
| **Quality Gates** | 4-stage verification: functionality, code review, testing, documentation |
| **Skills System** | 13 integrated skills with advanced frontmatter configuration |
| **Frontmatter Config** 🆕 | `effort`, `paths`, `allowed-tools`, `user-invocable` for precise skill control |
| **UI Style Selector** 🆕 | 60 brand design templates with auto-scenario matching |
| **Tech Stack** 🆕 | React + TypeScript + Vite (fixed), no alternatives allowed |
| **Built-in Skills** 🆕 | `/batch` (parallel refactor), `/simplify` (code quality review) |
| **SSOT Architecture** 🆕 | `automation/agent-orchestration.json` as single source of truth |
| **Per-Role SOP** 🆕 | Standard Operating Procedure for all 9 agent roles |
| **Document System** | Frozen/Evolution/ADR document layers with design-context skill for auto-loading |
| **Skill Triggers** | Global phase flowchart (Phase 1-5) + dynamic trigger rules |
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
├── CLAUDE.md                        # Core instructions (12 sections)
├── settings.json                    # Permissions, hooks, rage mode config
├── settings.local.json              # Local overrides (gitignored)
├── rules/                           # Modular rules (8 files)
│   ├── 00_global.md                 # Language, startup constraints
│   ├── 01_development.md            # Development constraints + tech stack
│   ├── 02_database.md               # Database standards
│   ├── 03_quality.md                # Quality gates
│   ├── 04_agent_team.md             # Agent Team rules (references SSOT)
│   ├── 05_security.md               # Security standards
│   ├── 06_document_lifecycle.md     # Document lifecycle (Frozen/Evolution/ADR)
│   └── 07_skill_triggers.md         # Skill triggers + global phase flowchart
├── skills/                          # Custom skills (13 skills)
│   ├── ui-style-selector/           # UI style auto-selection (60 templates)
│   ├── design-context/              # Auto-load design docs by role
│   ├── tdd/                         # TDD workflow
│   ├── tdd-workflow/                # TDD operation manual
│   ├── code-review/                 # Code review (effort: high)
│   ├── writing-plans/               # Architecture planning (effort: high)
│   ├── product-requirements/        # Requirements analysis (effort: high)
│   ├── user-onboarding/             # FTUE design (effort: high)
│   ├── sprint-planning/             # Sprint planning (effort: medium)
│   ├── ui-ux-pro-max/               # UI/UX best practices (paths: *.tsx)
│   ├── react-best-practices/        # React patterns (auto-activate on .tsx)
│   ├── antfu/                       # ESLint/TS/pnpm/Vitest (auto-activate)
│   └── prisma-database-setup/       # Prisma DB config (paths: *.prisma)
├── agents/                          # Agent definitions with SOP (9 roles)
│   ├── pm.md                        # Project Manager
│   ├── po.md                        # Product Owner
│   ├── architect.md                 # Architect
│   ├── ui-designer.md               # UI Designer
│   ├── frontend.md                  # Frontend Developer
│   ├── backend.md                   # Backend Developer
│   ├── qa.md                        # QA Engineer
│   ├── devops.md                    # DevOps Engineer
│   └── product-experience.md        # Product Experience Tester
├── automation/                      # Automation configs
│   ├── agent-orchestration.json     # SSOT: role-skill mapping
│   ├── rage-mode.json               # Rage mode phases & features
│   ├── phase-gates.json             # Quality gate conditions
│   └── github-integration.json      # GitHub auto-push config
├── hooks/                           # Hook system
│   ├── hooks.json                   # Hook definitions
│   └── scripts/                     # Hook scripts
│       ├── safety-guard.js          # Pre-tool safety check
│       ├── phase-controller.js      # Phase gate validator
│       ├── auto-github-push.js      # Auto push (every 30min)
│       ├── agent-health-monitor.js  # Agent health check (every 5min)
│       └── auto-start-agents.js     # Auto-start agents on team create
├── commands/                        # Slash commands
│   ├── commit.md                    # /commit
│   ├── pr.md                        # /pr
│   └── review.md                    # /review
├── output-styles/                   # Output format variants
│   ├── terse.md                     # Concise output
│   ├── detailed.md                  # Detailed output
│   └── enterprise.md                # Enterprise report format
├── agent-memory/                    # Persistent agent memory
│   └── {role}/MEMORY.md             # Per-agent memory files
└── scripts/                         # Setup scripts
    ├── init.sh                      # Unix setup script
    └── init.ps1                     # Windows setup script

docs/                                # Project documentation (from templates)
├── requirements/                    # Frozen layer: PRD, user stories
│   ├── PRD.md                       # Product Requirements Document
│   ├── user-stories.md              # User stories
│   └── acceptance-criteria.md       # Acceptance criteria
├── design/                          # Frozen layer: System design
│   ├── 01_系统架构设计.md             # Architecture design
│   ├── 02_数据库设计.md               # Database design
│   ├── 03_API接口设计.md              # API design
│   └── 04_UI设计规范.md              # UI design spec
├── dev/                             # Evolution layer: Dev guides
│   ├── 01_开发环境搭建.md             # Environment setup
│   ├── 02_编码规范.md                 # Coding standards
│   └── 03_Git工作流.md               # Git workflow
├── test/                            # Evolution layer: Test docs
│   ├── 01_测试计划.md                 # Test plan
│   ├── 02_测试用例.md                 # Test cases
│   └── 03_验证记录.md                # Verification records
├── fixes/                           # Evolution layer: Fixes
│   └── CHANGELOG.md                 # Changelog
├── sql/                             # Database scripts
├── superpowers/                     # ADR + brainstorming
│   ├── decisions/                   # Architecture Decision Records
│   └── specs/                       # Brainstorming specs
├── templates/                       # 📋 Document templates (copy to use)
│   ├── requirements/
│   ├── design/
│   ├── dev/
│   ├── test/
│   ├── fixes/
│   └── superpowers/
└── GUIDE.md                         # 📖 Detailed usage manual

tips/                                # Reference guides & design resources
├── Claude Code Skills功能指南.md     # Skills optimization guide
└── UI设计风格/                       # 60 brand design templates
    ├── ui风格对照表.md                # Scenario ↔ Style mapping table
    └── design-md/                    # {style}/DESIGN.md per style

.mcp.json                            # MCP server configs (GitHub, Figma, Playwright...)
.worktreeinclude                     # Git worktree config
CLAUDE.local.md.example              # Local config template (gitignored)
QUICKSTART.md                        # 5-minute quick start guide
```

### Skills Frontmatter Configuration

| Skill | effort | paths | Special Config |
|-------|--------|-------|----------------|
| **design-context** | low | - | `user-invocable: false`, `disable-model-invocation: true`, `allowed-tools: Read Grep Glob` |
| **react-best-practices** | - | `**/*.tsx,**/*.jsx` | `user-invocable: false` (auto-activate) |
| **antfu** | - | `**/*.ts,**/*.tsx,**/*.js,**/*.jsx` | `user-invocable: false` (auto-activate) |
| **ui-ux-pro-max** | - | `**/*.tsx,**/*.jsx,**/*.css,**/*.scss,...` | - |
| **prisma-database-setup** | - | `**/*.prisma,prisma.config.ts` | - |
| **code-review** | high | - | Deep multi-dimensional analysis |
| **writing-plans** | high | - | Architecture trade-offs |
| **product-requirements** | high | - | Business logic analysis |
| **user-onboarding** | high | - | User psychology analysis |
| **sprint-planning** | medium | - | Structured process |
| **ui-style-selector** | high | - | 🆕 60 templates scenario matching |
| **tdd** | - | - | Core TDD methodology |
| **tdd-workflow** | low | - | Operation manual level |

### Agent Team Roles

| Role | Responsibilities | Core Skills | Agent Type |
|------|------------------|-------------|------------|
| PM | Project management, task distribution | product-requirements, sprint-planning | planner |
| PO | Requirements analysis, user stories | product-requirements, user-onboarding | general-purpose |
| Architect | System design, technical solutions | writing-plans 🔴, ui-style-selector 🆕, code-review | architect |
| UI Designer | Interface design, interaction | ui-ux-pro-max 🔴, ui-style-selector 🆕 | general-purpose |
| Frontend | Frontend development | tdd 🔴, antfu 🔴, ui-ux-pro-max | typescript-reviewer |
| Backend | Backend development | tdd 🔴, prisma-database-setup 🔴 | python-reviewer |
| QA | Testing, verification | tdd, code-review | tdd-guide |
| DevOps | Deployment, CI/CD | code-review | general-purpose |
| Product Experience | User perspective testing | user-onboarding 🔴, ui-ux-pro-max | planner |

### Frontend Tech Stack (Fixed)

| Technology | Choice | Alternative Prohibited |
|-----------|--------|----------------------|
| Framework | React 19+ | Vue, Angular, Svelte |
| Language | TypeScript (strict) | - |
| Build Tool | Vite | Webpack |
| Package Manager | pnpm | npm, yarn |
| Test Runner | Vitest | Jest |
| Lint | ESLint flat config (antfu) | - |

### UI Style Selection Flow

```
Project Scenario Description
  → Read ui风格对照表.md (60 brand styles × 7 categories)
  → Brainstorm matching (2-3 candidates)
  → User confirms selection
  → Load design-md/{style}/DESIGN.md
  → Output as UI design constraints
```

### Global Phase Flowchart

```
Phase 1: Requirements → PM/PO/Architect parallel → Freeze docs
Phase 2: Development  → Frontend×3/Backend×3 parallel → TDD + Review
Phase 3: Testing      → QA verification → Coverage >80%
Phase 4: UX Review    → Product Experience evaluation
Phase 5: Deployment   → DevOps → GitHub push
```

### Rage Mode Features

| Automation | Trigger |
|------------|---------|
| Auto GitHub push | Every 30 min / phase complete |
| Agent health monitor | Every 5 minutes |
| Auto restart agents | On agent failure |
| Phase advancement | After validation passes |
| Safety guard | Every tool call |

### Usage

> 📖 **For detailed instructions, see the [Usage Guide](docs/GUIDE.md)**

```bash
# Verify installation
/doctor

# Start with Agent Team
/plan Implement user authentication system

# UI style selection (before frontend development)
/ui-style-selector

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
| **技能系统** | 13 个集成技能，全部配置高级 Frontmatter |
| **Frontmatter 配置** 🆕 | `effort`、`paths`、`allowed-tools`、`user-invocable` 精准控制技能调用 |
| **UI 风格选择** 🆕 | 60 个品牌设计模板，基于场景自动匹配 |
| **技术栈固化** 🆕 | React + TypeScript + Vite，禁止替代方案 |
| **内置 Skills** 🆕 | `/batch`（并行重构）、`/simplify`（代码质量审查） |
| **SSOT 架构** 🆕 | `automation/agent-orchestration.json` 单一真相源 |
| **角色 SOP** 🆕 | 全部 9 个角色标准化操作流程 |
| **文档体系** | 冻结层/演化层/ADR 三层文档体系 |
| **技能触发** | 全局阶段流程图（Phase 1-5）+ 动态触发规则 |
| **命令系统** | 自定义斜杠命令：`/commit`、`/pr`、`/review` |

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
├── CLAUDE.md                        # 核心指令文件（12 个章节）
├── settings.json                    # 权限、钩子、狂暴模式配置
├── settings.local.json              # 本地覆盖配置（gitignored）
├── rules/                           # 模块化规则（8 个文件）
│   ├── 00_global.md                 # 语言、启动约束
│   ├── 01_development.md            # 开发约束 + 技术栈固化
│   ├── 02_database.md               # 数据库规范
│   ├── 03_quality.md                # 质量门禁
│   ├── 04_agent_team.md             # Agent Team 规则（引用 SSOT）
│   ├── 05_security.md               # 安全规范
│   ├── 06_document_lifecycle.md     # 文档生命周期（冻结/演化/ADR）
│   └── 07_skill_triggers.md         # 技能触发 + 全局流程图
├── skills/                          # 自定义技能（13 个）
│   ├── ui-style-selector/           # UI 风格自动选择（60 模板）
│   ├── design-context/              # 按角色自动加载设计文档
│   ├── tdd/                         # TDD 工作流
│   ├── tdd-workflow/                # TDD 操作手册
│   ├── code-review/                 # 代码审查 (effort: high)
│   ├── writing-plans/               # 架构规划 (effort: high)
│   ├── product-requirements/        # 需求分析 (effort: high)
│   ├── user-onboarding/             # 用户引导设计 (effort: high)
│   ├── sprint-planning/             # Sprint 规划 (effort: medium)
│   ├── ui-ux-pro-max/               # UI/UX 最佳实践 (paths: *.tsx)
│   ├── react-best-practices/        # React 模式（编辑 .tsx 自动激活）
│   ├── antfu/                       # ESLint/TS/pnpm/Vitest（编辑自动激活）
│   └── prisma-database-setup/       # Prisma 数据库配置 (paths: *.prisma)
├── agents/                          # 代理定义（9 个角色，各含 SOP）
│   ├── pm.md                        # 项目经理
│   ├── po.md                        # 产品负责人
│   ├── architect.md                 # 架构师
│   ├── ui-designer.md               # UI 设计师
│   ├── frontend.md                  # 前端开发
│   ├── backend.md                   # 后端开发
│   ├── qa.md                        # 测试工程师
│   ├── devops.md                    # 运维工程师
│   └── product-experience.md        # 产品体验师
├── automation/                      # 自动化配置
│   ├── agent-orchestration.json     # SSOT：角色-技能映射唯一真相源
│   ├── rage-mode.json               # 狂暴模式阶段与功能
│   ├── phase-gates.json             # 质量门禁条件
│   └── github-integration.json      # GitHub 自动推送配置
├── hooks/                           # 钩子系统
│   ├── hooks.json                   # 钩子定义
│   └── scripts/                     # 钩子脚本
│       ├── safety-guard.js          # 工具调用前安全检查
│       ├── phase-controller.js      # 阶段门禁验证
│       ├── auto-github-push.js      # 自动推送（每 30 分钟）
│       ├── agent-health-monitor.js  # Agent 健康监控（每 5 分钟）
│       └── auto-start-agents.js     # 团队创建时自动启动 Agent
├── commands/                        # 斜杠命令
│   ├── commit.md                    # /commit
│   ├── pr.md                        # /pr
│   └── review.md                    # /review
├── output-styles/                   # 输出风格
│   ├── terse.md                     # 简洁模式
│   ├── detailed.md                  # 详细模式
│   └── enterprise.md                # 企业报告格式
├── agent-memory/                    # Agent 持久化记忆
│   └── {role}/MEMORY.md             # 各角色记忆文件
└── scripts/                         # 安装脚本
    ├── init.sh                      # Unix 安装脚本
    └── init.ps1                     # Windows 安装脚本

docs/                                # 项目文档（来自模板）
├── requirements/                    # 冻结层：PRD、用户故事
│   ├── PRD.md                       # 产品需求文档
│   ├── user-stories.md              # 用户故事
│   └── acceptance-criteria.md       # 验收标准
├── design/                          # 冻结层：系统设计
│   ├── 01_系统架构设计.md             # 架构设计
│   ├── 02_数据库设计.md               # 数据库设计
│   ├── 03_API接口设计.md              # API 设计
│   └── 04_UI设计规范.md              # UI 设计规范
├── dev/                             # 演化层：开发指南
│   ├── 01_开发环境搭建.md             # 环境搭建
│   ├── 02_编码规范.md                 # 编码规范
│   └── 03_Git工作流.md               # Git 工作流
├── test/                            # 演化层：测试文档
│   ├── 01_测试计划.md                 # 测试计划
│   ├── 02_测试用例.md                 # 测试用例
│   └── 03_验证记录.md                # 验证记录
├── fixes/                           # 演化层：修复记录
│   └── CHANGELOG.md                 # 变更日志
├── sql/                             # 数据库脚本
├── superpowers/                     # ADR + 脑暴
│   ├── decisions/                   # 架构决策记录
│   └── specs/                       # 脑暴记录
├── templates/                       # 📋 文档模板（复制使用）
│   ├── requirements/
│   ├── design/
│   ├── dev/
│   ├── test/
│   ├── fixes/
│   └── superpowers/
└── GUIDE.md                         # 📖 详细使用手册

tips/                                # 参考指南与设计资源
├── Claude Code Skills功能指南.md     # Skills 优化指南
└── UI设计风格/                       # 60 个品牌设计模板
    ├── ui风格对照表.md                # 场景 ↔ 风格对照表
    └── design-md/                    # {style}/DESIGN.md

.mcp.json                            # MCP 服务配置（GitHub、Figma、Playwright...）
.worktreeinclude                     # Git worktree 配置
CLAUDE.local.md.example              # 本地配置模板（gitignored）
QUICKSTART.md                        # 5 分钟快速开始
```

### Agent Team 角色

| 角色 | 职责 | 核心技能 | Agent 类型 |
|------|------|---------|-----------|
| PM | 项目管理、任务分配 | product-requirements, sprint-planning | planner |
| PO | 需求分析、用户故事 | product-requirements, user-onboarding | general-purpose |
| 架构师 | 系统设计、技术方案 | writing-plans 🔴, ui-style-selector 🆕, code-review | architect |
| UI 设计师 | 界面设计、交互规范 | ui-ux-pro-max 🔴, ui-style-selector 🆕 | general-purpose |
| 前端开发 | 前端开发 | tdd 🔴, antfu 🔴, ui-ux-pro-max | typescript-reviewer |
| 后端开发 | 后端开发 | tdd 🔴, prisma-database-setup 🔴 | python-reviewer |
| QA | 测试验证 | tdd, code-review | tdd-guide |
| DevOps | 部署运维 | code-review | general-purpose |
| 产品体验师 | 用户视角测试 | user-onboarding 🔴, ui-ux-pro-max | planner |

### 技能 Frontmatter 高级配置

| 技能 | effort | paths | 特殊配置 |
|------|--------|-------|---------|
| **design-context** | low | - | `user-invocable: false`、只读权限、禁用模型调用 |
| **react-best-practices** | - | `**/*.tsx,**/*.jsx` | `user-invocable: false`（自动激活） |
| **antfu** | - | `**/*.ts,**/*.tsx,**/*.js,**/*.jsx` | `user-invocable: false`（自动激活） |
| **ui-ux-pro-max** | - | `**/*.tsx,**/*.jsx,**/*.css,**/*.scss,...` | - |
| **prisma-database-setup** | - | `**/*.prisma,prisma.config.ts` | - |
| **code-review** | high | - | 深度多维度分析 |
| **writing-plans** | high | - | 架构选型权衡 |
| **product-requirements** | high | - | 业务逻辑分析 |
| **user-onboarding** | high | - | 用户心理分析 |
| **sprint-planning** | medium | - | 结构化流程 |
| **ui-style-selector** | high | - | 🆕 60 模板场景匹配 |
| **tdd** | - | - | 核心 TDD 方法论 |
| **tdd-workflow** | low | - | 操作手册级别 |

### 前端技术栈（固化）

| 技术 | 选择 | 禁止替代 |
|------|------|---------|
| 框架 | React 19+ | Vue、Angular、Svelte |
| 语言 | TypeScript (strict) | - |
| 构建工具 | Vite | Webpack |
| 包管理 | pnpm | npm、yarn |
| 测试 | Vitest | Jest |
| Lint | ESLint flat config (antfu) | - |

### UI 风格选择流程

```
项目场景描述
  → 读取 ui风格对照表.md（60 个品牌风格 × 7 大分类）
  → 脑暴匹配（2-3 个候选风格）
  → 用户确认选择
  → 加载 design-md/{style}/DESIGN.md
  → 输出为 UI 设计约束
```

### 全局阶段流程图

```
Phase 1: 需求分析 → PM/PO/Architect 并行 → 冻结层文档
Phase 2: 开发实现 → Frontend×3/Backend×3 并行 → TDD + 代码审查
Phase 3: 测试验证 → QA 验证 → 覆盖率 >80%
Phase 4: 产品体验 → 产品体验师评估
Phase 5: 部署发布 → DevOps → GitHub 推送
```

### 狂暴模式功能

| 自动化 | 触发条件 |
|--------|---------|
| 自动 GitHub 推送 | 每 30 分钟 / 阶段完成 |
| Agent 健康监控 | 每 5 分钟 |
| 自动重启 Agent | Agent 失败时 |
| 阶段自动推进 | 验证通过后 |
| 安全边界守护 | 每次工具调用 |

### 使用方式

> 📖 **详细使用说明请参阅 [使用手册](docs/GUIDE.md)**

```bash
# 验证安装
/doctor

# 使用 Agent Team
/plan 实现用户认证系统

# UI 风格选择（前端开发前）
/ui-style-selector

# 手动启动 Agent
Agent --name "Backend-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "先调用 Skill tdd，然后实现登录 API"
```

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
- [ ] Select UI style with `/ui-style-selector` (before frontend work)
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

*Template Version: 2.1.0*
*Last Updated: 2026-04-09*
