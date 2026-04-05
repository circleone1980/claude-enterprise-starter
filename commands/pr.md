---
name: pr
description: 创建 Pull Request - 分析当前分支变更并创建 PR
---

# 创建 Pull Request

## 功能

分析当前分支的变更，生成 PR 标题和描述，并创建 GitHub Pull Request。

## 工作流程

1. 检查当前分支名称和状态
2. 获取与基础分支的差异
3. 分析提交历史和文件变更
4. 生成 PR 标题和描述
5. 确认后创建 PR

## PR 模板

```markdown
## Summary

<!-- 简要描述此 PR 的目的 -->

## Changes

<!-- 列出主要变更 -->

- [ ] 变更 1
- [ ] 变更 2
- [ ] 变更 3

## Test Plan

<!-- 描述如何测试这些变更 -->

- [ ] 测试步骤 1
- [ ] 测试步骤 2

## Screenshots

<!-- 如有 UI 变更，添加截图 -->

## Related Issues

<!-- 关联的 Issue -->

Closes #
```

## 注意事项

- 确保 PR 标题遵循 Conventional Commits 规范
- 描述清楚变更的原因和影响
- 关联相关的 Issue
- 确保 CI 通过后再请求审查
