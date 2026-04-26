# Agent Team 详细规则

> Agent Team 体系的详细说明（主文件中的精简版补充）
> **角色-技能映射的唯一权威来源**: `automation/agent-orchestration.json`

---

## 角色概览

| 角色 | 阶段 | SSOT Key | agentMd |
|------|------|----------|---------|
| Product Designer | 0.5a (GStack) | `agents.Product-Designer` | agents/product-designer.md |
| Design Reviewer | 0.5b (GStack) | `agents.Design-Reviewer` | agents/design-reviewer.md |
| PM | 1 | `agents.PM` | agents/pm.md |
| PO | 1 | `agents.PO` | agents/po.md |
| Architect | 1 | `agents.Architect` | agents/architect.md |
| UI Designer | 2 | `agents.UI-Designer` | agents/ui-designer.md |
| Frontend | 2 | `agents.Frontend` | agents/frontend.md |
| Backend-Java | 2 | `agents.Backend-Java` | agents/backend-java.md |
| Backend-Python | 2 | `agents.Backend-Python` | agents/backend-python.md |
| QA | 3 | `agents.QA` | agents/qa.md |
| 产品体验师 | 4 | `agents.产品体验师` | agents/product-experience.md |
| DevOps | 5 | `agents.DevOps` | agents/devops.md |
| Review Champion | 1-review | `agents.Review-Champion` | agents/review-champion.md |
| GAN-Planner | gan | `agents.GAN-Planner` | agents/gan-planner.md |
| GAN-Generator | gan | `agents.GAN-Generator` | agents/gan-generator.md |
| GAN-Evaluator | gan | `agents.GAN-Evaluator` | agents/gan-evaluator.md |

> 完整技能列表（requiredSkills）、subagentType、并行配置等均定义在 `automation/agent-orchestration.json` 对应的 SSOT Key 中。

---

## GStack 与现有角色关系

| GStack 输出 | 接收角色 | 说明 |
|------------|---------|------|
| OFFICE_HOURS.md | PM | 产品背景、目标用户作为 PRD 输入 |
| DESIGN.md | UI Designer, Frontend | 设计令牌和组件库作为设计约束 |
| IMPLEMENTATION_PLAN.md | Architect, Backend | 架构图和数据流作为工程参考 |
| PRD.md（预填充） | PM | PM 精炼而非重建 |

---

## 开发前检查清单

**Python 后端开发**（默认后端）:
- [ ] 1. 🔴 调用 `Skill design-context --role backend` 获取设计约束
- [ ] 2. 🔴 调用 `Skill tdd` 启动 TDD 流程
- [ ] 3. 调用 `Skill prisma-database-setup` 获取数据库配置
- [ ] 4. 调用 `Skill llm-integration` 获取 LLM 集成指导（如需）
- [ ] 5. 编写测试用例（Red 阶段）
- [ ] 6. 实现代码（Green 阶段）
- [ ] 7. 重构优化（Refactor 阶段）
- [ ] 8. 调用 `Skill code-review` 审查代码
- [ ] 9. 确保测试覆盖率 >80%

**Java 后端开发**（可选，需 ADR 审批）:
- [ ] 1. 🔴 调用 `Skill springboot-patterns` 获取 SpringBoot 架构模式
- [ ] 2. 🔴 调用 `Skill springboot-tdd` 启动 TDD 流程
- [ ] 3. 调用 `Skill jpa-patterns` 获取 JPA 数据访问指导
- [ ] 4. 编写测试用例（Red 阶段）
- [ ] 5. 实现代码（Green 阶段）
- [ ] 6. 重构优化（Refactor 阶段）
- [ ] 7. 调用 `Skill code-review` 审查代码
- [ ] 8. 确保测试覆盖率 >80%

**Python 后端开发**:
- [ ] 1. 🔴 调用 `Skill design-context --role backend` 获取设计约束
- [ ] 2. 🔴 调用 `Skill tdd` 启动 TDD 流程
- [ ] 3. 调用 `Skill prisma-database-setup` 获取数据库配置
- [ ] 4. 调用 `Skill llm-integration` 获取 LLM 集成指导（如需）
- [ ] 5. 编写测试用例（Red 阶段）
- [ ] 6. 实现代码（Green 阶段）
- [ ] 7. 重构优化（Refactor 阶段）
- [ ] 8. 调用 `Skill code-review` 审查代码
- [ ] 9. 确保测试覆盖率 >80%

**前端开发**:
- [ ] 1. 🔴 调用 `Skill design-context --role frontend` 获取设计约束
- [ ] 2. 调用 `Skill ui-ux-pro-max --stack react` 获取 UI 最佳实践
- [ ] 3. 调用 `Skill antfu` 获取工具链配置
- [ ] 4. 🔴 调用 `Skill tdd` 启动 TDD 流程
- [ ] 5. 编写测试用例（Red 阶段）
- [ ] 6. 实现组件代码（Green 阶段）
- [ ] 7. 重构优化（Refactor 阶段）
- [ ] 8. 调用 `Skill code-review` 审查代码
- [ ] 9. 确保测试覆盖率 >80%

---

*加载顺序: 04*
