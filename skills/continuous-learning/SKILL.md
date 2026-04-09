---
name: continuous-learning
description: |
  持续学习系统 — 从会话中自动提取"本能"（instinct），置信度评分，进化为技能。
  TRIGGER when: 会话结束、模式识别、本能管理。
origin: ECC
version: 1.0.0
effort: high
---

# Continuous Learning（持续学习）

从日常会话中自动提取模式，积累为可复用的"本能"。

## 核心概念: Instinct（本能）

本能是一个**原子化的学习行为**，从会话中提取：

```yaml
id: "prefer-readonly-queries"
trigger: "编写数据库查询时"
action: "默认使用 @Transactional(readOnly = true)"
confidence: 0.7
domain: "database"
source: "session-2026-04-09"
scope: "project"  # project 或 global
evidence:
  - "用户纠正了 3 次忘记加 readOnly"
```

## 置信度体系

| 置信度 | 含义 | 行为 |
|--------|------|------|
| 0.3 | 试探性 | 建议但不强制 |
| 0.5 | 中等 | 相关时自动应用 |
| 0.7 | 强 | 自动批准执行 |
| 0.9 | 近确定 | 核心行为，始终执行 |

## 学习来源

### 通过 Hooks 100% 捕获（非概率性）

- 用户纠正（"不对"、"不要这样做"）
- 用户确认（"对"、"就是这样"、"完美"）
- 重复出现的模式
- 错误和修复模式

### 本能文件结构

```
.claude/instincts/
  personal/
    prefer-readonly-queries.yaml
    no-console-log-in-prod.yaml
    ...
  inherited/
    ...
```

## 管理命令

### 查看本能状态
```
查看当前已学习的本能和置信度
```

### 进化（将相关本能聚类为新技能）
```
将相关本能聚合成一个新的 Skill 文件
```

### 修剪（删除过期本能）
```
删除超过 30 天未触发的本能（TTL 机制）
```

## 自动晋升规则

当一个本能同时满足以下条件时，自动从 project 晋升为 global：

1. 在 2+ 个项目中出现相同 ID 的本能
2. 平均置信度 ≥ 0.8

## 与 Hooks 的协作

```
会话活动
  → Hooks 100% 捕获所有工具调用
  → 观察记录写入 .claude/logs/observations.jsonl
  → 后台分析：模式检测
  → 创建/更新本能
  → /evolve 聚类 → 进化为 Skill
```

## 为什么用 Hooks 而非 Skills？

> Skills 是概率性的（50-80% 触发率，取决于 Claude 的判断）。
> Hooks 是**确定性的**（100% 触发，不受 Claude 判断影响）。
> 因此，观察和捕获用 Hooks，指导和执行用 Skills。

## 反模式

- ❌ 不在 Skills 中实现观察（触发率不稳定）
- ❌ 不存储具体代码（只存模式和规则）
- ❌ 不存储临时状态（本能是持久化的学习）
