# Compound Engineering (CE) 插件集成规则

> CE 全局插件提供方案脑暴、经验规划、多维评审、知识沉淀能力。
> 前置条件：用户需全局安装 CE 插件（`compound-engineering-plugin`）。

---

## 一、CE 技能概览

| 技能 | 命令 | 阶段 | 说明 |
|------|------|------|------|
| 方案脑暴 | `/ce-brainstorm` | 需求/设计 | ≥2 种实现路径，收敛为需求规格 |
| 经验规划 | `/ce-plan` | 设计/规划 | 检索历史经验，拆分细粒度任务 |
| 多维评审 | `/ce-review` | 评审 | 基础 6 类+扩展评审，独立报告 |
| 知识沉淀 | `/ce-compound` | 收尾 | 提取经验存入 docs/solutions/ |

> **注意**: `/ce:work` 不在本项目集成范围内。开发流程使用本项目 TDD 工作流。

---

## 二、文档流转

| 技能 | 输入 | 输出目录 |
|------|------|---------|
| `/ce-brainstorm` | 需求描述 | `docs/brainstorms/{topic}-requirements.md` |
| `/ce-plan` | 需求文档路径 | `docs/plans/{date}-{type}-{name}-plan.md` |
| `/ce-review` | 当前代码变更 | `docs/reviews/{topic}-review.md` |
| `/ce-compound` | 会话上下文 | `docs/solutions/{category}/{topic}.md` |

---

## 三、与现有技能的关系

| CE 技能 | 现有技能 | 关系 |
|---------|---------|------|
| `/ce-brainstorm` | `brainstorming`, `office-hours` | CE 侧重多方案收敛，office-hours 侧重产品构思 |
| `/ce-plan` | `writing-plans`, `autoplan` | CE 检索历史经验，writing-plans 做架构设计 |
| `/ce-review` | `code-review`, `security-review` | CE 多维度并行审查，code-review 专注代码质量 |
| `/ce-compound` | `continuous-learning` | CE 知识化合物更结构化，continuous-learning 更轻量 |

**原则**: CE 技能作为现有技能的**增强**而非替代。用户可选择使用 CE 或内置技能。

---

## 四、Agent 映射

| Agent | CE 技能 | 触发场景 |
|-------|--------|---------|
| PM | `/ce-brainstorm` | 需求不明确，需要多方案探索 |
| Architect | `/ce-brainstorm`, `/ce-plan` | 架构选型困难，需要经验规划 |
| QA | `/ce-review` | 代码/文档需要多维度审查 |
| DevOps | `/ce-review` | 部署前多维审查 |
| Review-Champion | `/ce-review`, `/ce-brainstorm` | 对抗审查中的质疑方 |

---

## 五、使用建议

1. **独立使用**: 任何时候都可以直接运行 `/ce-brainstorm` 等命令
2. **与对抗审查配合**: `/adversarial-review` 内部会调用 `/ce-review` 和 `/ce-brainstorm`
3. **阶段收尾**: 每个阶段结束时运行 `/ce-compound` 沉淀经验
4. **知识复用**: `/ce-plan` 自动检索 `docs/solutions/` 中的历史经验

---

*加载顺序: 16*
*最后更新: 2026-04-26*
