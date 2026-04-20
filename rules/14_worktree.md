# Git Worktree 使用规则

> Git Worktree 允许在同一仓库中同时检出多个分支到不同目录

---

## 何时使用 Worktree

**适用场景**:
- **长时重构** - 重构需要跨多个文件、持续数天，不适合频繁分支切换
- **多分支并行** - 同时处理多个功能分支，如修复 hotfix 的同时开发 feature
- **紧急 bugfix** - 需要在保留当前工作上下文的情况下快速切换到修复分支
- **独立实验** - 尝试高风险变更而不影响主工作区

**不适用场景**:
- 短期小改动（直接用分支切换）
- 纯代码审查（用 GitHub PR）
- 简单 bugfix（用分支切换）

---

## Worktree vs Agent Teams

| Worktree | Agent Teams |
|----------|-------------|
| 物理隔离：不同目录 | 逻辑隔离：同一目录 |
| 跨分支并行开发 | 单分支多角色协作 |
| Git 原生支持 | Claude Code 特性 |
| 适合长时隔离任务 | 适合临时协作任务 |

**选择指南**:
- 需要独立目录、保留不同 Git 状态 → **Worktree**
- 需要多人协作、统一上下文 → **Agent Teams**
- 两者可以结合使用：每个 worktree 内启动不同 agent team

---

## 与 .worktreeinclude 配合

`.worktreeinclude` 指定了哪些 gitignored 文件应该被复制到新 worktree：

```
# 环境配置
.env
.env.local

# IDE 配置
.vscode/
.idea/

# Claude 本地配置
CLAUDE.local.md
.claude/settings.local.json
```

**创建 worktree 时自动复制**，无需手动处理。

---

## 命令速查

使用 `scripts/worktree-manager.sh` 统一管理：

```bash
# 创建新 worktree + 分支
bash scripts/worktree-manager.sh create feature/auth

# 列出所有 worktree
bash scripts/worktree-manager.sh list

# 显示状态概览
bash scripts/worktree-manager.sh status

# 合并 worktree 到 main
bash scripts/worktree-manager.sh merge feature/auth

# 删除 worktree + 分支
bash scripts/worktree-manager.sh remove feature/auth
```

---

## 最佳实践

### 命名规范
- 功能分支: `feature/<name>`
- 修复分支: `fix/<name>`
- 热修复: `hotfix/<name>`
- 重构: `refactor/<name>`
- 实验性: `experiment/<name>`

### 合并流程
1. 在 worktree 中完成开发和测试
2. 提交所有改动
3. 运行 `bash scripts/worktree-manager.sh merge <branch>`
4. 确认合并成功后删除 worktree

### 清理
- 定期运行 `bash scripts/worktree-manager.sh status` 检查过期 worktree
- 合并完成后及时删除已合并的 worktree
- 使用 `git worktree prune` 清理已删除的工作树引用

### 注意事项
- 每个 worktree 都有独立的 `.git` 文件（指向主仓库）
- 不要直接删除 worktree 目录，使用 `worktree-manager.sh remove`
- worktree 内的 git 操作影响同一主仓库的所有 worktree
- 避免在不同 worktree 中操作同一分支

---

*加载顺序: 14*
