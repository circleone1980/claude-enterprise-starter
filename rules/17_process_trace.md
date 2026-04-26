# 过程追踪规则（强制）

> 确保每个产出物记录完整的过程信息，实现全程可追溯

---

## 一、核心原则

**产出物必须有过程记录。** 没有过程记录的产出物等于不存在。

**Why**: 框架定义了 17 个 Agent、38 个 Skill、17 条 Rule，但没有任何机制验证它们是否被使用。过程追踪让"未使用框架"的行为在门禁检查时被拦截。

---

## 二、强制规则

### 规则 1：冻结层文档产出前必须创建过程追踪记录

- **路径**: `docs/process-trace/phase{N}/{序号}-{产出物简称}.md`
- **模板**: `docs/process-trace/templates/trace-entry.md`
- **违反后果**: 产出物存在但无对应过程记录 → 门禁检查失败

### 规则 2：过程追踪必须记录的内容

| 必填项 | 说明 |
|--------|------|
| Agent | 使用了哪个 Agent（引用 `agents/*.md`） |
| Skill | 调用了哪些 Skill（引用 `skills/*/SKILL.md`） |
| Rule | 遵循了哪些 Rule（引用 `rules/*.md`） |
| 步骤链路 | 每个步骤的输入和输出 |
| 关键决策 | 决策内容、选择、原因 |
| 审查记录 | 审查方式、审查者、意见数、采纳/驳回 |

### 规则 3：多步骤产出物的过程追踪

需要多种手段结合的产出物（如 PRD 需要 PM Agent + product-requirements skill + ce-brainstorm + adversarial-review），必须：

- 记录每个步骤为独立的 Step
- 每个 Step 标注对应的 Agent、Skill、Rule
- 记录每个步骤的中间产出物
- 最终产出物标注经过哪些步骤产出

### 规则 4：审查过程必须单独记录

每次对抗审查、多维审查、Codex 审查必须：

1. 在 `docs/reviews/` 下创建审查报告
2. 在过程追踪中引用审查报告路径
3. 记录审查意见的采纳/驳回情况

---

## 三、过程追踪文件命名规范

```
docs/process-trace/
├── phase1/
│   ├── 001-prd-generation.md
│   ├── 002-user-stories-generation.md
│   ├── 003-acceptance-criteria.md
│   ├── 004-architecture-design.md
│   ├── 005-data-storage-design.md
│   ├── 006-api-design.md
│   ├── 007-ui-spec.md
│   └── 008-adversarial-review.md
├── phase2/
│   └── ...
└── templates/
    └── trace-entry.md
```

---

## 四、质量指标

| 指标 | 计算方式 | 达标阈值 |
|------|---------|---------|
| Skill 调用完整度 | 已调用 Skill 数 / 应调用 Skill 数 | ≥ 80% |
| Agent 合规度 | 是否使用框架定义的 Agent | 100% |
| Rule 遵循度 | 是否遵循强制规则 | 100% |
| 审查覆盖率 | 已审查文档数 / 应审查文档数 | ≥ 80% |

---

## 五、门禁集成

过程追踪检查已集成到 `hooks/scripts/process-trace-check.js`，在 `phase1_to_phase2` 门禁中自动执行。

检查内容：
1. 对应过程记录文件是否存在
2. 过程记录中是否包含必填项
3. requiredSkills 是否被记录为已调用
4. requiredAgent 是否匹配

---

*加载顺序: 17*
*版本: 1.0.0*
*最后更新: 2026-04-26*
