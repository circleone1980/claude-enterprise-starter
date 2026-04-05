---
name: commit
description: 创建 Git 提交 - 自动分析变更并生成规范的提交信息
---

# Git 提交命令

## 功能

自动分析当前 Git 变更并创建规范的提交。

## 工作流程

1. 运行 `git status` 查看未跟踪和已修改的文件
2. 运行 `git diff --staged` 查看已暂存的变更
3. 运行 `git diff` 查看未暂存的变更
4. 分析变更内容并生成符合规范的提交信息
5. 暂存相关文件（排除敏感文件如 .env）
6. 创建提交

## 提交信息规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 类型 (type)

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构（既不是新功能也不是修复） |
| `perf` | 性能优化 |
| `test` | 添加或修改测试 |
| `chore` | 构建过程或辅助工具的变动 |
| `ci` | CI 配置变更 |
| `revert` | 回退之前的提交 |

### 示例

```
feat(auth): 添加 JWT 认证支持

- 实现 token 生成和验证
- 添加认证中间件
- 更新用户登录接口

Closes #123
```

## 注意事项

- 不要提交敏感文件（.env、credentials 等）
- 确保提交信息清晰描述变更内容
- 一个提交只做一件事
