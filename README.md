# Claude Enterprise Starter

[English](#-english) | [中文](#-中文)

---

## 📖 English

> 🚀 Enterprise-grade Claude Code configuration template with Agent Team orchestration, Rage Mode automation, TDD workflow, and production-ready configurations.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://code.claude.com)
[![Version](https://img.shields.io/badge/Version-2.2.0-green)](./CLAUDE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

### Features

| Feature | Description |
|---------|-------------|
| **Agent Team** | 13 specialized roles collaborating in parallel (PM, PO, Architect, Designer, Frontend, Backend-Java, Backend-Python, QA, DevOps, Product Experience, GAN Planner/Generator/Evaluator) |
| **Rage Mode** 🔴 | Full automation - auto GitHub push, agent health monitoring, phase advancement |
| **TDD Workflow** | Enforced Test-Driven Development with Red-Green-Refactor cycle |
| **Quality Gates** | 4-stage verification: functionality, code review, testing, documentation |
| **Skills System** | 27 integrated skills with advanced frontmatter configuration |
| **Backend Dual-Stack** 🆕 | Java + Python backend (SpringBoot + Prisma + LLM + VLM + Workflow) |
| **GAN Harness** 🆕 | Planner→Generator→Evaluator loop for quality-driven development |
| **Hook Reinforcement** 🆕 | 14 hooks covering full lifecycle (commit quality, config protection, edit accumulator) |
| **Continuous Learning** 🆕 | Instinct-based learning system with confidence scoring |
| **Frontmatter Config** | `effort`, `paths`, `allowed-tools`, `user-invocable` for precise skill control |
| **UI Style Selector** | 60 brand design templates with auto-scenario matching |
| **Tech Stack** | React + TypeScript + Vite (frontend fixed), Java + SpringBoot + Python (backend) |
| **SSOT Architecture** | `automation/agent-orchestration.json` as single source of truth |
| **Per-Role SOP** | Standard Operating Procedure for all 13 agent roles |
| **Document System** | Frozen/Evolution/ADR document layers with design-context skill for auto-loading |
| **Skill Triggers** | Global phase flowchart (Phase 1-5) + dynamic trigger rules |
| **Commands** | Custom slash commands: `/commit`, `/pr`, `/review` |

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
├── skills/                          # Custom skills (27 skills)
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
│   ├── prisma-database-setup/       # Prisma DB config (paths: *.prisma)
│   ├── springboot-patterns/         # SpringBoot architecture patterns 🆕
│   ├── springboot-tdd/              # SpringBoot TDD workflow 🆕
│   ├── springboot-security/         # SpringBoot security config 🆕
│   ├── jpa-patterns/                # JPA data access patterns 🆕
│   ├── java-coding-standards/       # Java coding standards 🆕
│   ├── llm-integration/             # LLM API integration 🆕
│   ├── vlm-integration/             # VLM vision model integration 🆕
│   ├── workflow-engine/             # Workflow orchestration 🆕
│   ├── verification-loop/           # 6-phase verification cycle 🆕
│   ├── search-first/                # Research before coding 🆕
│   ├── security-review/             # 10-domain security audit 🆕
│   ├── strategic-compact/           # Strategic context compression 🆕
│   ├── gan-harness/                 # GAN development loop 🆕
│   └── continuous-learning/         # Instinct-based learning 🆕
├── agents/                          # Agent definitions with SOP (14 roles)
│   ├── pm.md                        # Project Manager
│   ├── po.md                        # Product Owner
│   ├── architect.md                 # Architect
│   ├── ui-designer.md               # UI Designer
│   ├── frontend.md                  # Frontend Developer
│   ├── backend-java.md              # Java Backend Developer 🆕
│   ├── backend-python.md            # Python Backend Developer 🆕
│   ├── qa.md                        # QA Engineer
│   ├── devops.md                    # DevOps Engineer
│   ├── product-experience.md        # Product Experience Tester
│   ├── gan-planner.md               # GAN Product Spec Designer 🆕
│   ├── gan-generator.md             # GAN Code Generator 🆕
│   └── gan-evaluator.md             # GAN Quality Evaluator 🆕
├── automation/                      # Automation configs
│   ├── agent-orchestration.json     # SSOT: role-skill mapping
│   ├── rage-mode.json               # Rage mode phases & features
│   ├── phase-gates.json             # Quality gate conditions
│   └── github-integration.json      # GitHub auto-push config
├── hooks/                           # Hook system
│   ├── hooks.json                   # Hook definitions
│   └── scripts/                     # Hook scripts (14 scripts)
│       ├── safety-guard.js          # Pre-tool safety check
│       ├── phase-controller.js      # Phase gate validator
│       ├── auto-github-push.js      # Auto push (every 30min)
│       ├── agent-health-monitor.js  # Agent health check (every 5min)
│       ├── auto-start-agents.js     # Auto-start agents on team create
│       ├── block-no-verify.js       # Block git push --no-verify 🆕
│       ├── commit-quality.js        # Pre-commit: console.log + secrets detection 🆕
│       ├── suggest-compact.js       # Suggest /compact at logical boundaries 🆕
│       ├── config-protection.js     # Block linter/formatter config changes 🆕
│       ├── edit-accumulator.js      # Accumulate edited files for batch processing 🆕
│       ├── console-warn.js          # Detect console.log in edits 🆕
│       ├── format-typecheck.js      # Batch format + typecheck on stop 🆕
│       ├── doc-sync-check.js        # Remind to sync docs on stop 🆕
│       └── session-evaluate.js      # Session evaluation on stop 🆕
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
| **ui-style-selector** | high | - | 60 templates scenario matching |
| **tdd** | - | - | Core TDD methodology |
| **tdd-workflow** | low | - | Operation manual level |
| **springboot-patterns** | high | - | SpringBoot architecture patterns 🆕 |
| **springboot-tdd** | high | - | SpringBoot TDD workflow 🆕 |
| **springboot-security** | high | - | SpringBoot security config 🆕 |
| **jpa-patterns** | - | - | JPA data access patterns 🆕 |
| **java-coding-standards** | - | - | Java coding standards 🆕 |
| **llm-integration** | - | - | LLM API integration 🆕 |
| **vlm-integration** | - | - | VLM vision model integration 🆕 |
| **workflow-engine** | high | - | Workflow orchestration 🆕 |
| **verification-loop** | high | - | 6-phase verification cycle 🆕 |
| **search-first** | medium | - | Research before coding 🆕 |
| **security-review** | high | - | 10-domain security audit 🆕 |
| **strategic-compact** | low | - | Strategic context compression 🆕 |
| **gan-harness** | high | - | GAN development loop 🆕 |
| **continuous-learning** | low | - | Instinct-based learning 🆕 |

### Agent Team Roles

| Role | Responsibilities | Core Skills | Agent Type |
|------|------------------|-------------|------------|
| PM | Project management, task distribution | product-requirements, sprint-planning | planner |
| PO | Requirements analysis, user stories | product-requirements, user-onboarding | general-purpose |
| Architect | System design, technical solutions | writing-plans 🔴, ui-style-selector, code-review | architect |
| UI Designer | Interface design, interaction | ui-ux-pro-max 🔴, ui-style-selector | general-purpose |
| Frontend | Frontend development | tdd 🔴, antfu 🔴, ui-ux-pro-max | typescript-reviewer |
| Backend-Java | Java backend (SpringBoot + JPA) | springboot-patterns 🔴, springboot-tdd 🔴, jpa-patterns | java-reviewer |
| Backend-Python | Python backend (Prisma + LLM) | tdd 🔴, prisma-database-setup 🔴, llm-integration | python-reviewer |
| QA | Testing, verification | tdd, verification-loop 🔴, code-review | tdd-guide |
| DevOps | Deployment, CI/CD | code-review | general-purpose |
| Product Experience | User perspective testing | user-onboarding 🔴, ui-ux-pro-max | planner |
| GAN Planner | Product spec design | gan-harness | general-purpose |
| GAN Generator | Code implementation | gan-harness | general-purpose |
| GAN Evaluator | Quality evaluation | gan-harness | general-purpose |

### Frontend Tech Stack (Fixed)

| Technology | Choice | Alternative Prohibited |
|-----------|--------|----------------------|
| Framework | React 19+ | Vue, Angular, Svelte |
| Language | TypeScript (strict) | - |
| Build Tool | Vite | Webpack |
| Package Manager | pnpm | npm, yarn |
| Test Runner | Vitest | Jest |
| Lint | ESLint flat config (antfu) | - |

### Backend Tech Stack (Dual-Stack)

| Technology | Java Stack | Python Stack |
|-----------|------------|--------------|
| Runtime | Java 17+ | Python 3.12+ |
| Framework | Spring Boot 3.x | Prisma + FastAPI |
| Build | Maven/Gradle | pip/poetry |
| Testing | JUnit 5 + Mockito | pytest |
| Data Access | JPA/Hibernate | Prisma Client |
| Security | springboot-security | Custom middleware |
| LLM/VLM | llm-integration + vlm-integration | llm-integration + vlm-integration |
| Workflow | Spring Statemachine / Flowable | Prefect / Temporal |

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
Phase 2: Development  → Frontend×3/Backend-Java×2/Backend-Python×1 parallel → TDD + Review
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

# Manual agent start (Java backend)
Agent --name "Backend-Java-1" \
  --subagent-type "everything-claude-code:java-reviewer" \
  --prompt "Use Skill springboot-patterns, then Skill springboot-tdd, then implement login API"

# Manual agent start (Python backend)
Agent --name "Backend-Python-1" \
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
| **Agent Team** | 13 个专业角色并行协作（PM、PO、架构师、设计师、前端、Java后端、Python后端、QA、DevOps、产品体验师、GAN 规划/生成/评估） |
| **狂暴模式** 🔴 | 全自动开发 - 自动 GitHub 推送、Agent 监控、阶段推进 |
| **TDD 工作流** | 强制测试驱动开发，Red-Green-Refactor 循环 |
| **质量门禁** | 4 阶段验证：功能、代码审查、测试、文档 |
| **技能系统** | 27 个集成技能，全部配置高级 Frontmatter |
| **后端双栈** 🆕 | Java + Python 后端（SpringBoot + Prisma + LLM + VLM + Workflow） |
| **GAN Harness** 🆕 | Planner→Generator→Evaluator 循环，质量驱动开发 |
| **Hook 强化** 🆕 | 14 个 Hooks 覆盖全生命周期（提交质量、配置保护、编辑累积器） |
| **持续学习** 🆕 | 基于本能的学习系统，置信度评分 |
| **Frontmatter 配置** | `effort`、`paths`、`allowed-tools`、`user-invocable` 精准控制技能调用 |
| **UI 风格选择** | 60 个品牌设计模板，基于场景自动匹配 |
| **技术栈** | React + TypeScript + Vite（前端固化），Java + SpringBoot + Python（后端） |
| **SSOT 架构** | `automation/agent-orchestration.json` 单一真相源 |
| **角色 SOP** | 全部 13 个角色标准化操作流程 |
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
├── skills/                          # 自定义技能（27 个）
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
│   ├── prisma-database-setup/       # Prisma 数据库配置 (paths: *.prisma)
│   ├── springboot-patterns/         # SpringBoot 架构模式 🆕
│   ├── springboot-tdd/              # SpringBoot TDD 工作流 🆕
│   ├── springboot-security/         # SpringBoot 安全配置 🆕
│   ├── jpa-patterns/                # JPA 数据访问模式 🆕
│   ├── java-coding-standards/       # Java 编码规范 🆕
│   ├── llm-integration/             # LLM API 集成 🆕
│   ├── vlm-integration/             # VLM 视觉模型集成 🆕
│   ├── workflow-engine/             # 工作流编排 🆕
│   ├── verification-loop/           # 6 阶段验证循环 🆕
│   ├── search-first/                # 编码前先研究 🆕
│   ├── security-review/             # 10 域安全审查 🆕
│   ├── strategic-compact/           # 战略性上下文压缩 🆕
│   ├── gan-harness/                 # GAN 开发循环 🆕
│   └── continuous-learning/         # 基于本能的持续学习 🆕
├── agents/                          # 代理定义（14 个角色，各含 SOP）
│   ├── pm.md                        # 项目经理
│   ├── po.md                        # 产品负责人
│   ├── architect.md                 # 架构师
│   ├── ui-designer.md               # UI 设计师
│   ├── frontend.md                  # 前端开发
│   ├── backend-java.md              # Java 后端开发 🆕
│   ├── backend-python.md            # Python 后端开发 🆕
│   ├── qa.md                        # 测试工程师
│   ├── devops.md                    # 运维工程师
│   ├── product-experience.md        # 产品体验师
│   ├── gan-planner.md               # GAN 产品规格设计 🆕
│   ├── gan-generator.md             # GAN 代码生成 🆕
│   └── gan-evaluator.md             # GAN 质量评估 🆕
├── automation/                      # 自动化配置
│   ├── agent-orchestration.json     # SSOT：角色-技能映射唯一真相源
│   ├── rage-mode.json               # 狂暴模式阶段与功能
│   ├── phase-gates.json             # 质量门禁条件
│   └── github-integration.json      # GitHub 自动推送配置
├── hooks/                           # 钩子系统
│   ├── hooks.json                   # 钩子定义
│   └── scripts/                     # 钩子脚本（14 个）
│       ├── safety-guard.js          # 工具调用前安全检查
│       ├── phase-controller.js      # 阶段门禁验证
│       ├── auto-github-push.js      # 自动推送（每 30 分钟）
│       ├── agent-health-monitor.js  # Agent 健康监控（每 5 分钟）
│       ├── auto-start-agents.js     # 团队创建时自动启动 Agent
│       ├── block-no-verify.js       # 阻止 git push --no-verify 🆕
│       ├── commit-quality.js        # 提交前 console.log + 密钥检测 🆕
│       ├── suggest-compact.js       # 建议压缩上下文 🆕
│       ├── config-protection.js     # 阻止修改 linter/构建配置 🆕
│       ├── edit-accumulator.js      # 累积编辑文件路径 🆕
│       ├── console-warn.js          # 检测 console.log 🆕
│       ├── format-typecheck.js      # Stop 时批量格式化+类型检查 🆕
│       ├── doc-sync-check.js        # Stop 时提醒同步文档 🆕
│       └── session-evaluate.js      # Stop 时评估会话 🆕
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
| 架构师 | 系统设计、技术方案 | writing-plans 🔴, ui-style-selector, code-review | architect |
| UI 设计师 | 界面设计、交互规范 | ui-ux-pro-max 🔴, ui-style-selector | general-purpose |
| 前端开发 | 前端开发 | tdd 🔴, antfu 🔴, ui-ux-pro-max | typescript-reviewer |
| Java 后端 | Java 后端（SpringBoot + JPA） | springboot-patterns 🔴, springboot-tdd 🔴, jpa-patterns | java-reviewer |
| Python 后端 | Python 后端（Prisma + LLM） | tdd 🔴, prisma-database-setup 🔴, llm-integration | python-reviewer |
| QA | 测试验证 | tdd, verification-loop 🔴, code-review | tdd-guide |
| DevOps | 部署运维 | code-review | general-purpose |
| 产品体验师 | 用户视角测试 | user-onboarding 🔴, ui-ux-pro-max | planner |
| GAN 规划器 | 产品规格设计 | gan-harness | general-purpose |
| GAN 生成器 | 代码实现 | gan-harness | general-purpose |
| GAN 评估器 | 质量评估 | gan-harness | general-purpose |

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
| **ui-style-selector** | high | - | 60 模板场景匹配 |
| **tdd** | - | - | 核心 TDD 方法论 |
| **tdd-workflow** | low | - | 操作手册级别 |
| **springboot-patterns** | high | - | SpringBoot 架构模式 🆕 |
| **springboot-tdd** | high | - | SpringBoot TDD 工作流 🆕 |
| **springboot-security** | high | - | SpringBoot 安全配置 🆕 |
| **jpa-patterns** | - | - | JPA 数据访问模式 🆕 |
| **java-coding-standards** | - | - | Java 编码规范 🆕 |
| **llm-integration** | - | - | LLM API 集成 🆕 |
| **vlm-integration** | - | - | VLM 视觉模型集成 🆕 |
| **workflow-engine** | high | - | 工作流编排 🆕 |
| **verification-loop** | high | - | 6 阶段验证循环 🆕 |
| **search-first** | medium | - | 编码前先研究 🆕 |
| **security-review** | high | - | 10 域安全审查 🆕 |
| **strategic-compact** | low | - | 战略性上下文压缩 🆕 |
| **gan-harness** | high | - | GAN 开发循环 🆕 |
| **continuous-learning** | low | - | 基于本能的持续学习 🆕 |

### 前端技术栈（固化）

| 技术 | 选择 | 禁止替代 |
|------|------|---------|
| 框架 | React 19+ | Vue、Angular、Svelte |
| 语言 | TypeScript (strict) | - |
| 构建工具 | Vite | Webpack |
| 包管理 | pnpm | npm、yarn |
| 测试 | Vitest | Jest |
| Lint | ESLint flat config (antfu) | - |

### 后端技术栈（双栈）

| 技术 | Java 栈 | Python 栈 |
|------|---------|----------|
| 运行时 | Java 17+ | Python 3.12+ |
| 框架 | Spring Boot 3.x | Prisma + FastAPI |
| 构建 | Maven/Gradle | pip/poetry |
| 测试 | JUnit 5 + Mockito | pytest |
| 数据访问 | JPA/Hibernate | Prisma Client |
| 安全 | springboot-security | 自定义中间件 |
| LLM/VLM | llm-integration + vlm-integration | llm-integration + vlm-integration |
| 工作流 | Spring Statemachine / Flowable | Prefect / Temporal |

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
Phase 2: 开发实现 → Frontend×3/Backend-Java×2/Backend-Python×1 并行 → TDD + 代码审查
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

# 手动启动 Agent（Java 后端）
Agent --name "Backend-Java-1" \
  --subagent-type "everything-claude-code:java-reviewer" \
  --prompt "先调用 Skill springboot-patterns，再调用 Skill springboot-tdd，然后实现登录 API"

# 手动启动 Agent（Python 后端）
Agent --name "Backend-Python-1" \
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

*Template Version: 2.2.0*
*Last Updated: 2026-04-09*
