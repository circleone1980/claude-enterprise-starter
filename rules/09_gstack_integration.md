# GStack 产品设计规则（v3.1 独立化）

> GStack 技能已独立化，不再依赖全局 GStack 安装。
> 所有技能的 Preamble 已替换为轻量级版本，移除了遥测、更新检查、经验库等外部依赖。

---

## 一、独立性声明

| 项目 | v2.6.0 | v3.1.0 |
|------|--------|--------|
| Preamble | 依赖 `~/.claude/skills/gstack/bin/` (6 个脚本) | 轻量级内置 (git 分支 + 会话管理) |
| 遥测 | GStack 遥测系统 | 已移除 |
| 更新检查 | `gstack-update-check` | 已移除 |
| 经验库 | `gstack-learnings-search` | 由 CE `/ce:compound` 替代 |
| 仓库模式 | `gstack-repo-mode` | 已移除 |

**用户无需安装 GStack 即可使用所有 GStack 派生技能。**

---

## 二、Phase 0.5a 触发规则（Think 阶段）

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

## 三、Phase 0.5b 触发规则（Plan 阶段）

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|----------|
| Phase 0.5b 启动 | `Skill autoplan` 🔴 | Design-Reviewer |
| 用户说"CEO 审查" | `Skill plan-ceo-review` | Design-Reviewer |
| 用户说"设计评分" | `Skill plan-design-review` | Design-Reviewer |
| 用户说"工程审查" | `Skill plan-eng-review` | Design-Reviewer |
| 用户说"DX 审查" | `Skill plan-devex-review` | Design-Reviewer |
| 用户说"自动规划" / "自动审查" | `Skill autoplan` | Design-Reviewer |

## 四、Phase 0.5 → Phase 1 交接

| 触发场景 | 动作 |
|---------|------|
| Phase 0.5 门禁通过 | `Skill gstack-bridge` 自动执行 |
| gstack-bridge 完成 | PRD.md / 04_UI设计规范.md 已预填充 |
| Phase 1 启动 | PM 使用预填充的 PRD 作为起点（精炼而非重建）|

## 五、品味记忆

品味记忆存储在 `workspace/docs/design/.taste-memory.json`。
每个项目的品味记忆独立，跨会话持久化。
最大 50 条记录，LRU 淘汰策略。

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
*最后更新: 2026-04-26*
