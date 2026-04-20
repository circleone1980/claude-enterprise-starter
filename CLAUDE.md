# Claude Code 项目模板 v3.0

> 📋 **使用说明**: 复制此目录到新项目的 `.claude/` 目录，根据项目需求修改配置

---

## 零、GStack 产品设计层 (Phase 0.5) 🔴

> **状态**: 可选功能，通过 `automation/agent-orchestration.json` 的 `gstackConfig.enabled` 控制

**启用命令**: `node scripts/gstack-toggle.js --enable`

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

## 四、上下文管理策略 🔴

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

| 角色               | 核心技能 🔴                            | Agent 类型       |
| ------------------ | -------------------------------------- | ---------------- |
| Product Designer   | office-hours, design-consultation    | general-purpose  |
| Design Reviewer    | autoplan                               | general-purpose  |
| PM             | product-requirements                   | planner          |
| Architect      | writing-plans                          | architect        |
| UI Designer    | ui-ux-pro-max, ui-style-selector       | general-purpose  |
| Frontend       | tdd, antfu                             | typescript-reviewer |
| Backend-Java   | springboot-patterns, springboot-tdd    | java-reviewer    |
| Backend-Python | tdd, prisma-database-setup             | python-reviewer  |
| QA             | tdd, verification-loop                 | tdd-guide        |
| DevOps         | code-review, security-review           | general-purpose  |

详细配置: [rules/04_agent_team.md](rules/04_agent_team.md)

---

## 八、团队启动

```bash
# 标准开发团队
claude --team dev

# 全功能团队（含 QA/DevOps/产品体验师）
claude --team full
```

---

## 九、规则加载

- [全局规则](rules/00_global.md) - 语言、启动约束
- [开发约束](rules/01_development.md) - 禁止项、编码规范
- [数据库规范](rules/02_database.md) - SQL设计范式
- [质量门禁](rules/03_quality.md) - 测试覆盖率、代码审查
- [Agent Team 规则](rules/04_agent_team.md) - 角色映射、技能使用
- [安全规范](rules/05_security.md) - 安全边界、敏感数据处理
- [文档生命周期](rules/06_document_lifecycle.md) - 文档分层、冻结/演化规则 🔴
- [技能触发规则](rules/07_skill_triggers.md) - 技能触发时机、动态调用指令 🔴
- [代码注释规范](rules/08_code_comments.md) - 模块头注释、中文函数注释 🔴
- [GStack 集成](rules/09_gstack_integration.md) - Phase 0.5 触发规则 🔴
- [模式选择引擎](rules/10_mode_selection.md) - Team/Subagent 决策 🔴
- [狂暴模式](rules/11_rage_mode.md) - 全自动开发模式 🔴
- [双模型策略](rules/12_dual_model.md) - GLM-5 + GPT-5.4 协作 🔴
- [Team 生命周期](rules/13_team_lifecycle.md) - 创建/解散流程 🔴

---

*模板版本: 3.0.0*
*最后更新: 2026-04-20*
*重大变更: 精简主文件至 10KB 以内，详细规则移至 rules/*
