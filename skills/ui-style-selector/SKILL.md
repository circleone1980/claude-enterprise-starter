---
name: ui-style-selector
origin: custom
description: |
  Select UI design style based on project scenario. Brainstorm to match scenario
  with 60 brand styles, then load the corresponding DESIGN.md template.
  TRIGGER when: starting UI design, choosing design style, mentions "UI风格选择",
  "设计风格确认", "选择风格", "style selection", "设计风格".
effort: high
---

# UI 风格选择器

基于项目场景（业务领域、目标用户、品牌调性），从 60 个品牌风格模板中自动选择最匹配的 UI 设计风格。

---

## 风格资源

- **风格对照表**: `tips/UI设计风格/ui风格对照表.md` — 60 个品牌风格 × 7 大分类
- **风格模板**: `tips/UI设计风格/design-md/{style}/DESIGN.md` — 完整的设计系统规范

### 风格分类

| 分类 | 代表品牌 |
|------|---------|
| AI 与机器学习 | Claude, Cursor, Vercel, OpenCode AI |
| 开发者工具 | Linear, Figma, Supabase, Warp |
| 基础设施和云 | ClickHouse, HashiCorp, MongoDB, Stripe |
| 设计与生产力 | Notion, Framer, Airtable, Miro |
| 金融科技 | Coinbase, Revolut, Wise, Kraken |
| 企业与消费者 | Apple, Airbnb, Spotify, Uber |
| 汽车品牌 | Tesla, BMW, Ferrari, Lamborghini |

---

## 工作流程

### Step 1: 场景分析

读取 `tips/UI设计风格/ui风格对照表.md`，基于以下维度分析项目：

- **业务领域**: 产品属于哪个行业/领域？
- **目标用户**: 面向开发者、企业用户还是普通消费者？
- **品牌调性**: 专业/极简 vs 活泼/友好 vs 高端/奢华？
- **技术属性**: 数据密集型 vs 内容展示型 vs 工具型？
- **视觉偏好**: 深色主题 vs 浅色主题 vs 渐变/活力？

### Step 2: 风格匹配

基于场景分析，从对照表中匹配 2-3 个候选风格：

输出格式：
```
## 候选风格推荐

### 🥇 首选: {风格名}
- 匹配理由: [为什么这个风格最适合]
- 视觉特征: [色彩/排版/布局关键特征]
- 模板路径: tips/UI设计风格/design-md/{style}/DESIGN.md

### 🥈 备选: {风格名}
- 匹配理由: [为什么也合适]
- 差异点: [与首选的区别]

### 🥉 备选: {风格名}
- 匹配理由: [特定场景下的优势]
```

### Step 3: 用户确认

等待用户确认最终选择的风格。

### Step 4: 加载设计规范

读取选定的 `tips/UI设计风格/design-md/{style}/DESIGN.md`，提取关键设计约束：
- 色彩体系（主色、辅色、背景色、文本色）
- 排版系统（字体、字号、字重、行高）
- 间距系统（padding、margin、gap）
- 组件规范（按钮、卡片、表单、导航）
- 动效规范（过渡、动画）

### Step 5: 输出设计约束

将提取的设计约束输出，供 UI Designer 和 Frontend 开发使用。
建议将选定风格写入 `docs/design/04_UI设计规范.md`。

---

## 使用示例

```bash
# 手动调用
/ui-style-selector

# 在 Agent 中调用
Skill ui-style-selector
```

---

## 注意事项

- 选择风格时应考虑目标用户的文化背景和使用习惯
- 同一项目应保持统一的视觉风格，避免混搭
- 选定后通过 ADR 记录选择理由，便于未来审查
- 如需自定义，以选定风格为基础进行扩展而非完全替换
