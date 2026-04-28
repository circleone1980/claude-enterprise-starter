# 过程追踪规则（强制）

> 确保每个产出物记录完整的过程信息，实现全程可追溯

---

## 一、核心原则

**产出物必须有过程记录。** 没有过程记录的产出物等于不存在。

**Why**: 框架定义了 17 个 Agent、38 个 Skill、17 条 Rule，但没有任何机制验证它们是否被使用。过程追踪让"未使用框架"的行为在门禁检查时被拦截。

---

## 二、三层追踪机制

### 第 1 层：Hook 自动记录（v5.0.3 新增）

Hook 在 Skill/Agent/TeamCreate 调用时**自动追加**记录到 `.claude/logs/trace-audit.jsonl`。

**此文件为只追加，不可修改**（由 config-protection.js 保护）。

每行格式：
```json
{"timestamp":"2026-04-28T12:00:00.000Z","tool":"Skill","skill":"writing-plans","args":""}
{"timestamp":"2026-04-28T12:01:00.000Z","tool":"Agent","agentName":"architect","subagentType":"everything-claude-code:architect"}
{"timestamp":"2026-04-28T12:02:00.000Z","tool":"TeamCreate","teamName":"design-team"}
```

### 第 2 层：事后对账（v5.0.4 新增）

**根因**：Claude Code 子 agent 操作不触发主会话 hooks，导致子 agent 的 Skill/Agent 调用不会被 trace-audit.jsonl 记录。

**解决方案**：`scripts/post-phase-reconcile.js` 在 Phase 完成后运行，扫描实际产出物 + trace-audit.jsonl，逆向生成：
- `docs/process-trace/phase{N}/*.md` — 过程追踪文件
- `.claude/logs/skill-invocations/*.json` — Skill marker 文件

```bash
node scripts/post-phase-reconcile.js --phase=1 [--workspace=.] [--dry-run]
```

### 第 3 层：主会话守门（v5.0.4 新增）

**模式**：子 agent 只写临时文件（`.claude/temp/`），主会话负责写入冻结层路径。

**流程**：
1. 主会话调用 Skill（hooks 触发，markers 创建）
2. 子 agent 生成内容到 `.claude/temp/`
3. 主会话读取临时文件，写入冻结层路径（PreToolUse guards 验证 markers）
4. 运行 `post-phase-reconcile.js` 事后对账

**第 1 层是真实性基础，第 2 层是补偿机制，第 3 层是正确流程。**

---

## 三、强制规则

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

## 四、过程追踪文件命名规范

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

## 五、防伪造机制（v5.0.3 新增）

过程追踪检查（`process-trace-check.js`）执行 5 层验证：

| 层级 | 检查内容 | 数据源 |
|------|---------|--------|
| 第 1 层 | 过程追踪文件是否存在 | `docs/process-trace/` |
| 第 2 层 | 必填项是否完整 | 过程追踪 `.md` 内容 |
| 第 3 层 | requiredAgent 是否匹配 | 过程追踪 `.md` 内容 |
| 第 4 层 | requiredSkills 是否被记录 | 过程追踪 `.md` 内容 |
| **第 5 层** | **trace-audit.jsonl 交叉验证** | `.claude/logs/trace-audit.jsonl` |

**第 5 层杜绝伪造**：如果过程追踪声称调用了 Skill `writing-plans`，但 `trace-audit.jsonl` 中无对应 Hook 自动记录 → FAIL。

---

## 六、质量指标

| 指标 | 计算方式 | 达标阈值 |
|------|---------|---------|
| Skill 调用完整度 | 已调用 Skill 数 / 应调用 Skill 数 | ≥ 80% |
| Agent 合规度 | 是否使用框架定义的 Agent | 100% |
| Rule 遵循度 | 是否遵循强制规则 | 100% |
| 审查覆盖率 | 已审查文档数 / 应审查文档数 | ≥ 80% |
| Audit 一致性 | 过程追踪 vs trace-audit.jsonl | 100% |

---

## 七、门禁集成

过程追踪检查已集成到 `hooks/scripts/process-trace-check.js`，在 `phase1_to_phase2` 门禁中自动执行。

检查内容：
1. 对应过程记录文件是否存在
2. 过程记录中是否包含必填项
3. requiredSkills 是否被记录为已调用
4. requiredAgent 是否匹配
5. **trace-audit.jsonl 交叉验证（防伪造）**

---

## 八、事后对账脚本

`scripts/post-phase-reconcile.js` 支持的 Phase 配置：

| Phase | 产出物数 | 产出物路径 |
|-------|---------|-----------|
| phase1 | 7 | PRD, user-stories, acceptance-criteria, 4 份设计文档 |

脚本行为：
1. 扫描实际存在的产出物文件
2. 读取 trace-audit.jsonl 查找 Skill/Agent 调用证据
3. 生成过程追踪文件（含 audit 证据统计）
4. 补建 skill-invocation markers
5. 跳过已存在的追踪文件

---

*加载顺序: 17*
*版本: 3.0.0*
*最后更新: 2026-04-28*
