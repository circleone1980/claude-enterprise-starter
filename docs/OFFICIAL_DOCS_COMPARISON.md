# Claude Code 官方文档对比分析报告

> 对比日期: 2026-04-05
> 官方文档: https://code.claude.com/docs/en/claude-directory

---

## 一、对比结果总览

### 官方支持的文件类型

| 文件 | 范围 | 提交 | 状态 | 说明 |
|------|------|------|------|------|
| `CLAUDE.md` | 项目 + 全局 | ✓ | ✅ 已有 | 核心指令文件 |
| `CLAUDE.local.md` | 仅项目 | ✗ | ✅ 已补充 | 个人项目偏好模板 |
| `rules/*.md` | 项目 + 全局 | ✓ | ✅ 已有 | 6 个规则文件 |
| `settings.json` | 项目 + 全局 | ✓ | ✅ 已有 | 共享设置 |
| `settings.local.json` | 仅项目 | ✗ | ✅ 已补充 | 个人设置覆盖模板 |
| `.mcp.json` | 仅项目 | ✓ | ✅ 已有 | MCP 工具集成 |
| `.worktreeinclude` | 仅项目 | ✓ | ✅ 已补充 | Worktree 文件复制配置 |
| `skills/<name>/SKILL.md` | 项目 + 全局 | ✓ | ✅ 已有 | 多个自定义技能 |
| `commands/*.md` | 项目 + 全局 | ✓ | ✅ 已补充 | 3 个命令文件 |
| `output-styles/*.md` | 项目 + 全局 | ✓ | ✅ 已补充 | 3 个输出风格 |
| `agents/*.md` | 项目 + 全局 | ✓ | ✅ 已有 | 9 个代理定义 |
| `agent-memory/<name>/` | 项目 + 全局 | ✓ | ✅ 已补充 | 代理记忆目录 |

### 项目特有的扩展（非官方）

| 目录/文件 | 说明 |
|-----------|------|
| `automation/` | 狂暴模式配置（项目创新） |
| `hooks/` | 自定义钩子系统（项目创新） |
| `templates/` | 模板文件（项目创新） |
| `.claude/skills/` | Prisma 技能（与 skills/ 并存） |

---

## 二、目录结构对比

### 官方推荐的 .claude 目录结构

```
.claude/
├── CLAUDE.md                    # 核心指令
├── CLAUDE.local.md              # 个人偏好 (gitignored)
├── rules/                       # 模块化规则
│   └── *.md
├── settings.json                # 共享设置
├── settings.local.json          # 个人设置 (gitignored)
├── .mcp.json                    # MCP 配置
├── .worktreeinclude             # Worktree 配置
├── skills/                      # 技能
│   └── <name>/SKILL.md
├── commands/                    # 命令
│   └── *.md
├── output-styles/               # 输出风格
│   └── *.md
├── agents/                      # 代理定义
│   └── *.md
└── agent-memory/                # 代理记忆
    └── <name>/MEMORY.md
```

### 本模板当前结构

```
F:/Agr/.claude-template/
├── .claude/                     # ✅ 额外的技能目录
│   └── skills/prisma-database-setup/
├── agents/                      # ✅ 9 个代理定义
├── agent-memory/                # ✅ 已补充
├── automation/                  # ✨ 项目扩展
├── commands/                    # ✅ 已补充
├── hooks/                       # ✨ 项目扩展
├── output-styles/               # ✅ 已补充
├── rules/                       # ✅ 6 个规则文件
├── skills/                      # ✅ 多个技能
├── templates/                   # ✨ 项目扩展
├── .mcp.json                    # ✅
├── .worktreeinclude             # ✅ 已补充
├── CLAUDE.md                    # ✅
├── CLAUDE.local.md              # ✅ 已补充
├── settings.json                # ✅
└── settings.local.json          # ✅ 已补充
```

---

## 三、本次补充的文件

### 1. 本地配置模板

| 文件 | 用途 |
|------|------|
| `CLAUDE.local.md` | 个人项目偏好模板，需添加到 .gitignore |
| `settings.local.json` | 个人设置覆盖模板，需添加到 .gitignore |
| `.worktreeinclude` | Git worktree 文件复制配置 |

### 2. 命令目录 (commands/)

| 文件 | 功能 |
|------|------|
| `commit.md` | `/commit` - 自动创建规范的 Git 提交 |
| `pr.md` | `/pr` - 创建 GitHub Pull Request |
| `review.md` | `/review` - 代码审查 |

### 3. 输出风格目录 (output-styles/)

| 文件 | 风格 |
|------|------|
| `terse.md` | 简洁输出 - 极简回复，直接给出答案 |
| `detailed.md` | 详细输出 - 完整解释，包含上下文 |
| `enterprise.md` | 企业级输出 - 包含文档和变更追踪 |

### 4. 代理记忆目录 (agent-memory/)

| 目录 | 说明 |
|------|------|
| `pm/` | PM Agent 记忆模板 |
| `backend-1/` | Backend-1 Agent 记忆模板 |
| `frontend-1/` | Frontend-1 Agent 记忆模板 |

---

## 四、建议优化项

### 1. Skills 目录整合

**问题**: 当前存在两个 skills 目录
- `skills/` - 项目自定义技能
- `.claude/skills/` - Prisma 技能

**建议**: 统一使用 `skills/` 目录，将 Prisma 技能移动过去

### 2. .gitignore 更新

确保 `.gitignore` 包含以下内容：
```
# Claude Code 本地配置
CLAUDE.local.md
.claude/settings.local.json

# Agent 记忆（可选）
# .claude/agent-memory/
```

### 3. hooks 配置格式验证

当前 `hooks/hooks.json` 使用的是自定义格式，官方文档中的 hooks 在 `settings.json` 中配置：
```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...]
  }
}
```

**状态**: 已在 `settings.json` 中正确配置

---

## 五、验证命令

使用以下命令验证配置是否正确加载：

| 命令 | 功能 |
|------|------|
| `/context` | 查看上下文使用情况 |
| `/memory` | 查看加载的 CLAUDE.md 和 rules 文件 |
| `/agents` | 查看配置的代理 |
| `/hooks` | 查看活动的钩子配置 |
| `/skills` | 查看可用技能 |
| `/doctor` | 诊断配置问题 |

---

## 六、文件完整性检查

### 必需文件 ✅

- [x] `CLAUDE.md`
- [x] `settings.json`
- [x] `.mcp.json`

### 官方支持文件 ✅

- [x] `CLAUDE.local.md` (模板)
- [x] `settings.local.json` (模板)
- [x] `.worktreeinclude`
- [x] `rules/*.md` (6 个)
- [x] `skills/*/SKILL.md` (多个)
- [x] `commands/*.md` (3 个)
- [x] `output-styles/*.md` (3 个)
- [x] `agents/*.md` (9 个)
- [x] `agent-memory/*/MEMORY.md` (3 个)

### 项目扩展 ✨

- [x] `automation/` (狂暴模式配置)
- [x] `hooks/` (钩子系统)
- [x] `templates/` (模板文件)

---

*报告生成时间: 2026-04-05*
