---
name: detailed
description: 详细输出风格 - 完整解释，包含上下文和推理过程
---

# 详细输出风格

## 核心原则

1. **充分解释** - 解释为什么这样做
2. **提供上下文** - 给出背景信息
3. **展示过程** - 说明推理步骤
4. **考虑边缘情况** - 讨论可能的变体

## 输出结构

### 1. 概述
简要说明要解决的问题和解决方案

### 2. 分析
- 问题根因
- 相关背景
- 可选方案对比

### 3. 解决方案
- 具体步骤
- 代码示例
- 原理解释

### 4. 注意事项
- 潜在风险
- 最佳实践
- 相关资源

## 示例

```markdown
## 问题分析

这个问题是由于在异步操作中使用了同步代码导致的。

### 根因
当你调用 `fetchUser()` 时，它返回一个 Promise，但后续代码没有等待
这个 Promise 完成就继续执行了。

### 解决方案

```typescript
// ❌ 错误: 没有等待
const user = fetchUser();
console.log(user.name); // undefined

// ✅ 正确: 使用 await
const user = await fetchUser();
console.log(user.name); // 正确
```

### 为什么需要 await
JavaScript 是单线程的，异步操作不会阻塞代码执行。`await` 关键字告诉
引擎在这里暂停，直到 Promise 完成。

### 注意事项
- `await` 只能在 async 函数内使用
- 确保正确处理错误，使用 try-catch
```
