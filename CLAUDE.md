# Claude Code 项目模板 v4.1

> 📋 **使用说明**: 复制此目录到新项目的 `.claude/` 目录，根据项目需求修改配置

---

## 一、入口规则（SessionStart 自动注入）

> **状态**: 每次会话启动时，`using-ce-framework` 元技能通过 SessionStart Hook 自动注入
> **你不需要手动调用** — 它已经在你的上下文中
> **如果看不到 Iron Laws 和 Red Flags 表**，说明注入失败，检查 `hooks/hooks.json` 的 SessionStart 配置

**核心规则**:
1. **1% 规则** — 只要有 1% 可能性某个 Skill 适用，必须先调用
2. **Iron Laws** — 6 条铁律不可违反（TDD / 验证 / 调试 / Review / 阶段 / 追踪）
3. **Hard Gates** — 门禁由 PreToolUse Hook 强制执行，不可绕过
4. **SUBAGENT-STOP** — 子 agent 跳过元技能，直接执行任务

详细规则: [rules/18_entry_management.md](rules/18_entry_management.md)

---

## 二、GStack 产品设计层 (Phase 0.5)

> **状态**: 已独立化，无需全局安装 GStack。技能可独立使用。
> **自动触发**: 通过 `automation/agent-orchestration.json` 的 `gstackConfig.enabled` 控制

详细规则: [rules/09_gstack_integration.md](rules/09_gstack_integration.md)

---

## 三、前置插件（必需）

> **安装**: `bash scripts/install-prerequisites.sh` 或 `powershell scripts\install-prerequisites.ps1`
> **更新**: `claude plugin update <name>` + `cd ~/.claude/skills/gstack && git pull && ./setup`

| 插件/部署 | 提供内容 | 安装方式 |
|-----------|---------|---------|
| superpowers | test-driven-development, systematic-debugging, requesting/receiving-code-review, writing-plans | `claude plugin install superpowers` |
| ecc | springboot-*, jpa-patterns, java-coding-standards, verification-loop, search-first, security-review, strategic-compact, continuous-learning, gan-style-harness, code-review（本地+PR 双模式） | `claude plugin install ecc` |
| compound-engineering | ce-brainstorm, ce-plan, ce-work, ce-review, ce-compound | `claude plugin install compound-engineering` |
| ui-ux-pro-max | UI/UX 设计智能 | `claude plugin install ui-ux-pro-max` |
| code-review | GitHub PR 审查（多 agent 并行 + 置信度过滤） | `claude plugin install code-review` |
| openai-codex | GPT-5.5 代码审查 (`/codex:review`/`rescue`/`adversarial-review`) | `claude plugin install codex` |
| GStack (本地部署) | office-hours, design-*, autoplan, plan-*-review | 前置: [Bun](https://bun.sh)；`git clone` + `./setup` |

详细安装: [scripts/install-prerequisites.sh](scripts/install-prerequisites.sh)

---

## 四、基础规则

**语言**: 中文交互

**项目启动**: 用户手动启动，避免端口冲突

**问题处理**: 先查询 `docs/fixed/` 错误记录

**开发约束**: 禁止 todo/mock/MVP/硬编码

**数据库变更**: 统一使用 `docs/sql/` Python 脚本

**退出前同步**: 必须同步文档到 README.md 和 docs/GUIDE.md

---

## 五、技术栈约束

### 前端（固定）
- React 19+ (Server + Client Components)
- TypeScript strict mode
- Vite 6+
- pnpm 9+
- Vitest + React Testing Library

### 后端（Python 默认，Java 可选）
- Python 3.12+ / FastAPI / uv
- OpenAI SDK / Anthropic SDK
- Java 17+ / Spring Boot 3.x（需 ADR 审批）

---

## 六、系统设计标准

**定位**: Staff/Principal Engineer Level

**目标**: Production-grade Enterprise System

**严禁**: MVP/Demo/简化架构/伪代码

**必须满足**: HA、可扩展、可维护、高安全

---

## 七、上下文管理策略

| 上下文使用率 | 状态    | 行动                  |
| ------------ | ------- | --------------------- |
| 0-50%        | 🟢 正常 | 正常工作              |
| 50-70%       | 🟡 注意 | 考虑 `/compact`    |
| 70-90%       | 🟠 警告 | 必须 `/compact`    |
| 90%+         | 🔴 危险 | 必须 `/clear` 重置 |

**优化原则**: 引用而非嵌入、按需加载、渐进披露

---

## 八、文档体系

| 层级  | 路径                                           | 说明                                         |
| ----- | ---------------------------------------------- | -------------------------------------------- |
| 冻结层 | `docs/requirements/`, `docs/design/`       | Phase 1 产出，修改需 ADR                     |
| 演化层 | `docs/dev/`, `docs/test/`, `docs/fixes/` | 持续更新，Agent 可自行修改                   |
| ADR层  | `docs/superpowers/decisions/`                | 设计变更记录                                 |
| 知识层 | `docs/brainstorms/`, `docs/plans/`, `docs/reviews/`, `docs/solutions/` | CE 插件文档流转 |

**核心文档**: PRD、系统架构设计、数据库设计、API 接口设计、UI 设计规范

详细规则: [rules/06_document_lifecycle.md](rules/06_document_lifecycle.md)

---

## 九、质量门禁

每 Feature 必须执行 5 项检查:

1. 功能完整性检测
2. 代码评审
3. 编译与测试
4. 及时更新文档
5. 注释合规（模块头 + 中文函数注释）

详细规则: [rules/03_quality.md](rules/03_quality.md)

---

## 十、Agent Team 配置

| 角色               | 核心技能                            | Agent 类型       |
| ------------------ | -------------------------------------- | ---------------- |
| **Brainstormer** | ce-brainstorm, design-context                   | planner          |
| Product Designer   | office-hours, design-consultation, design-shotgun, design-html    | general-purpose  |
| Design Reviewer    | autoplan, plan-ceo-review, plan-eng-review                               | general-purpose  |
| PM             | product-requirements, ce-brainstorm                   | planner          |
| Architect      | writing-plans, ce-brainstorm, ce-plan                          | architect        |
| Review Champion | adversarial-review, ce-review, ce-brainstorm | general-purpose  |
| UI Designer    | ui-ux-pro-max, ui-style-selector       | general-purpose  |
| Frontend       | test-driven-development, antfu, ce-work                    | typescript-reviewer |
| Backend-Python | test-driven-development, prisma-database-setup, ce-work    | python-reviewer  |
| Backend-Java   | springboot-patterns, springboot-tdd, ce-work | java-reviewer    |
| QA             | test-driven-development, verification-loop, qa, ce-review  | tdd-guide        |
| DevOps         | ce-review, ce-compound | general-purpose  |
| Knowledge Compounder | ce-compound                       | general-purpose  |

> **Brainstormer** 是 Phase 0 专用 Agent，在 PM 写 PRD 前与用户进行产品构思。
> **Backend-Python** 为默认后端，Backend-Java 需 ADR 审批。

详细配置: [rules/04_agent_team.md](rules/04_agent_team.md)

---

## 十一、CE 插件集成

> **前置条件**: CE 插件为**必需依赖**，未安装阻塞阶段推进
> **集成范围**: 全阶段 5 技能全覆盖（brainstorm/plan/work/review/compound）
> **安装指南**: `docs/CE-SETUP.md` | **健康检查**: `node scripts/ce-health-check.js`

| 技能 | 命令 | 用途 |
|------|------|------|
| 方案脑暴 | `/ce-brainstorm` | ≥2 种实现路径，收敛为需求规格 |
| 经验规划 | `/ce-plan` | 检索历史经验，拆分细粒度任务 |
| 核心执行 | `/ce-work` | 单任务迭代 + TDD + 进度追踪（Phase 2 核心） |
| 多维评审 | `/ce-review` | 6 类+扩展评审，独立报告 |
| 知识沉淀 | `/ce-compound` | 经验存入 docs/solutions/（阶段转换自动触发） |

详细规则: [rules/16_ce_integration.md](rules/16_ce_integration.md)

---

## 十二、对抗审查机制

> "左右互搏" — 文档创建过程中引入对立视角审查

| 命令 | 目标文档 | 触发时机 |
|------|---------|---------|
| `/adversarial-review prd` | PRD.md | PM 完成初稿后 |
| `/adversarial-review design` | 01_系统架构设计.md | Architect 完成设计后 |
| `/adversarial-review api` | 03_API接口设计.md | Architect 完成设计后 |
| `/adversarial-review ui` | 04_UI设计规范.md | UI Designer 完成后 |

详细规则: [rules/15_adversarial_review.md](rules/15_adversarial_review.md)

---

## 十三、团队启动

```bash
# 标准开发团队
claude --team dev

# 全功能团队（含 QA/DevOps/产品体验师/对抗审查/知识沉淀）
claude --team full
```

---

## 十四、规则加载

- [全局规则](rules/00_global.md) - 语言、启动约束
- [开发约束](rules/01_development.md) - 禁止项、编码规范
- [数据库规范](rules/02_database.md) - SQL设计范式
- [质量门禁](rules/03_quality.md) - 测试覆盖率、代码审查
- [Agent Team 规则](rules/04_agent_team.md) - 角色映射、技能使用
- [安全规范](rules/05_security.md) - 安全边界、敏感数据处理
- [文档生命周期](rules/06_document_lifecycle.md) - 文档分层、冻结/演化规则
- [技能触发规则](rules/07_skill_triggers.md) - 技能触发时机、动态调用指令
- [代码注释规范](rules/08_code_comments.md) - 模块头注释、中文函数注释
- [GStack 集成](rules/09_gstack_integration.md) - Phase 0.5 触发规则（已独立化）
- [模式选择引擎](rules/10_mode_selection.md) - Team/Subagent 决策
- [狂暴模式](rules/11_rage_mode.md) - 全自动开发模式
- [双模型策略](rules/12_dual_model.md) - GLM-5.1 + GPT-5.5 协作
- [Team 生命周期](rules/13_team_lifecycle.md) - 创建/解散流程
- [Worktree 管理](rules/14_worktree.md) - Git Worktree 隔离开发
- [对抗审查规则](rules/15_adversarial_review.md) - 左右互搏文档审查
- [CE 插件集成](rules/16_ce_integration.md) - Compound Engineering 技能映射
- [过程追踪规则](rules/17_process_trace.md) - 产出物过程记录、门禁追踪检查
- [入口管理规则](rules/18_entry_management.md) - SessionStart 注入 + PreToolUse 门禁 + 元技能

### 执行工具

- **全生命周期执行计划**: [docs/LIFECYCLE-EXECUTION-PLAN.md](docs/LIFECYCLE-EXECUTION-PLAN.md) — 每 Phase 的 Agent/Skill/产出物/门禁
- **阶段 prompt 生成**: `bash scripts/orchestrate.sh --phase=N` — 生成可执行的 Agent 启动指令
- **缺口检测**: `node scripts/gap-detector.js --phase=N` — 检测产出物/过程追踪/门禁缺口
- **workspace 清理**: `node scripts/workspace-cleanup.js` — 清理 workspace 以便重新执行

---

*模板版本: 5.0.0*
*最后更新: 2026-04-27*
*重大变更: 插件优先架构 — 本地技能 42→15，superpowers/ecc/CE/ui-ux-pro-max 插件 + GStack 本地部署*
*重大变更: 入口管理系统（SessionStart 注入 + PreToolUse 门禁 + using-ce-framework 元技能）*
