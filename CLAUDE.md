# Claude Code 项目模板 v3.1

> 📋 **使用说明**: 复制此目录到新项目的 `.claude/` 目录，根据项目需求修改配置

---

## 零、GStack 产品设计层 (Phase 0.5)

> **状态**: 已独立化，无需全局安装 GStack。技能可独立使用。
> **自动触发**: 通过 `automation/agent-orchestration.json` 的 `gstackConfig.enabled` 控制

详细规则: [rules/09_gstack_integration.md](rules/09_gstack_integration.md)

---

## 一、基础规则

**语言**: 中文交互

**项目启动**: 用户手动启动，避免端口冲突

**问题处理**: 先查询 `docs/fixed/` 错误记录

**开发约束**: 禁止 todo/mock/MVP/硬编码

**数据库变更**: 统一使用 `docs/sql/` Python 脚本

**退出前同步**: 必须同步文档到 README.md 和 docs/GUIDE.md

---

## 二、技术栈约束

### 前端（固定）
- React 19+ (Server + Client Components)
- TypeScript strict mode
- Vite 6+
- pnpm 9+
- Vitest + React Testing Library

### 后端（Java + Python 双栈）
- Java 17+ / Spring Boot 3.x / Maven 3.9+
- Python 3.12+ / OpenAI SDK / Anthropic SDK

---

## 三、系统设计标准

**定位**: Staff/Principal Engineer Level

**目标**: Production-grade Enterprise System

**严禁**: MVP/Demo/简化架构/伪代码

**必须满足**: HA、可扩展、可维护、高安全

---

## 四、上下文管理策略

| 上下文使用率 | 状态    | 行动                  |
| ------------ | ------- | --------------------- |
| 0-50%        | 🟢 正常 | 正常工作              |
| 50-70%       | 🟡 注意 | 考虑 `/compact`    |
| 70-90%       | 🟠 警告 | 必须 `/compact`    |
| 90%+         | 🔴 危险 | 必须 `/clear` 重置 |

**优化原则**: 引用而非嵌入、按需加载、渐进披露

---

## 五、文档体系

| 层级  | 路径                                           | 说明                                         |
| ----- | ---------------------------------------------- | -------------------------------------------- |
| 冻结层 | `docs/requirements/`, `docs/design/`       | Phase 1 产出，修改需 ADR                     |
| 演化层 | `docs/dev/`, `docs/test/`, `docs/fixes/` | 持续更新，Agent 可自行修改                   |
| ADR层  | `docs/superpowers/decisions/`                | 设计变更记录                                 |
| 知识层 | `docs/brainstorms/`, `docs/plans/`, `docs/reviews/`, `docs/solutions/` | CE 插件文档流转 |

**核心文档**: PRD、系统架构设计、数据库设计、API 接口设计、UI 设计规范

详细规则: [rules/06_document_lifecycle.md](rules/06_document_lifecycle.md)

---

## 六、质量门禁

每 Feature 必须执行 5 项检查:

1. 功能完整性检测
2. 代码评审
3. 编译与测试
4. 及时更新文档
5. 注释合规（模块头 + 中文函数注释）

详细规则: [rules/03_quality.md](rules/03_quality.md)

---

## 七、Agent Team 配置

| 角色               | 核心技能                            | Agent 类型       |
| ------------------ | -------------------------------------- | ---------------- |
| Product Designer   | office-hours, design-consultation, design-shotgun, design-html    | general-purpose  |
| Design Reviewer    | autoplan, plan-ceo-review, plan-eng-review                               | general-purpose  |
| PM             | product-requirements, ce:brainstorm                   | planner          |
| Architect      | writing-plans, ce:brainstorm, ce:plan                          | architect        |
| Review Champion | adversarial-review, plan-ceo-review, plan-eng-review | general-purpose  |
| UI Designer    | ui-ux-pro-max, ui-style-selector       | general-purpose  |
| Frontend       | tdd, antfu                             | typescript-reviewer |
| Backend-Java   | springboot-patterns, springboot-tdd    | java-reviewer    |
| Backend-Python | tdd, prisma-database-setup             | python-reviewer  |
| QA             | tdd, verification-loop, qa, ce:review  | tdd-guide        |
| DevOps         | code-review, security-review, ce:review | general-purpose  |

详细配置: [rules/04_agent_team.md](rules/04_agent_team.md)

---

## 八、CE 插件集成

> **前置条件**: 全局安装 Compound Engineering 插件
> **集成范围**: 仅需求/设计/评审阶段（不含 /ce:work）

| 技能 | 命令 | 用途 |
|------|------|------|
| 方案脑暴 | `/ce:brainstorm` | ≥2 种实现路径，收敛为需求规格 |
| 经验规划 | `/ce:plan` | 检索历史经验，拆分细粒度任务 |
| 多维评审 | `/ce:review` | 6 类+扩展评审，独立报告 |
| 知识沉淀 | `/ce:compound` | 经验存入 docs/solutions/ |

详细规则: [rules/16_ce_integration.md](rules/16_ce_integration.md)

---

## 九、对抗审查机制

> "左右互搏" — 文档创建过程中引入对立视角审查

| 命令 | 目标文档 | 触发时机 |
|------|---------|---------|
| `/adversarial-review prd` | PRD.md | PM 完成初稿后 |
| `/adversarial-review design` | 01_系统架构设计.md | Architect 完成设计后 |
| `/adversarial-review api` | 03_API接口设计.md | Architect 完成设计后 |
| `/adversarial-review ui` | 04_UI设计规范.md | UI Designer 完成后 |

详细规则: [rules/15_adversarial_review.md](rules/15_adversarial_review.md)

---

## 十、团队启动

```bash
# 标准开发团队
claude --team dev

# 全功能团队（含 QA/DevOps/产品体验师/对抗审查）
claude --team full
```

---

## 十一、规则加载

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
- [双模型策略](rules/12_dual_model.md) - GLM-5 + GPT-5.4 协作
- [Team 生命周期](rules/13_team_lifecycle.md) - 创建/解散流程
- [Worktree 管理](rules/14_worktree.md) - Git Worktree 隔离开发
- [对抗审查规则](rules/15_adversarial_review.md) - 左右互搏文档审查
- [CE 插件集成](rules/16_ce_integration.md) - Compound Engineering 技能映射

---

*模板版本: 3.1.0*
*最后更新: 2026-04-26*
*重大变更: GStack 独立化 + CE 插件集成 + 对抗审查 + /qa 浏览器测试*
