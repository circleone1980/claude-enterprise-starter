# Compound Engineering (CE) 插件集成规则

> **CE 插件为必需依赖**，未安装将阻塞阶段推进。
> 安装指南: `docs/CE-SETUP.md` | 健康检查: `node scripts/ce-health-check.js`

---

## 一、CE 技能概览（5 技能全覆盖）

| 技能 | 命令 | 阶段 | 说明 | 自动触发 |
|------|------|------|------|---------|
| 方案脑暴 | `/ce-brainstorm` | 需求/设计 | ≥2 种实现路径，收敛为需求规格 | Phase 1 需求/设计 |
| 经验规划 | `/ce-plan` | 设计/规划 | 检索历史经验，拆分细粒度任务 | Phase 1→2 架构设计后 |
| 核心执行 | `/ce-work` | 开发 | 单任务迭代 + TDD + 进度追踪 | Phase 2 开发阶段 |
| 多维评审 | `/ce-review` | 评审 | 基础 6 类+扩展评审，独立报告 | 每个阶段边界 |
| 知识沉淀 | `/ce-compound` | 收尾 | 提取经验存入 docs/solutions/ | 每个阶段转换点 |

---

## 二、CE 必需依赖

### 安装预检

```bash
node scripts/ce-health-check.js
# 期望: 全部 PASS
```

### 未安装的后果

- 阶段推进被阻塞（orchestrate.sh `run_multi_review_hook` 返回失败）
- validate-config.js 检查 9 报告 FAIL
- CI 流水线失败

---

## 三、文档流转

| 技能 | 输入 | 输出目录 |
|------|------|---------|
| `/ce-brainstorm` | 需求描述 | `docs/brainstorms/{topic}-requirements.md` |
| `/ce-plan` | 需求文档路径 | `docs/plans/{date}-{type}-{name}-plan.md` |
| `/ce-work` | 任务清单 | `docs/dev/progress.md` + `docs/dev/notes/` |
| `/ce-review` | 当前代码变更 | `docs/reviews/{topic}-ce-review.md` |
| `/ce-compound` | 阶段产出文档 | `docs/solutions/{category}/{topic}.md` |

---

## 四、Agent 映射

| Agent | CE 技能 | 触发场景 |
|-------|--------|---------|
| PM | `/ce-brainstorm` | 需求不明确，需要多方案探索 |
| Architect | `/ce-brainstorm`, `/ce-plan` | 架构选型困难，需要经验规划 |
| Frontend | `/ce-work` | Phase 2 开发，ce-work 驱动 TDD |
| Backend-Java | `/ce-work` | Phase 2 开发，ce-work 驱动 TDD |
| Backend-Python | `/ce-work` | Phase 2 开发，ce-work 驱动 TDD |
| QA | `/ce-review` | Phase 3 代码/文档多维审查 |
| DevOps | `/ce-review`, `/ce-compound` | Phase 5 部署审查 + 经验沉淀 |
| Review-Champion | `/ce-review`, `/ce-brainstorm` | 对抗审查中的多维度审查 |
| GAN-Generator | `/ce-work` | GAN 循环中的代码生成 |
| Knowledge-Compounder | `/ce-compound` | 阶段转换时自动触发 |

---

## 五、自动触发矩阵

| 阶段边界 | CE Brainstorm | CE Plan | CE Work | CE Review | CE Compound |
|----------|:---:|:---:|:---:|:---:|:---:|
| Phase 1 | PM, Architect | - | - | - | - |
| Phase 1→2 | - | Architect | - | Review-Champion | Knowledge-Compounder |
| Phase 2 | - | - | Frontend, Backend-Java, Backend-Python, GAN-Gen | - | - |
| Phase 2→3 | - | - | - | CE Review | Knowledge-Compounder |
| Phase 3→4 | - | - | - | CE Review | Knowledge-Compounder |
| Phase 4→5 | - | - | - | CE Review | Knowledge-Compounder |
| Phase 5→完成 | - | - | - | CE Review | Knowledge-Compounder, DevOps |
| GAN 每轮 | - | - | GAN-Generator | CE Review | - |

---

## 六、多评审机制

每个审查节点执行多方独立审查：

1. **CE Review**（6+ 维度独立评审）— 强制
2. **Codex GPT-5.5**（深度审查）— Phase 2/5
3. **内置 code-review**（Claude 原生）— Phase 2/3/5
4. **对抗审查**（adversarial-review）— Phase 1/5

审查结果合并到 `docs/reviews/{phase}-merged-review.md`。

---

*加载顺序: 16*
*最后更新: 2026-04-26*
*版本: 3.2.0*
