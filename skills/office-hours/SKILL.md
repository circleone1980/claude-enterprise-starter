---
name: office-hours
description: |
  YC Office Hours - 6 mandatory questions to redefine product before coding.
  Outputs a structured design document challenging assumptions.
  TRIGGER when: user says "office hours", "product ideation", "challenge assumptions",
  "define product", "产品构思", "挑战假设", "定义产品", or Phase 0.5a starts.
origin: gstack
effort: high
---

# Office Hours (YC 风格)

## 目的

在写任何代码之前，通过 6 个强制问题挑战产品假设，将模糊想法转化为精确的产品定义。灵感来自 Y Combinator 的 Office Hours。

## 何时激活

- Phase 0.5a 启动时
- 用户说 "产品构思" / "挑战假设" / "定义产品"
- 用户描述了一个模糊的产品想法

## 工作流程

### Step 1: 6 个 YC 强制问题

按顺序向用户提问以下问题，每个问题必须得到**具体、可操作**的回答：

1. **什么问题？** (What problem?)
   - 不是"做什么"，而是"解决什么痛点"
   - 要求用户用一句话描述目标用户的具体痛点

2. **谁有这个问题？** (Who has it?)
   - 不是"所有人"，而是具体的用户画像
   - 要求至少描述 3 个典型用户场景

3. **他们现在怎么解决？** (How do they solve it now?)
   - 现有方案（包括手动流程、竞品、变通方案）
   - 现有方案的具体痛点和不满足之处

4. **你的楔子是什么？** (What is your wedge?)
   - 为什么用户会选你而不是现有方案？
   - 你的独特优势（10x 更好 / 更便宜 / 更快）

5. **你怎么赚钱？** (How do you make money?)
   - 商业模式（订阅 / 交易 / 广告 / 增值服务）
   - 定价策略和单位经济

6. **你怎么获取用户？** (How do you get users?)
   - 获客渠道（SEO / 内容 / 社交 / 付费 / 病毒式传播）
   - 初始 100 个用户从哪里来

### Step 2: 挑战每个回答

对每个回答进行挑战：
- 追问 "为什么"（至少 3 层）
- 指出潜在的逻辑漏洞
- 提出反面假设
- 要求更具体的数字和指标

### Step 3: 重新定义产品

基于挑战后的回答：
- 用一句话重新定义产品
- 列出 3-5 个核心功能（不是 20 个）
- 明确 "不做什么"（排除范围）
- 确定成功指标（不是 "用户喜欢"，而是具体的可衡量指标）

### Step 4: 输出设计文档

将所有内容写入 `workspace/docs/design/OFFICE_HOURS.md`，格式：

```markdown
# Office Hours 产出

## 产品定义
一句话描述：...

## 问题与用户
- 核心问题：...
- 目标用户画像：...
- 现有方案分析：...

## 竞争优势
- 楔子：...
- 为什么 10x 更好：...

## 商业模式
- 赚钱方式：...
- 定价策略：...

## 获客策略
- 渠道：...
- 初始 100 用户：...

## 核心功能（3-5 个）
1. ...

## 不做什么
- ...

## 成功指标
- ...

## 品味决策
- [ ] 用户已确认产品定义
- [ ] 用户已确认核心功能范围
```

## 质量检查清单

- [ ] 6 个问题全部回答且经过挑战
- [ ] 产品定义是一句话，清晰无歧义
- [ ] 核心功能不超过 5 个
- [ ] "不做什么" 列表存在
- [ ] 成功指标是可衡量的
- [ ] OFFICE_HOURS.md 已写入

## 下游传递

完成后自动传递给 `design-consultation` 技能。