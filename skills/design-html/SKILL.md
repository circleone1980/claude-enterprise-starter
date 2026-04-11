---
name: design-html
description: |
  Design Engineer - Convert approved mockups to production HTML/CSS.
  30KB zero-dependency, auto-detect React/Svelte/Vue framework.
  TRIGGER when: user says "convert mockup", "design to HTML", "production HTML",
  "模型转代码", "转 HTML", or after design-shotgun approval.
origin: gstack
effort: high
---

# Design HTML（设计转 HTML）

## 目的

将批准的设计模型转化为生产级 HTML/CSS 原型。30KB 零依赖，自动检测框架，输出可交付的前端代码。

## 何时激活

- design-shotgun 用户确认选中变体后
- design-consultation 用户说直接转代码
- 用户说 "模型转代码" / "转 HTML"

## 前置条件

- `workspace/docs/design/DESIGN.md` 已存在
- 用户已确认设计方向

## 工作流程

### Step 1: 读取设计输入

读取以下文件：
- DESIGN.md（设计系统）
- OFFICE_HOURS.md（产品上下文）
- .taste-memory.json（用户偏好，如存在）
- 选中的变体文件（如来自 design-shotgun）

### Step 2: 检测目标框架

自动检测项目使用的框架：
1. 检查 package.json 中的依赖
2. 如发现 React → 输出 JSX 兼容代码
3. 如发现 Vue → 输出 Vue SFC 兼容代码
4. 如发现 Svelte → 输出 Svelte 兼容代码
5. 默认 → 纯 HTML/CSS

### Step 3: 确定布局类型

智能路由，确定页面布局类型：
- 落地页（Landing Page）：首屏大图 + 特性列表 + CTA
- 仪表板（Dashboard）：侧边栏 + 主内容区 + 数据展示
- 表单（Form）：多步表单 / 单页表单
- 卡片布局（Cards）：信息卡片网格

### Step 4: 生成生产级 HTML

使用 Pretext 方法计算文本布局：
- 文本实际重排，高度随内容调整
- 30KB 最大开销
- 零外部依赖
- 响应式设计（mobile-first）
- 语义化 HTML
- 内联 CSS（或 CSS-in-JS 兼容）

### Step 5: 输出原型文件

写入 `workspace/docs/design/prototype/`：
- `index.html` - 完整的原型页面
- `styles.css` - 如需单独样式文件
- `README.md` - 原型使用说明

## 输出质量标准

| 指标 | 标准 |
|------|------|
| 文件大小 | 单页 < 30KB |
| 外部依赖 | 0 |
| 响应式 | Mobile / Tablet / Desktop |
| 语义化 | 使用 header/nav/main/section/article/footer |
| 可访问性 | ARIA 标签、焦点管理 |
| 浏览器兼容 | Chrome / Firefox / Safari 最新 2 版本 |

## 质量检查清单

- [ ] 原型文件已输出到 workspace/docs/design/prototype/
- [ ] 文件大小 < 30KB
- [ ] 零外部依赖
- [ ] 响应式布局正常
- [ ] 语义化 HTML 标签已使用
- [ ] ARIA 标签已添加
- [ ] 可以在浏览器中正常显示

## 下游传递

原型文件可供 Phase 1 PM/Architect 参考，也可供 Phase 2 前端开发直接使用。