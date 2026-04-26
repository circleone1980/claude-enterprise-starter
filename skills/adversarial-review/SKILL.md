---
name: adversarial-review
version: 1.0.0
effort: high
description: |
  Adversarial document review — "left-right sparring" (左右互搏) pattern.
  Launches opposing review perspectives to challenge and defend a document.
  Identifies logical gaps, requirement biases, and design blind spots.

  Targets:
    /adversarial-review prd     — Review PRD (docs/requirements/PRD.md)
    /adversarial-review design  — Review architecture (docs/design/01_系统架构设计.md)
    /adversarial-review api     — Review API design (docs/design/03_API接口设计.md)
    /adversarial-review ui      — Review UI spec (docs/design/04_UI设计规范.md)

  Use when asked to "对抗审查", "challenge this document", "play devil's advocate",
  "left-right review", or after a major document draft is completed.
  Proactively suggest when Phase 1 document drafts are finished.
origin: custom
---

# Adversarial Review — 左右互搏

> **核心原则**: 创作者和审查者不应是同一人。本技能引入对立视角审查文档。

## How It Works

```
1. 读取目标文档
2. 作为"左派"质疑者，生成 ≤5 个挑战点
3. 使用 /ce:review 或 plan-ceo-review/plan-eng-review 进行多维审查
4. 使用 /ce:brainstorm 为每个挑战生成替代方案
5. 输出结构化挑战报告
6. 等待用户决定是否让"右派"回应
```

## Step 0: Determine Target

Based on the argument, locate the document:

| Argument | Target File |
|----------|------------|
| `prd` | `docs/requirements/PRD.md` |
| `design` | `docs/design/01_系统架构设计.md` |
| `api` | `docs/design/03_API接口设计.md` |
| `ui` | `docs/design/04_UI设计规范.md` |

If no argument given, scan for recently modified files in `docs/requirements/` and `docs/design/` and ask which to review.

## Step 1: Read and Analyze

1. Read the target document in full
2. Read related documents for context:
   - If reviewing PRD: also read user-stories.md and acceptance-criteria.md
   - If reviewing design: also read PRD.md for requirement alignment
3. Understand the document's claims, assumptions, and decisions

## Step 2: Generate Challenges (Left Side)

Act as a **Devil's Advocate** (质疑者). For each of the 5 review dimensions:

| Dimension | Questions to Ask |
|-----------|-----------------|
| **Product Value (25%)** | Is this solving a real problem? Will users pay for this? Is the ROI justified? |
| **Technical Feasibility (25%)** | Can this be built as described? Are dependencies realistic? Performance targets achievable? |
| **User Experience (20%)** | Is the user flow smooth? Are error states handled? Is the learning curve reasonable? |
| **Security (15%)** | Is data protected? Auth complete? Edge cases handled? |
| **Maintainability (15%)** | Is the architecture clear? Documentation sufficient? Easy to extend? |

Generate at most **5 challenges**, prioritized by severity (Critical > High > Medium).

Each challenge must include:
- **Dimension** and **Severity**
- **Exact location** in the document
- **Why this is a problem**
- **At least one alternative approach**
- **Specific fix suggestion**

## Step 3: Deepen with CE Skills (if available)

If CE plugin is installed, use it to deepen the review:

1. Run `/ce:review` on the document for structured multi-dimensional analysis
2. Run `/ce:brainstorm` to generate alternative approaches for the top 2 challenges

If CE plugin is NOT installed, use built-in skills:
1. Use `plan-ceo-review` perspective for product value challenges
2. Use `plan-eng-review` perspective for technical feasibility challenges

## Step 4: Output Challenge Report

Generate the challenge report:

```markdown
# 对抗审查报告 — {文档名}

**审查日期**: {date}
**审查对象**: {文件路径}
**审查模式**: {prd|design|api|ui}

## 摘要

- **挑战总数**: N
- **Critical**: N | **High**: N | **Medium**: N
- **覆盖维度**: {已覆盖的维度列表}

## 挑战详情

### Challenge #1: {标题}
...（按 rules/15 格式输出）

## 替代方案建议

（来自 /ce:brainstorm 或内置分析）

## 下一步

请审阅以上挑战，并决定：
- A) 让文档创建者（右派）逐条回应
- B) 直接修改文档解决 Critical 问题
- C) 需要更多信息，跳过本轮审查
```

Save to `docs/reviews/{date}-{type}-adversarial-review.md`.

## Step 5: Defender Response (Optional)

If the user chooses option A, switch to **Defender** (辩护者) perspective:

1. Read each challenge
2. For each challenge, decide: Accepted / Partially-Accepted / Rejected
3. For Accepted challenges: describe the specific document modification
4. For Rejected challenges: provide clear reasoning why the challenge is invalid
5. Output the revised document

**Rule**: Critical challenges CANNOT be rejected — they must be addressed.

## Step 6: Final Confirmation

Present summary to user:

```
对抗审查完成
━━━━━━━━━━━━━
挑战: N 个 | 接受: M | 部分接受: K | 拒绝: L
Critical: 全部已处理 ✅

修改后的文档: {文件路径}
审查报告: docs/reviews/{date}-{type}-adversarial-review.md
```

Ask user to confirm the final version.

## Limits

- Max 5 challenges per round
- Max 3 rounds total
- If unresolved Critical issues remain after 3 rounds → escalate to user for manual decision
