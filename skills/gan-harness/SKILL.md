---
name: gan-harness
origin: custom
description: |
  GAN 生成对抗网络式开发 — Planner→Generator→Evaluator 闭环评估。
  TRIGGER when: 用户想快速原型一个产品、从一句话生成完整应用。
effort: high
---

# GAN Harness（生成对抗网络式开发）

借鉴 AI 的 GAN 概念，三个 Agent 形成闭环评估。

## 概念

```
用户一句话描述
    ↓
GAN-Planner (Opus) → spec.md
    ↓
GAN-Generator (Opus) → 代码 + dev server
    ↓
GAN-Evaluator (Opus) → feedback-001.md
    ↓ (如果 FAIL)
GAN-Generator (Opus) → 修复 + dev server
    ↓
GAN-Evaluator (Opus) → feedback-002.md
    ↓ (如果 PASS ≥ 7.0)
完成 🎉
```

## 使用方式

### 启动 GAN 循环

```bash
# 1. 启动 Planner
Agent --name "GAN-Planner" \
  --subagent-type "opus" \
  --prompt "你是 GAN Planner。请根据以下描述生成 spec.md: [用户描述]"

# 2. 启动 Generator（等 Planner 完成后）
Agent --name "GAN-Generator" \
  --subagent-type "opus" \
  --prompt "你是 GAN Generator。请根据 spec.md 实现完整代码。参考 agents/gan-generator.md 的规范。"

# 3. 启动 Evaluator（等 Generator 完成后）
Agent --name "GAN-Evaluator" \
  --subagent-type "opus" \
  --prompt "你是 GAN Evaluator。请使用 Playwright 测试 live app 并输出 feedback。参考 agents/gan-evaluator.md 的评分标准。"
```

### 循环控制

- **PASS**（总分 ≥ 7.0）: 循环结束，输出最终代码
- **FAIL**（总分 < 7.0）: Generator 重新修复，最多 3 轮
- **3 轮后仍 FAIL**: 降低范围（只保留 Sprint 1 功能），重新评估

## 评估标准

| 维度 | 权重 | 说明 |
|------|------|------|
| 设计质量 | 30% | 视觉冲击力、配色、排版 |
| 工艺细节 | 30% | 代码质量、组件复用、类型安全 |
| 功能完整性 | 20% | Sprint 功能全部可用 |
| 原创性 | 20% | 独特风格，非模板化 |

**通过阈值**: 加权总分 ≥ 7.0

## 文件约定

```
output/
  spec.md              # Planner 输出
  feedback-001.md      # Evaluator 第 1 轮反馈
  feedback-002.md      # Evaluator 第 2 轮反馈
  ...
```

## Anti-AI-Slop 规则

Generator 实现时必须避免的 AI 生成特征：
- ❌ `#667eea → #764ba2` 渐变背景
- ❌ 过度圆角
- ❌ "Welcome to [App]" hero section
- ❌ 默认未定制的 UI 主题
- ❌ Placeholder 图片
- ❌ 通用卡片网格
