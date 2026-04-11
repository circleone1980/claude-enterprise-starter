---
name: sprint-planning
origin: custom
description: |
  Sprint planning and iteration management for agile development teams.
  
  TRIGGER when: user asks about sprint planning, iteration planning, task allocation, mentions "Sprint", "迭代", "迭代规划", "任务分配", "task planning", "sprint backlog", "story points", "velocity".
  
  Use this skill when starting a new development cycle, planning work distribution, or organizing tasks into iterations. Essential for PM and PO roles.
effort: medium
---

# Sprint Planning

A structured approach to planning and executing development sprints.

## Sprint Overview

| Parameter | Recommended Value |
|-----------|-------------------|
| Sprint Length | 2 weeks |
| Planning Timebox | 2-4 hours |
| Daily Standup | 15 minutes |
| Sprint Review | 1 hour |
| Sprint Retrospective | 1 hour |

## Planning Workflow

### Step 1: Gather Requirements

Collect and prioritize work items:
- Product backlog items ready for development
- Bug fixes requiring attention
- Technical debt to address
- Dependencies from previous sprints

### Step 2: Define Sprint Goal

Create a clear, measurable objective:
```
Sprint Goal: [What we aim to achieve by sprint end]

Success Metrics:
- [Measurable outcome 1]
- [Measurable outcome 2]
```

### Step 3: Break Down Tasks

Decompose features into actionable tasks. **每个任务必须关联到具体的 AC ID**，确保验收标准可追溯：

```
Feature: User Authentication (FEAT-001)
├── Task 1.1: Design auth API (Architect)     → AC-F001-01, AC-F001-02  - 2h
├── Task 1.2: Implement JWT logic (Backend-1) → AC-F001-01, AC-F001-03  - 4h
├── Task 1.3: Create login UI (Frontend-1)    → AC-F001-02, AC-F001-04  - 3h
├── Task 1.4: Write unit tests (QA)           → AC-F001-01~04           - 2h
├── Task 1.5: Integration testing (QA)        → AC-F001-01~04           - 2h
└── Task 1.6: Update documentation (PO)       → —                       - 1h
```

**AC 关联规则**:
- 每个开发任务必须关联至少一个 AC ID（格式: `AC-F{NNN}-{MM}`）
- 测试任务应覆盖关联 Feature 的所有 AC
- 非功能性任务（文档、配置）可以不关联 AC
- AC ID 来源于 `docs/requirements/acceptance-criteria.md`（SSOT）

### Step 4: Estimate Effort

Use story points or time estimates. **AC IDs 列追踪验收覆盖**:

| Task | AC IDs | Estimate | Assignee | Dependencies |
|------|--------|----------|----------|--------------|
| 1.1 Design API | AC-F001-01, AC-F001-02 | 2h | Architect | None |
| 1.2 Implement JWT | AC-F001-01, AC-F001-03 | 4h | Backend-1 | 1.1 |
| 1.3 Create UI | AC-F001-02, AC-F001-04 | 3h | Frontend-1 | 1.1 |
| 1.4 Unit tests | AC-F001-01~04 | 2h | QA | 1.2, 1.3 |
| 1.5 Integration | AC-F001-01~04 | 2h | QA | 1.4 |
| 1.6 Docs | — | 1h | PO | 1.5 |

### Step 5: Assign Tasks

Use Claude Code task tools:
```bash
# Create sprint tasks（描述中包含 AC ID，供 ac-status-update.js 提取）
TaskCreate --subject "Sprint 1: Implement JWT logic" --description "FEAT-001 AC-F001-01 AC-F001-03: 实现 JWT 认证逻辑..."

# Assign to team members
TaskUpdate --taskId "1" --owner "Backend-1"
TaskUpdate --taskId "2" --owner "Frontend-1"
```

### Step 6: Create Sprint Backlog

```markdown
# Sprint [N] Backlog

## Sprint Goal
[Clear objective for this sprint]

## Sprint Metrics
- Total Story Points: X
- Team Velocity: Y points/sprint
- Capacity: Z person-days

## Task Board

### 📋 To Do
- [ ] #1: Design auth API (Architect) - 2h
- [ ] #2: Implement JWT logic (Backend-1) - 4h

### 🔄 In Progress
- [ ] #3: Create login UI (Frontend-1) - 3h

### 👀 Review
- [ ] #4: Unit tests (QA) - waiting for review

### ✅ Done
- [x] #0: Setup sprint board (PM)

## Dependencies
```mermaid
graph LR
    A[Design API] --> B[Backend]
    A --> C[Frontend]
    B --> D[Tests]
    C --> D
    D --> E[Review]
```

## Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ... | High/Med/Low | High/Med/Low | ... |
```

## Daily Standup Format

```markdown
## Standup [Date]

### Yesterday
- [Name]: Completed X, working on Y

### Today
- [Name]: Focus on Z

### Blockers
- [Name]: Waiting for [dependency]
```

## Sprint Review Checklist

- [ ] Demo all completed features
- [ ] Collect stakeholder feedback
- [ ] Document any scope changes
- [ ] Update product backlog
- [ ] Celebrate achievements

## Retrospective Format

```markdown
# Sprint [N] Retrospective

## What went well 🟢
- [Positive observations]

## What could improve 🟡
- [Areas for improvement]

## Action items 🔵
| Action | Owner | Due |
|--------|-------|-----|
| ... | ... | ... |
```

## Planning Checklist

Before starting the sprint:
- [ ] Sprint goal defined and communicated
- [ ] All tasks identified and estimated
- [ ] Dependencies mapped
- [ ] Resources assigned
- [ ] Risks assessed
- [ ] Capacity confirmed
- [ ] Definition of Done agreed
- [ ] **所有开发任务已关联 AC ID**（格式: `AC-F{NNN}-{MM}`）
- [ ] **ac-tracker.json 已同步**（运行 `node scripts/ac-tracker-sync.js`）

**Related Skills**: `product-requirements`, `writing-plans` (for architecture design)
