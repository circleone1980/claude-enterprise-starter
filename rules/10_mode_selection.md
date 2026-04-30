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
| ≥ 6  | **Agent Team** (TeamCreate + SendMessage)    | 需求讨论、测试修复闭环 |
| 3-5  | **Subagent 并行** (多个 Agent 同时 spawn) | 可并行的独立任务   |
| < 3  | **Subagent 顺序** (链式执行)                 | 独立验证/部署      |

## 各阶段自动决策

| 阶段       | 角色                           | 总分 | 模式            |
| ---------- | ------------------------------ | ---- | --------------- |
| Phase 0.5a | Product-Designer               | 1    | Subagent 顺序   |
| Phase 0.5b | Design-Reviewer                | 1    | Subagent 顺序   |
| Phase 1    | PM+PO+Architect                | 7    | **Team**        |
| Phase 2A   | Frontend+Backend 接口对齐      | 7    | **Team**（覆盖）|
| Phase 2B   | 各角色独立开发                 | 3-4  | **Subagent 并行** |
| Phase 3    | QA+Frontend+Backend+Architect+PM | 6  | **Team**（覆盖）|
| Phase 4    | 体验师+UI+Frontend+Backend+Architect+PM | 6 | **Team**（覆盖）|
| Phase 5    | DevOps                         | 1    | Subagent 顺序   |
| GAN        | Planner→Generator→Evaluator | 2    | Subagent 顺序   |

## 覆盖逻辑

`auto-start-agents.js` 中对特定阶段强制覆盖评分：

| 阶段 | 覆盖条件 | 效果 | 原因 |
|------|---------|------|------|
| Phase 2A | `subPhase === '2A'` | 强制 Team | 接口对齐需要 Frontend↔Backend 实时协商 |
| Phase 3 | `targetPhase === '3'` | 强制 Team | 测试-修复-回归闭环需要 QA↔Dev↔Architect 迭代 |
| Phase 4 | `targetPhase === '4'` | 强制 Team | UX 修复闭环需要体验师↔UI↔Dev↔Architect 迭代 |

## 代码审查集成点

各阶段中的审查触发时机：

| 审查层 | 工具 | 触发时机 | 阶段 |
|--------|------|---------|------|
| Codex 双模型 | `/codex:review` | 每个 Feature 完成后 | Phase 2B |
| 对抗审查 | `/adversarial-review` | 冻结层文档完成后 | Phase 1 |
| Skill code-review | `code-review` | 代码提交前 | Phase 2B/3 |
| Security review | `security-review` | 安全相关修改 | Phase 2B/3 |
| CE Review | `/ce-review` | 阶段转换前 | 各 Phase 末尾 |
| QA Browser 测试 | Playwright | Phase 3 | Phase 3 |

*加载顺序: 10*
