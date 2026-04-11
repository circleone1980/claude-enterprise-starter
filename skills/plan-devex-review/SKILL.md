---
name: plan-devex-review
description: |
  DX Lead review - Interactive DX audit, developer persona, competitor TTHW benchmark.
  TRIGGER when: user says "DX review", "devex audit", "开发者体验审查", "DX审查",
  or during autoplan.
origin: gstack
effort: medium
---

# Plan DevEx Review（开发者体验审查）

## 目的

交互式 DX 审查：开发者画像、竞品 TTHW 基准、神奇时刻设计、摩擦点追踪。

## 何时激活

- autoplan 流水线内部调用
- 用户说 "开发者体验审查" / "DX 审查"

## 前置条件

- OFFICE_HOURS.md 和 DESIGN.md 已存在

## 工作流程

### Step 1: 开发者画像

定义目标开发者：
- 经验水平（初级/中级/高级）
- 技术栈熟悉度
- 使用场景（个人/团队/企业）
- 时间预算（空闲时间/工作时间/紧急）

### Step 2: TTHW 基准测试

Time to Hello World 基准：
- 竞品 A 的 TTHW: X 分钟
- 竞品 B 的 TTHW: Y 分钟
- 目标 TTHW: < Z 分钟
- 达到目标的可行性评估

### Step 3: 神奇时刻设计

定义 "Aha Moment"：
- 用户第一次感受到产品价值的时刻
- 如何在最短时间内让用户到达这个时刻
- 神奇时刻的具体设计

### Step 4: 摩擦点追踪

识别潜在摩擦点：

| 阶段 | 摩擦点 | 严重程度 | 缓解方案 |
|------|--------|---------|----------|
| 发现 | ... | 高/中/低 | ... |
| 安装 | ... | 高/中/低 | ... |
| 配置 | ... | 高/中/低 | ... |
| 使用 | ... | 高/中/低 | ... |
| 深入 | ... | 高/中/低 | ... |

### Step 5: 文档完善度评估

评估文档需求：
- 是否需要快速入门指南
- 是否需要 API 参考
- 是否需要示例代码
- 是否需要故障排查指南

### Step 6: 输出

输出 DX 审查结果：
- 开发者画像
- TTHW 基准
- 神奇时刻设计
- 摩擦点清单
- 文档需求

## 质量检查清单

- [ ] 开发者画像已定义
- [ ] TTHW 基准已测量/估算
- [ ] 神奇时刻已设计
- [ ] 摩擦点已追踪
- [ ] 文档需求已评估