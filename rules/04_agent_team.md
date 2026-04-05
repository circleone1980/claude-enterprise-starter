# Agent Team 强制规则

> 🔴 最高优先级 - 强制执行

---

## 角色强制映射表

| 角色 | 必用 Skill | 必用 Agent (subagent-type) |
|------|-----------|---------------------------|
| **PM** | `product-requirements`, `sprint-planning` | `everything-claude-code:planner` |
| **PO** | `product-requirements`, `sprint-planning`, `user-onboarding` | `general-purpose` |
| **Architect** | `product-requirements`, `react-best-practices` 🔴, `ui-ux-pro-max`, `code-review` | `everything-claude-code:architect` |
| **UI Designer** | `ui-ux-pro-max` 🔴 | `general-purpose` + Figma MCP |
| **Frontend** | `tdd` 🔴, `antfu` 🔴, `ui-ux-pro-max --stack react`, `code-review` | `everything-claude-code:typescript-reviewer` |
| **Backend** | `tdd` 🔴, `prisma-database-setup` 🔴, `code-review` | `everything-claude-code:python-reviewer`, `everything-claude-code:database-reviewer` |
| **QA** | `tdd`, `code-review` | `everything-claude-code:tdd-guide` + Playwright MCP |
| **DevOps** | `code-review` | `general-purpose` + GitHub MCP |
| **产品体验师** | `user-onboarding` 🔴, `product-requirements`, `ui-ux-pro-max` | `everything-claude-code:planner` + Playwright MCP |

> 🔴 标记为该角色核心必用技能

---

## 启动 Agent 标准格式

```bash
# 后端开发 - 标准
Agent --name "Backend-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "你是后端开发。必须遵循以下流程：
    1. 🔴 调用 Skill tdd 启动 TDD 流程（垂直切片模式）
    2. 编写测试用例（Red 阶段）
    3. 实现代码（Green 阶段）
    4. 重构优化（Refactor 阶段）
    5. 使用 code-review 审查代码质量
    6. 如涉及数据库，使用 database-reviewer 审查 SQL
    7. 确保测试覆盖率 >80%
    任务：..."

# 前端开发 - 标准
Agent --name "Frontend-1" \
  --subagent-type "everything-claude-code:typescript-reviewer" \
  --prompt "你是前端开发。必须遵循以下流程：
    1. 调用 Skill ui-ux-pro-max --stack react 获取 React 最佳实践
    2. 🔴 调用 Skill tdd 启动 TDD 流程（垂直切片模式）
    3. 编写测试用例（Red 阶段）
    4. 实现组件代码（Green 阶段）
    5. 重构优化（Refactor 阶段）
    6. 使用 code-review 审查代码
    7. 确保测试覆盖率 >80%
    任务：..."

# UI 设计师 - 标准
Agent --name "UI-Designer" \
  --subagent-type "general-purpose" \
  --prompt "你是 UI 设计师。必须遵循以下流程：
    1. 🔴 调用 Skill ui-ux-pro-max --design-system 获取设计系统指导
    2. 使用 Figma MCP 获取设计上下文 (get_design_context)
    3. 生成 UI 组件代码
    4. 确保设计符合 ui-ux-pro-max 最佳实践
    任务：..."

# 产品体验师 - 标准
Agent --name "产品体验师" \
  --subagent-type "everything-claude-code:planner" \
  --prompt "你是产品体验师。必须遵循以下流程：
    1. 🔴 调用 Skill user-onboarding 设计用户引导
    2. 调用 Skill product-requirements 理解产品功能
    3. 调用 Skill ui-ux-pro-max 获取 UX 评估标准
    4. 使用 Playwright MCP 模拟用户操作
    5. 从易用性、效率、一致性等维度评估体验
    6. 发现交互痛点、流程断点、认知负担
    7. 输出 Onboarding & Activation Pack
    任务：..."
```

---

## 各角色详细技能说明

### PM (项目经理)
- `product-requirements` - 需求理解和拆解
- `sprint-planning` - Sprint 规划和任务分配

### PO (产品经理)
- `product-requirements` - 需求分析和 PRD 编写
- `sprint-planning` - 需求优先级排序
- `user-onboarding` - 用户引导策略

### Architect (架构师)
- `product-requirements` - 理解需求上下文
- `react-best-practices` 🔴 - **核心技能**，40+ React/Next.js 架构优化规则
- `ui-ux-pro-max` - UI/UX 架构设计指导
- `code-review` - 架构和代码质量审查

### UI Designer (UI 设计师)
- `ui-ux-pro-max` 🔴 - **核心技能**，包含 50+ 设计风格、161 配色方案、99 UX 准则

### Frontend (前端开发)
- `tdd` 🔴 - **核心技能**，Red-Green-Refactor 垂直切片模式
- `antfu` 🔴 - **核心技能**，Anthony Fu 的前端工具链最佳实践（ESLint、TypeScript、pnpm、Vitest）
- `ui-ux-pro-max --stack react` - React 栈最佳实践
- `code-review` - 代码质量审查

### Backend (后端开发)
- `tdd` 🔴 - **核心技能**，Red-Green-Refactor 垂直切片模式
- `prisma-database-setup` 🔴 - **核心技能**，Prisma ORM 数据库配置指南
- `code-review` - 代码质量审查

### QA (测试工程师)
- `tdd` - TDD 方法论验证
- `code-review` - 测试代码质量审查
- Playwright MCP - E2E 自动化测试

### DevOps (运维工程师)
- `code-review` - 部署脚本和配置审查
- GitHub MCP - 仓库和 CI/CD 管理

### 产品体验师
- `user-onboarding` 🔴 - **核心技能**，FTUE 设计、激活/Aha moment 定义
- `product-requirements` - 产品功能理解
- `ui-ux-pro-max` - UX 评估标准
- Playwright MCP - 用户体验自动化测试

---

## 禁止行为

- ❌ 禁止创建不指定 subagent-type 的 Agent
- ❌ 禁止 Prompt 中不包含 Skill 调用指令
- ❌ 禁止后端开发不使用 TDD
- ❌ 禁止前端开发不使用 TDD
- ❌ 禁止任何开发角色跳过代码审查
- ❌ **禁止直接编写代码（必须先规划 → TDD → 实现 → 审查）**

---

## 开发前检查清单（必须完成）

**后端开发**:
- [ ] 1. 🔴 调用 `Skill tdd` 启动 TDD 流程
- [ ] 2. 编写测试用例（Red 阶段）
- [ ] 3. 实现代码（Green 阶段）
- [ ] 4. 重构优化（Refactor 阶段）
- [ ] 5. 调用 `Skill code-review` 审查代码
- [ ] 6. 确保测试覆盖率 >80%

**前端开发**:
- [ ] 1. 调用 `Skill ui-ux-pro-max --stack react`
- [ ] 2. 🔴 调用 `Skill tdd` 启动 TDD 流程
- [ ] 3. 编写测试用例（Red 阶段）
- [ ] 4. 实现组件代码（Green 阶段）
- [ ] 5. 重构优化（Refactor 阶段）
- [ ] 6. 调用 `Skill code-review` 审查代码
- [ ] 7. 确保测试覆盖率 >80%

**UI 设计**:
- [ ] 1. 🔴 调用 `Skill ui-ux-pro-max --design-system`
- [ ] 2. 使用 Figma MCP 获取设计上下文
- [ ] 3. 确保符合设计系统规范

**产品体验测试**:
- [ ] 1. 🔴 调用 `Skill user-onboarding`
- [ ] 2. 调用 `Skill product-requirements` 理解功能
- [ ] 3. 调用 `Skill ui-ux-pro-max` 获取 UX 标准
- [ ] 4. 使用 Playwright MCP 模拟用户操作
- [ ] 5. 输出体验报告

---

## 技能文件位置

| 技能 | 路径 |
|------|------|
| product-requirements | `skills/product-requirements/SKILL.md` |
| sprint-planning | `skills/sprint-planning/SKILL.md` |
| tdd | `skills/tdd/SKILL.md` |
| tdd-workflow | `skills/tdd-workflow/SKILL.md` |
| code-review | `skills/code-review/SKILL.md` |
| ui-ux-pro-max | `skills/ui-ux-pro-max/SKILL.md` |
| user-onboarding | `skills/user-onboarding/SKILL.md` |
| react-best-practices | `skills/react-best-practices/SKILL.md` |

---

## 代理定义文件位置

| 角色 | 路径 |
|------|------|
| PM | `agents/pm.md` |
| PO | `agents/po.md` |
| Architect | `agents/architect.md` |
| UI Designer | `agents/ui-designer.md` |
| Frontend | `agents/frontend.md` |
| Backend | `agents/backend.md` |
| QA | `agents/qa.md` |
| DevOps | `agents/devops.md` |
| 产品体验师 | `agents/product-experience.md` |

---

*加载顺序: 04*
*适用范围: 全局*
*最后更新: 2026-04-05*
