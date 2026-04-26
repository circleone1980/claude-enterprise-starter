# 过程追踪模板

> 复制此模板到 `docs/process-trace/phase{N}/{序号}-{产出物简称}.md` 并填充

---

```markdown
---
type: process-trace
phase: {phase-number}
artifact: {产出物路径}
agent: {agent名称}
agentFile: agents/{agent}.md
timestamp: {YYYY-MM-DDTHH:mm:ss}
status: completed|failed|partial
---

# 过程追踪：{产出物名称}

## 执行链路

### Step 1: {步骤名称}
- **Agent**: {agent名} (`agents/{agent}.md`)
- **subagent_type**: {subagent_type}
- **调用的 Skill**: {skill名} (`skills/{skill}/SKILL.md`)
- **遵循的 Rule**: {rule名} (`rules/{rule}.md`)
- **工作流**: {工作流描述}
- **输入**: {本步骤的输入}
- **输出**: {本步骤的产出物}
- **耗时**: {预估/实际}

### Step 2: ...
（继续记录每个步骤）

## 关键决策
| 决策 | 选择 | 原因 | 决策者 |
|------|------|------|--------|
| {决策描述} | {选择了什么} | {为什么} | {谁决定的} |

## 产出物
- 最终文件: `{文件路径}`
- 中间产物: {如有}

## 审查记录
- **审查方式**: {对抗审查/多维审查/Codex审查/ce-review}
- **审查者**: {Agent名或模型}
- **审查意见数**: {N 条}
- **采纳/驳回**: {N 采纳, M 驳回}
- **审查报告**: `docs/reviews/{review-file}.md`

## 质量指标
- Skill 调用完整度: {N/M} ({百分比}%)
- Agent 合规度: {是否符合 agent 定义}
- Rule 遵循度: {是否遵循了强制规则}
```

---

*模板版本: 1.0.0*
*最后更新: 2026-04-26*
