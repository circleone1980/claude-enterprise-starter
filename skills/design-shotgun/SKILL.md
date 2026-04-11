---
name: design-shotgun
description: |
  Design Explorer - Generate 4-6 AI mockup variants, browser comparison panel, taste memory.
  TRIGGER when: user says "show me options", "design variants", "mockup", "设计变体",
  "模型对比", "给我看选项", or when visual exploration is needed.
origin: gstack
effort: medium
mcpServers: [playwright]
---

# Design Shotgun（设计变体探索）

## 目的

"给我看选项"。基于 DESIGN.md 的设计方向，生成 4-6 个 UI 变体，在浏览器中展示对比面板，收集用户反馈，迭代直到满意。

## 何时激活

- design-consultation 完成后
- 用户说 "给我看选项" / "设计变体" / "模型对比"
- 需要视觉方向探索时

## 前置条件

- `workspace/docs/design/DESIGN.md` 已存在

## 工作流程

### Step 1: 读取设计方向

读取 DESIGN.md：
- 设计令牌（颜色/字体/间距）
- 组件清单
- 布局模式
- 创意风险方案

### Step 2: 生成变体

基于设计方向，生成 4-6 个 HTML 变体：
- 每个变体体现不同的视觉方向
- 变体之间在以下维度有所不同：
  - 配色方案（暖色/冷色/中性）
  - 布局密度（紧凑/舒适/宽松）
  - 交互风格（简约/丰富/游戏化）
- 每个变体是一个完整的 HTML 文件（内联 CSS）

### Step 3: 构建对比面板

生成一个对比面板 HTML 文件：
- 所有变体并排展示（网格布局）
- 每个变体下方有 "喜欢" / "不喜欢" 按钮
- 每个变体有简短描述（设计方向标签）

### Step 4: 收集反馈

在浏览器中打开对比面板（使用 Playwright MCP）：
- 展示所有变体
- 收集用户反馈
- 记录用户偏好

### Step 5: 更新品味记忆

将用户偏好写入 `workspace/docs/design/.taste-memory.json`：

```json
{
  "entries": [
    {
      "timestamp": "...",
      "preferred_direction": "...",
      "rejected_directions": ["..."],
      "feedback": "...",
      "patterns": {
        "color_preference": "...",
        "density_preference": "...",
        "interaction_style": "..."
      }
    }
  ],
  "_meta": {
    "max_entries": 50,
    "eviction": "lru"
  }
}
```

### Step 6: 迭代或确认

- 如果用户不满意，根据反馈生成新一轮变体
- 如果用户满意，记录选中的变体编号
- 迭代不超过 3 轮

## 质量检查清单

- [ ] 生成了至少 4 个变体
- [ ] 每个变体有清晰的设计方向标签
- [ ] 对比面板可以在浏览器中正常显示
- [ ] 用户反馈已记录到品味记忆
- [ ] 品味记忆文件未超过 50 条（LRU 淘汰）

## 下游传递

用户确认选中变体后，传递给 `design-html` 技能转换为生产级代码。