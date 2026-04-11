---
name: design-consultation
description: |
  Design Partner - Research competitors, propose creative risks, generate DESIGN.md.
  TRIGGER when: user says "design consultation", "design system", "competitive analysis",
  "设计咨询", "设计系统", "竞品研究", or after office-hours completes.
origin: gstack
effort: high
---

# Design Consultation（设计咨询）

## 目的

基于 Office Hours 的产出，研究竞品设计，提出创意风险方案，生成完整的设计系统文档。

## 何时激活

- office-hours 技能完成后
- 用户说 "设计咨询" / "设计系统" / "竞品研究"

## 前置条件

- `workspace/docs/design/OFFICE_HOURS.md` 已存在

## 工作流程

### Step 1: 读取产品上下文

读取 OFFICE_HOURS.md，理解：
- 产品定义和核心功能
- 目标用户画像
- 竞争优势

### Step 2: 竞品设计研究

使用 WebSearch 研究至少 3 个竞品：
- 竞品的 UI 设计风格
- 竞品的用户流程
- 竞品的视觉语言（颜色、字体、间距）
- 竞品做得好的地方
- 竞品做得不好的地方

### Step 3: 提出创意风险

提出 2-3 个创意设计方案，每个方案：
- 与竞品的差异化
- 潜在的设计风险
- 预期用户体验改进
- 技术可行性评估

### Step 4: 生成设计系统

写入 `workspace/docs/design/DESIGN.md`，包含：

```markdown
# 设计系统

## 设计哲学
一句话描述产品的设计哲学：...

## 竞品分析
| 竞品 | 优点 | 缺点 | 我们的差异化 |
|------|------|------|-------------|

## 设计令牌
### 颜色
- 主色：...
- 辅色：...
- 背景色：...
- 文字色：...

### 字体
- 标题字体：...
- 正文字体：...
- 代码字体：...

### 间距
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## 组件清单
| 组件 | 描述 | 变体 |
|------|------|------|

## 布局模式
- 页面布局：...
- 导航模式：...
- 内容网格：...

## 创意风险方案
### 方案 A: ...
### 方案 B: ...
### 方案 C: ...

## 推荐方案及理由
...
```

## 质量检查清单

- [ ] 至少研究了 3 个竞品
- [ ] 设计令牌完整（颜色/字体/间距）
- [ ] 组件清单与核心功能对应
- [ ] 提出了至少 2 个创意风险方案
- [ ] DESIGN.md 已写入

## 下游传递

完成后可传递给 `design-shotgun`（视觉探索）或直接传递给 `design-html`（转 HTML）。