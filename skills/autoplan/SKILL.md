---
name: autoplan
description: |
  Automated review pipeline - runs CEO → Design → Eng → DX reviews sequentially.
  Only submits taste decisions for user approval.
  TRIGGER when: user says "autoplan", "auto review", "自动规划", "自动审查",
  or Phase 0.5b starts.
origin: gstack
effort: high
---

# Autoplan（自动规划审查）

## 目的

一键自动运行 CEO → 设计 → 工程 → DX 四维审查流水线。自动完成明显决策，只提交品味决策供用户审批。

## 何时激活

- Phase 0.5b 启动时
- 用户说 "自动规划" / "自动审查" / "autoplan"

## 前置条件

- `workspace/docs/design/DESIGN.md` 已存在
- `workspace/docs/design/OFFICE_HOURS.md` 已存在

## 工作流程

### Step 1: 读取所有设计输入

读取以下文件：
- OFFICE_HOURS.md（产品定义）
- DESIGN.md（设计系统）
- prototype/ 目录下的原型文件（如存在）

### Step 2: CEO 审查（内部执行 plan-ceo-review）

**角色**: CEO / 创始人
**关注**: 产品价值和范围

从用户视角重新思考问题：
- 这个产品是不是用户 "必须有" 还是 "有了也不错"？
- 核心功能是否真的只聚焦 3-5 个？
- 有没有隐藏的 10 星产品机会？
- 范围是否可以扩大/缩小以创造更大价值？

4 种模式：
1. **扩展**: 发现相邻机会，扩大范围
2. **选择性扩展**: 挑选最有价值的扩展点
3. **保持范围**: 当前范围已经是最佳的
4. **缩减**: 删减不核心的功能

### Step 3: 设计审查（内部执行 plan-design-review）

**角色**: 高级设计师
**关注**: 设计质量

对每个设计维度评分 0-10：
- 视觉层级（Visual Hierarchy）
- 一致性（Consistency）
- 可访问性（Accessibility）
- 品牌感（Brand Identity）
- 情感设计（Emotional Design）
- 交互反馈（Interaction Feedback）

对每个维度：
1. 给出当前评分
2. 解释 10 分是什么样的
3. 给出达到 10 分的具体建议

### Step 4: 工程审查（内部执行 plan-eng-review）

**角色**: 工程经理
**关注**: 架构可行性和边界情况

- 绘制 ASCII 架构图
- 定义数据流和状态机
- 列出所有边界情况
- 强制暴露隐藏假设
- 制定测试矩阵
- 分析故障模式
- 评估安全风险

### Step 5: DX 审查（内部执行 plan-devex-review）

**角色**: 开发者体验主管
**关注**: 开发者使用体验

- 定义开发者画像
- 竞品 TTHW（Time to Hello World）基准
- 设计 "神奇时刻"（Aha Moment）
- 追踪潜在摩擦点
- 评估文档完善度

### Step 6: 汇总输出

将所有审查结果汇总：

1. **评分报告**: 各维度评分 + 加权总分
2. **品味决策**: 需要用户确认的关键决策（不超过 5 个）
3. **改进建议**: 评分 < 8 的维度的具体改进方案
4. **风险评估**: 高/中/低风险清单

### Step 7: 写入输出文件

#### IMPLEMENTATION_PLAN.md（人类可读）

```markdown
# 实施计划

## 总体评分: X.X/10

## CEO 审查
- 模式: [扩展/选择性扩展/保持/缩减]
- 建议: ...
- 隐藏机会: ...

## 设计审查
| 维度 | 评分 | 10 分标准 | 改进建议 |
|------|------|----------|----------|

## 工程审查
### 架构图
```
(ASCII art)
```
### 数据流
...
### 边界情况
...
### 测试矩阵
...

## DX 审查
- 开发者画像: ...
- TTHW 基准: ...
- 神奇时刻: ...
- 摩擦点: ...

## 品味决策（需用户确认）
1. ...

## 风险评估
| 风险 | 级别 | 缓解方案 |
|------|------|----------|
```

#### IMPLEMENTATION_PLAN.json（机器可读）

```json
{
  "overallScore": 8.2,
  "dimensions": {
    "ceo": { "score": 8.5, "mode": "selective_expand" },
    "design": { "score": 7.8, "details": { "visualHierarchy": 8, "consistency": 7, ... } },
    "engineering": { "score": 8.0 },
    "devex": { "score": 8.5 }
  },
  "tasteDecisions": [...],
  "risks": [...],
  "timestamp": "..."
}
```

## 评分规则

| 维度 | 权重 |
|------|------|
| 产品价值 (CEO) | 30% |
| 设计质量 | 25% |
| 工程可行性 | 25% |
| 开发者体验 | 20% |

**总体评分 = 加权平均**

## 质量检查清单

- [ ] CEO 审查完成，模式已确定
- [ ] 设计审查完成，所有维度已评分
- [ ] 工程审查完成，架构图已生成
- [ ] DX 审查完成，TTHW 已基准测试
- [ ] 总体评分 ≥ 7.0/10
- [ ] 品味决策不超过 5 个
- [ ] IMPLEMENTATION_PLAN.md 已写入
- [ ] IMPLEMENTATION_PLAN.json 已写入
- [ ] overallScore 字段是有效的数字

## 下游传递

完成后触发 gstack-bridge 技能，将所有 Phase 0.5 输出转换为 Phase 1 格式。