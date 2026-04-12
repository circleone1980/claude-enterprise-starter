# GStack 产品设计规则

> GStack Phase 0.5 集成规则，仅在 gstackConfig.enabled=true 时生效

---

## 一、Phase 0.5a 触发规则（Think 阶段）

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|----------|
| Phase 0.5a 启动 | `Skill office-hours` 🔴 | Product-Designer |
| office-hours 完成 | `Skill design-consultation` 🔴 | Product-Designer |
| design-consultation 完成 | `Skill design-shotgun`（可选）| Product-Designer |
| 用户批准设计变体 | `Skill design-html` | Product-Designer |
| 用户说"产品构思" / "挑战假设" | `Skill office-hours` | Product-Designer |
| 用户说"竞品分析" / "设计系统" | `Skill design-consultation` | Product-Designer |
| 用户说"给我看选项" / "设计变体" | `Skill design-shotgun` | Product-Designer |
| 用户说"模型转代码" | `Skill design-html` | Product-Designer |

## 二、Phase 0.5b 触发规则（Plan 阶段）

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|----------|
| Phase 0.5b 启动 | `Skill autoplan` 🔴 | Design-Reviewer |
| 用户说"CEO 审查" | `Skill plan-ceo-review` | Design-Reviewer |
| 用户说"设计评分" | `Skill plan-design-review` | Design-Reviewer |
| 用户说"工程审查" | `Skill plan-eng-review` | Design-Reviewer |
| 用户说"DX 审查" | `Skill plan-devex-review` | Design-Reviewer |
| 用户说"自动规划" / "自动审查" | `Skill autoplan` | Design-Reviewer |

## 三、Phase 0.5 → Phase 1 交接

| 触发场景 | 动作 |
|---------|------|
| Phase 0.5 门禁通过 | `Skill gstack-bridge` 自动执行 |
| gstack-bridge 完成 | PRD.md / 04_UI设计规范.md 已预填充 |
| Phase 1 启动 | PM 使用预填充的 PRD 作为起点（精炼而非重建）|

## 四、品味记忆

品味记忆存储在 `workspace/docs/design/.taste-memory.json`。
每个项目的品味记忆独立，跨会话持久化。
最大 50 条记录，LRU 淘汰策略。

## 五、GStack 禁用时

当 `automation/agent-orchestration.json` 中 `gstackConfig.enabled = false` 时：
- Phase 0.5 被完全跳过
- Phase 0 → Phase 1 直接衔接
- 所有 GStack 技能不加载
- 行为与 v2.5.0 完全一致

## 六、与现有技能的关系

| GStack 技能 | 现有技能 | 关系 |
|------------|---------|------|
| office-hours | product-requirements | GStack 先做产品构思，PRD 再做需求分析 |
| design-consultation | ui-ux-pro-max | GStack 做竞品研究，ui-ux-pro-max 做实现指导 |
| design-shotgun | ui-style-selector | GStack 做视觉探索，ui-style-selector 做品牌选择 |
| design-html | 前端开发 | GStack 做原型，前端开发做生产代码 |
| autoplan | writing-plans | GStack 做四维审查，writing-plans 做架构设计 |

**原则**: GStack 处理编码前的 "Think & Plan"，现有技能处理编码后的 "Build & Ship"。

---

*加载顺序: 09*
