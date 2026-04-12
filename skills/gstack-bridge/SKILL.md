---
name: gstack-bridge
description: |
  Handoff protocol - Parse GStack Phase 0.5 outputs into Phase 1 PRD format.
  Transforms DESIGN.md + IMPLEMENTATION_PLAN.md into structured PRD inputs.
  TRIGGER when: Phase 0.5 completes and Phase 1 is about to start.
  NOT user-invocable (called automatically by orchestration).
origin: custom
effort: medium
user-invocable: false
disable-model-invocation: true
---

# GStack Bridge（Phase 0.5 → 1 交接协议）

## 目的

将 GStack Phase 0.5 的所有产出转换为 Phase 1 可直接使用的 PRD 格式。这是整个集成的关键交接点。

## 何时激活

- Phase 0.5b 完成后自动触发
- Phase 0.5 → Phase 1 门禁通过时
- **不是用户可调用的技能**

## 前置条件

- workspace/docs/design/OFFICE_HOURS.md 已存在
- workspace/docs/design/DESIGN.md 已存在
- workspace/docs/design/IMPLEMENTATION_PLAN.md 已存在
- workspace/docs/design/IMPLEMENTATION_PLAN.json 已存在

## 工作流程

### Step 1: 读取所有 Phase 0.5 输出

读取以下文件：
- OFFICE_HOURS.md
- DESIGN.md
- IMPLEMENTATION_PLAN.md
- IMPLEMENTATION_PLAN.json
- .taste-memory.json（如存在）
- prototype/ 目录下的文件（如存在）

### Step 2: 转换为 PRD 格式

#### 映射关系

| GStack 输出 | PRD 目标 |
|------------|----------|
| OFFICE_HOURS "什么问题" | PRD §1 产品背景 |
| OFFICE_HOURS "谁有这个问题" | PRD §2 目标用户（用户画像）|
| OFFICE_HOURS "现有方案" | PRD §7 竞品分析 |
| OFFICE_HOURS "楔子" | PRD §1 核心差异化 |
| IMPLEMENTATION_PLAN CEO 审查 | PRD §3 功能需求（优先级排序）|
| IMPLEMENTATION_PLAN 工程架构 | 01_系统架构设计.md |
| IMPLEMENTATION_PLAN 数据流 | 02_数据库设计.md（数据模型）|
| IMPLEMENTATION_PLAN API 设计 | 03_API接口设计.md |
| IMPLEMENTATION_PLAN 设计评分 | 04_UI设计规范.md（设计约束）|
| IMPLEMENTATION_PLAN DX 审查 | PRD §4 非功能需求 |
| DESIGN.md 设计令牌 | 04_UI设计规范.md（颜色/字体/间距）|
| DESIGN.md 组件清单 | 04_UI设计规范.md（组件库）|

### Step 3: 写入 PRD 骨架

#### 非破坏性合并策略

如果 `workspace/docs/requirements/PRD.md` 已存在：
- 在文件顶部追加 `## GStack 产品设计输入` 区段
- 用 `<!-- GSTACK-GENERATED -->` 注释标注
- 不修改用户已有内容

如果 PRD.md 不存在：
- 创建完整的 PRD 骨架文件

#### PRD 骨架结构

```markdown
# 产品需求文档 (PRD)

<!-- GSTACK-GENERATED -->
## GStack 产品设计输入

### 产品背景
（来自 OFFICE_HOURS.md 的 "什么问题" + "楔子"）

### 目标用户
（来自 OFFICE_HOURS.md 的 "谁有这个问题"）

### 核心差异化
（来自 OFFICE_HOURS.md 的 "楔子"）

### 功能需求
（来自 IMPLEMENTATION_PLAN.md CEO 审查的功能列表）

#### P0 - 必须有
1. ...

#### P1 - 应该有
1. ...

#### P2 - 可以有
1. ...

### 非功能需求
（来自 IMPLEMENTATION_PLAN.md DX 审查 + 工程审查）

- 性能: ...
- 安全: ...
- 可用性: ...

### 竞品分析
（来自 OFFICE_HOURS.md 的 "现有方案" + DESIGN.md 的竞品分析）

<!-- /GSTACK-GENERATED -->

---

## Phase 1 待完善

> 以下章节由 PM/PO/Architect 在 Phase 1 中补充和完善

### 用户故事
（待 Phase 1 补充）

### 验收标准
（待 Phase 1 补充）

### Sprint 计划
（待 Phase 1 补充）
```

### Step 4: 写入设计规范

将 DESIGN.md 的设计令牌和组件清单写入 `workspace/docs/design/04_UI设计规范.md`（如不存在则创建，如存在则追加 GStack 区段）。

### Step 5: 写入架构参考

将 IMPLEMENTATION_PLAN.md 的架构图写入 `workspace/docs/design/01_系统架构设计.md`（如不存在则创建骨架）。

### Step 6: 标记完成

创建 `workspace/docs/design/.gstack-bridge-complete` 标记文件。

## 质量检查清单

- [ ] PRD.md 已创建或追加 GStack 区段
- [ ] 04_UI设计规范.md 已创建或追加设计令牌
- [ ] 01_系统架构设计.md 已创建骨架（如适用）
- [ ] 所有 GStack 内容用 GSTACK-GENERATED 注释标注
- [ ] .gstack-bridge-complete 标记文件已创建
- [ ] Phase 1 PM 可以直接使用预填充的内容

## Phase 1 PM 使用指南

PM agent 在 Phase 1 启动时应：
1. 检查 PRD.md 是否存在 GSTACK-GENERATED 区段
2. 如果存在：精炼和完善 GStack 内容，而非从零创建
3. 如果不存在：正常从零创建 PRD（向后兼容）

## 向后兼容

- 如果 GStack 未启用，此技能不执行
- 如果 GStack 启用但 Phase 0.5 未完成，此技能不执行
- 现有 Phase 1 工作流程完全不受影响