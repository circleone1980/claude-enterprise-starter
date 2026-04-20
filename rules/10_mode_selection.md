# 智能模式选择引擎

> **定义源**: `automation/agent-orchestration.json` → `modeSelection` + `modeThresholds`

## 评分因子

| 因子                     | 范围  | 含义                            |
| ------------------------ | ----- | ------------------------------- |
| `communicationNeed`    | 0-3   | 角色间实时通信需求（讨论/协商） |
| `crossLayerDependency` | 0-3   | 跨层依赖（前后端接口对齐）      |
| `contextPressure`      | 0-2   | 上下文压力（长时间运行）        |
| `roleCount`            | 0-1   | 同类角色数量                    |
| `writeConflictRisk`    | -2-0  | 写冲突风险惩罚                  |

## 决策规则

| 总分 | 模式                                               | 适用场景           |
| ---- | -------------------------------------------------- | ------------------ |
| ≥ 6  | **Agent Team** (TeamCreate + SendMessage)    | 需求讨论、接口对齐 |
| 3-5  | **Subagent 并行** (多个 Agent 同时 spawn) | 可并行的独立任务   |
| < 3  | **Subagent 顺序** (链式执行)                 | 独立验证/部署      |

## 各阶段自动决策

| 阶段       | 角色                           | 总分 | 模式            |
| ---------- | ------------------------------ | ---- | --------------- |
| Phase 0.5a | Product-Designer               | 1    | Subagent 顺序   |
| Phase 0.5b | Design-Reviewer                | 1    | Subagent 顺序   |
| Phase 1    | PM+PO+Architect                | 7    | **Team**        |
| Phase 2A   | Frontend+Backend 接口对齐      | 7    | **Team**        |
| Phase 2B   | 各角色独立开发                 | 0-2  | Subagent 顺序   |
| Phase 3-5  | QA/体验师/DevOps               | 0-1  | Subagent 顺序   |
| GAN        | Planner→Generator→Evaluator | 2    | Subagent 顺序   |

*加载顺序: 10*
