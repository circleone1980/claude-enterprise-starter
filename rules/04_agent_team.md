# Agent Team 详细规则

> Agent Team 体系的详细说明（主文件中的精简版补充）
> **角色-技能映射的权威定义源**: `automation/agent-orchestration.json`

---

## 角色详细技能说明

> **注意**: 以下仅列出各角色的**核心技能**，完整技能列表（含辅助技能）见 `automation/agent-orchestration.json` (SSOT)

### Product Designer (GStack, Phase 0.5a)

> 仅当 `gstackConfig.enabled: true` 时激活

- `office-hours` 🔴 - **入口技能**，YC 6 问挑战假设
- `design-consultation` 🔴 - 竞品研究+设计系统构建
- `design-shotgun` 🔴 - 4-6 UI 变体+品味记忆
- `design-html` 🔴 - 模型转生产级 HTML/CSS
- Superpowers `brainstorming` - 创意探索

**SOP**: `office-hours` → `design-consultation` → `design-shotgun` → `design-html`

### Design Reviewer (GStack, Phase 0.5b)

> 仅当 `gstackConfig.enabled: true` 时激活

- `autoplan` 🔴 - **入口技能**，自动全流程审查
- `plan-ceo-review` - CEO 范围挑战（4 种模式）
- `plan-design-review` - 设计评分（6 维度 0-10）
- `plan-eng-review` - 工程架构审查
- `plan-devex-review` - 开发者体验审查
- `gstack-bridge` 🔴 - **交接技能**，GStack→PRD 格式转换

**SOP**: `autoplan` → 品味决策审批 → `gstack-bridge`

### PM (项目经理)
- `product-requirements` - 需求理解和拆解
- `sprint-planning` - Sprint 规划和任务分配
- Superpowers `writing-plans` - 计划编写

### Architect (架构师)
- `writing-plans` 🔴 - **核心技能**，系统架构设计
- `react-best-practices` - React 架构优化
- `ui-style-selector` - UI 风格选择（架构设计时确认视觉方向）
- Superpowers `brainstorming` - 架构脑暴

### UI Designer (UI 设计师)
- `ui-ux-pro-max` 🔴 - **核心技能**，50+ 设计风格、161 配色方案
- `ui-style-selector` 🔴 - **核心技能**，基于场景选择 UI 风格模板
- Superpowers `frontend-design` - 前端设计指导
- MCP `figma` - Figma 设计工具集成

### Frontend (前端开发)
- `tdd` 🔴 - **核心技能**，Red-Green-Refactor
- `antfu` 🔴 - **核心技能**，ESLint/TypeScript/pnpm/Vitest
- Superpowers `test-driven-development` - TDD 方法论

### Backend-Java (Java 后端开发)
- `springboot-patterns` 🔴 - **核心技能**，SpringBoot 架构模式
- `springboot-tdd` 🔴 - **核心技能**，SpringBoot TDD
- `springboot-security` - SpringBoot 安全配置
- `jpa-patterns` - JPA 数据访问模式
- `java-coding-standards` - Java 编码规范
- `llm-integration` - LLM API 集成
- `vlm-integration` - VLM 视觉语言模型集成
- `workflow-engine` - 工作流编排
- `code-review` - 代码审查

### Backend-Python (Python 后端开发)
- `tdd` 🔴 - **核心技能**，Red-Green-Refactor
- `prisma-database-setup` 🔴 - **核心技能**，数据库配置
- `llm-integration` 🔴 - **核心技能**，LLM API 集成
- `vlm-integration` 🔴 - **核心技能**，VLM 视觉语言模型集成
- `workflow-engine` - 工作流编排
- `code-review` - 代码审查

### QA (测试工程师)
- `tdd` - TDD 方法论
- Superpowers `systematic-debugging` - 系统化调试
- MCP `playwright` - E2E 自动化测试

### DevOps (运维工程师)
- `code-review` - 部署脚本审查
- MCP `github` - 仓库和 CI/CD 管理

### 产品体验师
- `user-onboarding` 🔴 - **核心技能**，FTUE 设计
- `ui-ux-pro-max` - UX 评估标准
- Superpowers `brainstorming` - 体验优化脑暴
- MCP `playwright` - 用户体验自动化测试

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

**Java 后端开发**:
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