---
name: product-requirements
description: |
  Interactive Product Owner skill for requirements gathering, analysis, and PRD generation.

  TRIGGER when: user asks about requirements, needs analysis, wants to write PRD, mentions "需求分析", "产品需求", "requirements", "PRD", "product requirements", "功能设计", "业务分析", "用户故事", "验收标准".

  Use this skill whenever the user discusses product features, business capabilities, or any kind of requirements documentation - even if they don't explicitly say "PRD" or "requirements".
origin: ECC
effort: high
---

# Product Requirements Analysis

A systematic approach to gathering, analyzing, and documenting product requirements.

## Workflow

### Step 1: Requirements Gathering

Start by understanding the context:
- What is the product background?
- Who are the target users?
- What business problems does this solve?
- What are the success criteria?

Ask clarifying questions to fill any gaps.

### Step 2: Hierarchical Decomposition

Break down requirements using this structure:

```
Business Capability (业务能力)
  → Product Feature (产品功能)
    → System Capability (系统能力)
      → Technical Implementation (技术实现)
```

For each level, ensure:
- Clear, measurable outcomes
- Traceability to business goals
- Technical feasibility

### Step 3: Generate PRD

Produce a structured Product Requirements Document:

```markdown
# 产品需求文档 (PRD)

## 1. 产品背景
[背景描述、业务目标、市场机会]

## 2. 目标用户
### 用户画像 1
- 角色: [角色描述]
- 痛点: [痛点列表]
- 需求: [需求列表]

## 3. 功能需求

### 3.1 功能模块 A
| 功能点 | 描述 | 优先级 | 验收标准 |
|--------|------|--------|---------|
| ... | ... | P0/P1/P2 | ... |

## 4. 非功能需求
- 性能要求: [响应时间、吞吐量]
- 安全要求: [认证、授权、数据保护]
- 可用性要求: [SLA、容错]
- 可扩展性: [水平/垂直扩展]

## 5. 验收标准
- [ ] 功能验收标准 1
- [ ] 功能验收标准 2

## 6. 里程碑
| 阶段 | 时间 | 交付物 | 负责人 |
|------|------|--------|--------|
| MVP | [日期] | [交付物] | [角色] |

## 7. 风险与依赖
| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| ... | 高/中/低 | ... |
```

## Output Guidelines

- Use Chinese for all user-facing content
- Include concrete examples and metrics where possible
- Ensure acceptance criteria are testable
- Link features to business value
- Identify dependencies early

## Quality Checklist

Before finalizing the PRD:
- [ ] All user personas defined
- [ ] All features have acceptance criteria
- [ ] Priority assigned to each feature
- [ ] Non-functional requirements specified
- [ ] Milestones are realistic
- [ ] Dependencies identified
- [ ] Risks documented
