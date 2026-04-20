# Claude Enterprise Starter 使用手册

> 版本: 2.6.0 | 最后更新: 2026-04-11

本手册帮助团队成员快速上手 Claude Enterprise Starter 模板项目。

---

## 一、项目概述

### 这是什么

Claude Enterprise Starter 是一个**企业级 Claude Code 配置模板**，将 AI 辅助开发从"个人对话"升级为"团队协作工程"。

### 解决什么问题

| 痛点 | 解决方案 |
|------|----------|
| AI 开发缺乏规范，代码质量不稳定 | 强制 TDD + 代码审查 + 质量门禁 |
| 需求理解偏差导致返工 | PM/PO/Architect 分角色协作，冻结层文档 |
| 前后端风格不统一 | 固化技术栈 + UI 风格选择机制 |
| 大型项目难以管理 | 5 阶段开发流程 + Agent 并行开发 |
| 重复造轮子 | 36 个内置技能覆盖常见开发场景 |

### 核心理念

```
AI Agent Team（15 角色并行）
  + TDD（测试驱动开发）
  + Quality Gates（质量门禁）
  + Document System（冻结/演化/ADR 三层文档）
  = Production-grade Enterprise System
```

---

## 二、安装与配置

### 2.1 前置条件

| 工具 | 版本要求 | 用途 |
|------|----------|------|
| **Claude Code CLI** | 最新版 | AI 开发工具 |
| **Node.js** | 18+ | 运行钩子脚本 |
| **Git** | 2.30+ | 版本管理 |
| **pnpm** | 9+ | 前端包管理 |

安装 Claude Code：
```bash
npm install -g @anthropic-ai/claude-code
```

### 2.2 复制模板到项目

**方式一：使用安装脚本（推荐）**

```bash
# Unix
bash scripts/init.sh /path/to/your-project

# Windows PowerShell
.\scripts\init.ps1 C:\Projects\your-project
```

**方式二：手动复制**
```bash
# 进入你的项目目录
cd /path/to/your-project

# 复制核心文件
cp -r claude-enterprise-starter/.claude .
cp claude-enterprise-starter/.mcp.json .
cp claude-enterprise-starter/CLAUDE.local.md.example CLAUDE.local.md
```

### 2.3 环境变量配置

在 `CLAUDE.local.md` 或系统环境变量中配置：

| 变量 | 必需 | 用途 |
|------|------|------|
| `GITHUB_TOKEN` | 是 | GitHub 集成（自动推送、创建 PR） |
| `FIGMA_ACCESS_TOKEN` | UI Designer | Figma 设计稿导入 |
| `ANTHROPIC_API_KEY` | 是 | Claude API 密钥（Claude Code 自带则不需要） |

### 2.4 MCP 服务配置

`.mcp.json` 配置了 5 个 MCP 服务器：

| 服务 | 用途 | 使用角色 |
|------|------|----------|
| **github** | 创建仓库、推送代码、管理 PR/Issue | DevOps, PM |
| **figma** | 导入 Figma 设计稿 | UI Designer |
| **playwright** | E2E 自动化测试 | QA, 产品体验师 |
| **context7** | 查询最新框架文档 | 所有开发角色 |
| **web-reader** | 读取网页内容 | 竞品分析、文档获取 |

### 2.5 验证安装

```bash
# 在项目目录启动 Claude Code
claude

# 运行诊断
/doctor
```

### 2.6 .gitignore 配置

确保以下文件被忽略：
```gitignore
CLAUDE.local.md
.claude/settings.local.json
.claude/logs/
```

---

## 三、项目结构详解

### 3.1 核心配置

| 文件 | 用途 |
|------|------|
| `CLAUDE.md` | 核心指令文件，定义 12 个章节的项目规则 |
| `settings.json` | 权限控制、钩子配置、狂暴模式开关 |
| `settings.local.json` | 本地覆盖配置（不提交到 Git） |
| `.mcp.json` | MCP 服务器配置 |

### 3.2 规则系统 (`rules/`)

10 个模块化规则文件，按需加载：

| 文件 | 内容 | 关键规则 |
|------|------|----------|
| `00_global.md` | 全局规则 | 中文交互、项目启动约束 |
| `01_development.md` | 开发约束 | 禁止硬编码/mock/MVP、技术栈固化 |
| `02_database.md` | 数据库规范 | SQL 设计范式 |
| `03_quality.md` | 质量门禁 | 测试覆盖率 >80%、4 项检查 |
| `04_agent_team.md` | Agent Team | 角色-技能映射（引用 SSOT） |
| `05_security.md` | 安全规范 | 敏感数据处理 |
| `06_document_lifecycle.md` | 文档生命周期 | 冻结层/演化层/ADR 层管理 |
| `07_skill_triggers.md` | 技能触发 | 什么场景触发什么技能 + 全局流程图 |
| `08_code_comments.md` | 代码注释 | 中文注释标准 + 模块头 + 函数级 JSDoc/Javadoc/docstring |

### 3.3 技能系统 (`skills/`)

36 个技能（来自 ECC/superpowers/gstack/official/custom），详见[第五章](#五技能系统skills)。

### 3.4 代理系统 (`agents/`)

15 个角色定义文件，每个包含：
- 角色职责描述
- 必调技能列表
- 标准操作流程（SOP）
- 动态触发决策树

### 3.5 自动化系统 (`automation/`)

| 文件 | 用途 |
|------|------|
| `agent-orchestration.json` | **SSOT**：角色-技能映射的唯一权威定义 |
| `rage-mode.json` | 狂暴模式：5 阶段自动推进配置 |
| `phase-gates.json` | 质量门禁：每阶段通过条件 |
| `feature-gates.json` | 功能点级 AC 门禁 |
| `github-integration.json` | GitHub 集成：自动推送、分支保护 |

### 3.6 钩子系统 (`hooks/`)

| 脚本 | 触发时机 | 功能 |
|------|----------|------|
| `safety-guard.js` | Bash/Edit/Write 前 | 安全边界检查 |
| `phase-controller.js` | TaskUpdate 后 | 阶段门禁验证 |
| `gstack-phase-guard.js` | TaskUpdate 后 | GStack Phase 0.5 门禁 |
| `gstack-output-validator.js` | Write 后 | GStack 输出校验 |
| `auto-github-push.js` | 每 30 分钟 | 自动推送代码 |
| `agent-health-monitor.js` | 每 5 分钟 | Agent 健康检查 |
| `auto-start-agents.js` | TeamCreate 后 | 自动启动 Agent |
| `block-no-verify.js` | Bash 前 | 阻止 git push --no-verify / --force |
| `commit-quality.js` | Bash 前 | 提交前 console.log + 密钥泄露检测 |
| `suggest-compact.js` | Edit/Write 前 | 建议压缩上下文（逻辑节点） |
| `config-protection.js` | Edit/Write 前 | 阻止修改 linter/formatter/构建配置 |
| `edit-accumulator.js` | Edit/Write 后 | 累积编辑文件路径，供 Stop 时批量处理 |
| `console-warn.js` | Edit/Write 后 | 检测编辑文件中的 console.log |
| `format-typecheck.js` | Stop 时 | 批量格式化 + 类型检查所有编辑过的文件 |
| `doc-sync-check.js` | Stop 时 | 提醒同步文档（README.md / GUIDE.md） |
| `session-evaluate.js` | Stop 时 | 评估会话可提取模式 |

### 3.7 文档体系 (`docs/`)

详见[第七章](#七文档体系)。

---

## 四、配置文件详解

### 4.1 CLAUDE.md — 核心指令

CLAUDE.md 是 Claude Code 的主要配置文件，包含 17 个章节：

| 章节 | 内容 |
|------|------|
| 零、GStack 产品设计层 | Phase 0.5 产品设计（可选，默认禁用） |
| 一、基础规则 | 语言、启动约束、问题处理、开发约束、数据库变更 |
| 一-B、技术栈约束 | React + TypeScript + Vite 固定 |
| 二、系统设计标准 | 企业级生产系统要求 |
| 三、上下文管理策略 | 上下文阈值策略（50%/70%/90%） |
| 四、文档体系 | 冻结层/演化层/ADR 层 |
| 五、需求分析方法 | Business Capability → Technical Implementation |
| 六、系统设计粒度要求 | 功能树结构：Module → Feature → Capability → API |
| 七、开发质量流程 | 功能完整性、代码评审、编译测试、文档更新、注释合规 |
| 八、Agent Team Skills | 角色-技能映射（15 角色）、启动格式、禁止行为 |
| 九、狂暴模式 | 自动化能力、阶段推进（含 Phase 0.5）、安全边界 |
| 十、模组化规则加载 | 9 个模块化规则文件 |
| 十一、代理定义 | 15 个角色定义文件路径 |
| 十二、技能文件 | 36 个技能文件路径 |
| 十三、验证与信任 | 验证策略、信任校准 |
| 十四、Agent Team 清理机制 | TeamDelete Bug 修复、强制清理流程 |
| 十五、智能模式选择引擎 | 评分因子、决策规则、各阶段自动决策 |
| 十六、双模型协作策略 | GLM-5 + GPT-5.4 Codex、4 层触发架构 |
### 4.2 settings.json — 权限与钩子

**权限控制**：
```json
{
  "permissions": {
    "allow": ["Read(**)", "Edit(**)", "Write(**)", "Bash(git:*)", ...],
    "deny": ["Bash(rm -rf /*)", "Bash(sudo:*)", "Read(~/.ssh/**)", ...],
    "defaultMode": "bypassPermissions"
  }
}
```

**钩子配置**（在 `hooks/hooks.json` 中定义）：
```json
{
  "hooks": {
    "PreToolUse": [...],   // 工具调用前
    "PostToolUse": [...],  // 工具调用后
    "Scheduled": [...]     // 定时任务
  }
}
```

### 4.3 automation/agent-orchestration.json — SSOT

这是**角色-技能映射的唯一权威定义源**（Single Source of Truth），其他文件均引用此处：

```json
{
  "agents": {
    "Frontend": {
      "subagentType": "everything-claude-code:typescript-reviewer",
      "requiredSkills": ["tdd", "antfu", "ui-ux-pro-max", "code-review"],
      "parallelizable": true,
      "dependencies": ["PM", "Architect"],
      "count": 3
    }
  }
}
```

| 字段 | 含义 |
|------|------|
| `subagentType` | Agent 类型（决定可用工具） |
| `requiredSkills` | 该角色必须的技能列表 |
| `parallelizable` | 是否可并行启动多个 |
| `dependencies` | 前置依赖角色 |
| `count` | 并行实例数量 |

---

## 五、技能系统（Skills）

### 5.1 技能总览

| 技能 | 类型 | effort | 自动激活 | 核心用途 |
|------|------|--------|----------|----------|
| **tdd** | 流程控制 | - | 否 | Red-Green-Refactor TDD 流程 |
| **code-review** | 流程控制 | high | 否 | 多维度代码审查 |
| **writing-plans** | 流程控制 | high | 否 | 架构设计与实施计划 |
| **product-requirements** | 流程控制 | high | 否 | 需求拆解与分析 |
| **user-onboarding** | 流程控制 | high | 否 | FTUE 用户引导设计 |
| **ui-style-selector** | 创意生成 | high | 否 | 60 模板场景匹配 |
| **ui-ux-pro-max** | 背景知识 | - | paths: *.tsx | 50+ 设计风格、161 配色方案 |
| **react-best-practices** | 背景知识 | - | paths: *.tsx | React 架构模式 |
| **antfu** | 背景知识 | - | paths: *.ts | ESLint/TS/pnpm/Vitest 规范 |
| **vitest** | 背景知识 | - | paths: *.test.ts | Vitest 测试模式 🆕 |
| **pnpm** | 背景知识 | - | paths: pnpm-workspace.yaml | pnpm 工作区 & monorepo 🆕 |
| **prisma-database-setup** | 背景知识 | - | paths: *.prisma | 数据库配置指导 |
| **design-context** | 辅助工具 | low | 否 | 按角色加载设计文档 |
| **springboot-patterns** | 流程控制 | high | 否 | SpringBoot 架构模式 |
| **springboot-tdd** | 流程控制 | high | 否 | SpringBoot TDD |
| **springboot-security** | 流程控制 | high | 否 | SpringBoot 安全配置 |
| **jpa-patterns** | 背景知识 | - | 否 | JPA 数据访问模式 |
| **java-coding-standards** | 背景知识 | - | 否 | Java 编码规范 |
| **llm-integration** | 背景知识 | - | 否 | LLM API 集成模式 |
| **vlm-integration** | 背景知识 | - | 否 | VLM 视觉语言模型集成 |
| **verification-loop** | 流程控制 | high | 否 | 6 阶段验证循环 |
| **search-first** | 流程控制 | medium | 否 | 编码前先研究 |
| **security-review** | 流程控制 | high | 否 | 10 域安全审查 |
| **strategic-compact** | 辅助工具 | low | 否 | 战略性上下文压缩 |
| **gan-harness** | 流程控制 | high | 否 | GAN 生成对抗网络式开发 |
| **continuous-learning** | 辅助工具 | low | 否 | 持续学习本能系统 |
| **office-hours** | GStack | high | 否 | YC 6 问产品构思 |
| **design-consultation** | GStack | high | 否 | 竞品研究+设计系统 |
| **design-shotgun** | GStack | high | 否 | 4-6 UI 变体对比探索 |
| **design-html** | GStack | high | 否 | 模型转生产 HTML/CSS |
| **autoplan** | GStack | high | 否 | 自动全流程审查 |
| **plan-ceo-review** | GStack | high | 否 | CEO 范围挑战 |
| **plan-design-review** | GStack | high | 否 | 设计评分审查 |
| **plan-eng-review** | GStack | high | 否 | 工程架构审查 |
| **plan-devex-review** | GStack | high | 否 | 开发者体验审查 |
| **gstack-bridge** | GStack | high | 否 | Phase 0.5→1 交接（非用户调用） |

### 5.2 Frontmatter 配置说明

每个技能通过 YAML frontmatter 控制行为：

```yaml
---
name: skill-name           # 技能名称
description: |             # 触发描述（含中英文关键词）
  TRIGGER when: ...
effort: high               # 思考深度：low/medium/high/max
paths: "**/*.tsx"          # 文件匹配模式（自动激活）
user-invocable: false      # 是否显示在 / 菜单中
allowed-tools: Read Grep   # 限制可用工具
disable-model-invocation: true  # 禁止模型调用
---
```

**各字段作用**：

| 字段 | 效果 |
|------|------|
| `effort: high` | Claude 投入更多思考，适合架构设计、代码审查 |
| `effort: low` | 快速响应，适合辅助工具 |
| `paths: "**/*.tsx"` | 编辑匹配文件时自动考虑加载该技能 |
| `user-invocable: false` | 不出现在 `/` 菜单中，只能通过代码调用 |
| `allowed-tools: Read Grep Glob` | 限制技能只能使用只读工具 |
| `disable-model-invocation: true` | 禁止技能内部调用模型 |

### 5.3 技能调用方式

```bash
# 用户直接调用（出现在 / 菜单中的技能）
/tdd
/code-review
/ui-style-selector

# 代码/Agent 中调用
Skill tdd
Skill ui-ux-pro-max --stack react
Skill design-context --role frontend

# 带参数调用
Skill product-requirements --effort high
```

### 5.4 技能触发规则

**自动激活**（通过 paths 配置）：
- 编辑 `.tsx/.jsx` → `react-best-practices` + `antfu` + `ui-ux-pro-max` 自动考虑加载
- 编辑 `.prisma` → `prisma-database-setup` 自动考虑加载

**显式调用**（按场景）：

| 场景 | 触发技能 |
|------|----------|
| 开始新功能开发 | `tdd` |
| 完成代码编写 | `code-review` |
| 需求分析 | `product-requirements` |
| 架构设计 | `writing-plans` |
| UI 风格选择 | `ui-style-selector` |
| 遇到 Bug | `systematic-debugging` |
| 卡住 >15 分钟 | `brainstorming` |

**内置技能**（Claude Code 自带，无需安装）：

| 命令 | 用途 | 触发场景 |
|------|------|----------|
| `/batch` | 并行重构 | 涉及 5+ 文件的大规模重构 |
| `/simplify` | 代码质量审查 | 完成代码审查后的进一步优化 |

---

## 六、Agent Team 系统

### 6.1 十五个角色

| 角色 | 职责 | Agent 类型 | 可并行 | 模式 | 评分 |
|------|------|------------|--------|------|------|
| **PM** | 需求拆解、任务分配、Sprint 规划 | planner | 否 | Team | 6-7 |
| **PO** | 需求分析、用户故事、用户引导 | general-purpose | 是 | Team | 6-7 |
| **Architect** | 系统设计、技术选型、架构规划 | architect | 是 | Team | 6-7 |
| **UI Designer** | 界面设计、交互规范、风格选择 | general-purpose | 是 | Subagent | 0-2 |
| **Frontend** | 前端开发（React + TS + Vite） | typescript-reviewer | 是 x3 | Subagent | 0-2 |
| **Backend-Java** | Java 后端开发（SpringBoot + JPA） | java-reviewer | 是 x2 | Subagent | 0-2 |
| **Backend-Python** | Python 后端开发（Prisma + LLM） | python-reviewer | 是 x1 | Subagent | 0-2 |
| **QA** | 测试验证、Bug 追踪 | tdd-guide | 否 | Subagent | 1 |
| **DevOps** | 部署、CI/CD、GitHub 管理 | general-purpose | 否 | Subagent | 1 |
| **产品体验师** | 用户视角测试、体验评估 | planner | 否 | Subagent | 0 |
| **GAN Planner** | 产品规格设计、功能拆解 | general-purpose | 否 | Subagent | 1 |
| **GAN Generator** | 代码实现、开发服务器维护 | general-purpose | 是 | Subagent | 1 |
| **GAN Evaluator** | 质量评估、评分反馈 | general-purpose | 否 | Subagent | 1 |
| **Product Designer** | GStack 产品构思与 UI 探索 | general-purpose | 是 | Subagent | 1 |
| **Design Reviewer** | GStack 计划审查与交接 | general-purpose | 否 | Subagent | 1 |

> **模式说明**：
> - **Team**: 通过 `TeamCreate` 创建协作团队，Agent 之间可互相通信、共享任务列表
> - **Subagent**: 通过 `Agent` 启动为子代理，适合独立执行明确任务
> - **评分**: Agent 类型的复杂度评分，越高表示需要更强的协调能力

### 6.2 Agent 类型说明

| Agent 类型 | 适用场景 | 可用工具 |
|------------|----------|----------|
| `planner` | 规划类角色（PM、产品体验师） | 只读 + 规划工具 |
| `architect` | 架构设计 | 读写 + 系统设计工具 |
| `typescript-reviewer` | 前端开发 | 全部工具，专注 TS/React |
| `python-reviewer` | 后端开发 | 全部工具，专注 Python |
| `java-reviewer` | Java 后端开发 | 全部工具，专注 Java/SpringBoot |
| `tdd-guide` | 测试 | 全部工具，专注测试 |
| `general-purpose` | 通用 | 全部工具 |

### 6.3 启动 Agent 的标准格式

```bash
# Java 后端开发
Agent --name "Backend-Java-1" \
  --subagent-type "everything-claude-code:java-reviewer" \
  --prompt "你是 Java 后端开发。必须遵循以下流程：
    1. 调用 Skill springboot-patterns 获取 SpringBoot 架构模式
    2. 调用 Skill springboot-tdd 启动 TDD 流程
    3. 编写测试用例（Red 阶段）
    4. 实现代码（Green 阶段）
    5. 重构优化（Refactor 阶段）
    6. 调用 Skill code-review 审查代码
    任务：实现用户注册 REST API"

# Python 后端开发
Agent --name "Backend-Python-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "你是 Python 后端开发。必须遵循以下流程：
    1. 调用 Skill design-context --role backend 获取设计约束
    2. 调用 Skill tdd 启动 TDD 流程
    3. 调用 Skill prisma-database-setup 获取数据库配置
    4. 编写测试用例（Red 阶段）
    5. 实现代码（Green 阶段）
    6. 重构优化（Refactor 阶段）
    7. 调用 Skill code-review 审查代码
    任务：实现用户注册 API"

# 前端开发
Agent --name "Frontend-1" \
  --subagent-type "everything-claude-code:typescript-reviewer" \
  --prompt "你是前端开发。必须遵循以下流程：
    1. 调用 Skill design-context --role frontend 获取设计约束
    2. 调用 Skill ui-ux-pro-max --stack react 获取 UI 最佳实践
    3. 调用 Skill tdd 启动 TDD 流程
    4. 编写测试用例（Red 阶段）
    5. 实现组件代码（Green 阶段）
    6. 重构优化（Refactor 阶段）
    7. 调用 Skill code-review 审查代码
    任务：实现用户注册表单组件"
```

### 6.4 各角色 SOP 概要

每个角色的标准操作流程包含三个阶段：

**启动阶段** → 调用 `design-context --role {角色}` 获取项目约束

**核心任务阶段** → 调用角色专属核心技能

**完成阶段** → 代码审查 + 质量检查

详细 SOP 见各 `agents/*.md` 文件。

### 6.5 并行开发模式

大型项目支持多 Agent 并行开发：

```
Frontend-1 ─┐
Frontend-2 ─┤  ← 3 个前端 Agent 并行处理不同 Feature
Frontend-3 ─┘

Backend-Java-1  ─┐
Backend-Java-2  ─┤  ← 2 个 Java 后端 Agent 并行

Backend-Python-1 ─── ← 1 个 Python 后端 Agent
```

使用 Git worktrees 实现并行开发隔离：
```bash
# 参见 skills/using-git-worktrees
```

### 6.6 智能模式选择引擎

系统根据 **5 个评分因子** 自动决定每个角色使用 Team 还是 Subagent 模式：

| 评分因子 | 说明 | 权重 |
|----------|------|------|
| **任务复杂度** | 是否涉及多步骤、多文件变更 | 高 |
| **协作需求** | 是否需要与其他角色实时通信 | 高 |
| **决策自主性** | 是否需要独立决策能力 | 中 |
| **上下文依赖** | 是否需要共享项目状态 | 高 |
| **并行安全性** | 并行执行是否会引发冲突 | 中 |

**3 个决策阈值**：

| 总分范围 | 推荐模式 | 适用阶段 |
|----------|----------|----------|
| **0-2** | Subagent | Phase 2/3/4/5 — 独立执行明确任务 |
| **3-5** | Subagent + 受控通信 | 需要轻量协调的任务 |
| **6-7** | Team | Phase 1 — 需求分析、架构设计等需要深度协作的场景 |

> **为什么 Phase 1 用 Team**：需求分析阶段 PM/PO/Architect 需要频繁讨论、交换意见、迭代文档，Team 模式的共享任务列表和消息机制是必不可少的。
>
> **为什么 Phase 2+ 用 Subagent**：开发阶段每个角色有明确的任务边界，Subagent 模式更轻量、启动更快、资源消耗更少。

### 6.7 双模型协作策略

项目支持 **GLM-5 + Codex GPT-5.4** 双模型协作：

| 模型 | 定位 | 优势场景 |
|------|------|----------|
| **GLM-5**（主模型） | 代码开发、架构设计、复杂推理 | 所有 Agent 任务的默认模型 |
| **Codex GPT-5.4**（辅助模型） | 代码审查、对抗审查、Bug 修复 | 功能完成后、部署前 |

**协作流程**：
```
GLM-5（开发实现）→ GPT-5.4（代码审查）→ GLM-5（修复）→ GPT-5.4（批准）→ 合并
```

**4 层触发架构**：

| 层 | 触发点 | 方法 | 时机 | 可跳过？ |
|----|--------|------|------|----------|
| **L1 自动** | Phase 2→3 门禁 | `orchestrate.sh` 调用 `codex review --wait` | Feature 全部完成后 | 否（硬编码） |
| **L1 自动** | Phase 4→5 门禁 | `orchestrate.sh` 调用 `codex adversarial-review --wait` | 部署前 | 否（硬编码） |
| **L2 提醒** | Agent prompt | `generatePrompt()` 注入 Codex 提醒 | Agent 任务完成时 | 是（主 Claude 决定） |
| **L3 兜底** | 会话结束 | Stop Review Gate（插件钩子） | 检测到代码变更时 | 否（启用后） |
| **L4 手动** | 用户/主 Claude | `/codex:review` / `/codex:rescue` | 随时 | 是 |

**Codex 集成角色**（`agent-orchestration.json` 中含 `codexIntegration`）：

| 角色 | reviewCommand | rescueCommand | triggerAfterFeature | triggerAfterPhase |
|------|---------------|---------------|---------------------|-------------------|
| Frontend | `/codex:review` | `/codex:rescue` | 是 | 是 |
| Backend-Java | `/codex:review` | `/codex:rescue` | 是 | 是 |
| Backend-Python | `/codex:review` | `/codex:rescue` | 是 | 是 |
| QA | `/codex:review` | - | 是 | - |
| DevOps | `/codex:adversarial-review` | - | - | 是 |

**不触发 Codex 的场景**：

| 场景 | 原因 |
|------|------|
| Phase 0/1（初始化/需求） | 无代码变更 |
| Phase 2 开发进行中 | Feature 未完成，审查无意义 |
| GAN 循环 | 内置 Evaluator 已有评估 |
| `--dry-run` 模式 | orchestrate.sh 不执行实际操作 |
| Codex 未安装 | 仅 warn 不阻塞（优雅降级） |

**启用 L3 Stop Review Gate**（首次使用必须执行）：
```bash
/codex:setup --enable-review-gate
```

启用后，每次会话结束自动运行 Codex 审查。Stop Gate 内置智能判断：
- **有代码变更** → 自动触发 Codex 审查（GPT-5.4）
- **纯文档/报告** → 自动跳过
- **Codex 未安装** → 静默跳过

配置方式（环境变量）：
```bash
# Subagent 模型选择
export SUBAGENT_MODEL=sonnet    # 推荐：平衡速度与质量
```

### 6.8 Team 清理机制

当 `TeamDelete` 遇到残留文件导致失败时，使用 `team-manager.sh` 强制清理：

```bash
# 查看 Team 状态
bash scripts/team-manager.sh status

# 清理已关闭 Agent 的残留文件
bash scripts/team-manager.sh clean

# 完全清除（nuke）- 删除所有 Team 数据
bash scripts/team-manager.sh nuke
```

**解决的问题**：
- Agent 已关闭但 Team 文件未清理
- `TeamDelete` 报错 "team still has active members"
- 残留的 `~/.claude/teams/` 和 `~/.claude/tasks/` 目录

### 6.9 环境变量优化

推荐的环境变量配置，优化 Claude Code 运行效率：

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `AUTOCOMPACT_PCT` | `80` | 上下文使用率达 80% 时自动压缩 |
| `MAX_THINKING_TOKENS` | `16000` | 限制思考 token 数量，控制成本 |
| `SUBAGENT_MODEL` | `sonnet` | Subagent 使用 sonnet 模型，平衡速度与质量 |

配置方式：
```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export AUTOCOMPACT_PCT=80
export MAX_THINKING_TOKENS=16000
export SUBAGENT_MODEL=sonnet
```

> **为什么 AUTOCOMPACT_PCT=80**：默认在 70% 时建议压缩，但频繁压缩会中断工作流。设为 80% 在保持精度的同时减少不必要的压缩次数。

### 6.10 Git Worktree 支持

Git Worktree 允许在同一仓库中同时检出多个分支到不同目录，实现物理隔离。

#### 使用场景

| 场景 | 适用 Worktree | 适用 Agent Teams |
|------|---------------|------------------|
| 长时重构 | ✅ 需要独立目录、保留不同 Git 状态 | ❌ |
| 多分支并行 | ✅ 同时处理多个功能分支 | ❌ |
| 紧急 bugfix | ✅ 保留当前工作上下文 | ❌ |
| 临时协作 | ❌ | ✅ 统一上下文、多人协作 |

#### 命令速查

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

#### 与 .worktreeinclude 配合

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

# Agent Teams 配置
teams/
```

创建 worktree 时自动复制这些文件，无需手动处理。

#### 最佳实践

**命名规范**：
- 功能分支: `feature/<name>`
- 修复分支: `fix/<name>`
- 热修复: `hotfix/<name>`
- 重构: `refactor/<name>`
- 实验性: `experiment/<name>`

**合并流程**：
1. 在 worktree 中完成开发和测试
2. 提交所有改动
3. 运行 `bash scripts/worktree-manager.sh merge <branch>`
4. 确认合并成功后删除 worktree

**注意事项**：
- 每个 worktree 都有独立的 `.git` 文件（指向主仓库）
- 不要直接删除 worktree 目录，使用 `worktree-manager.sh remove`
- worktree 内的 git 操作影响同一主仓库的所有 worktree
- 避免在不同 worktree 中操作同一分支

详细规则见 `rules/14_worktree.md`。

### 6.11 编排脚本

项目提供两个核心编排脚本，简化 Agent 管理和 GAN 流程：

**`orchestrate.sh` — 阶段编排**：
```bash
# 启动指定阶段
bash scripts/orchestrate.sh --phase 1    # Phase 1: 需求分析
bash scripts/orchestrate.sh --phase 2    # Phase 2: 开发实现
bash scripts/orchestrate.sh --phase 3    # Phase 3: 测试验证
bash scripts/orchestrate.sh --phase 4    # Phase 4: 产品体验
bash scripts/orchestrate.sh --phase 5    # Phase 5: 部署发布

# GStack Phase 0.5（需先启用）
bash scripts/orchestrate.sh --phase 0.5a  # Think 阶段
bash scripts/orchestrate.sh --phase 0.5b  # Plan 阶段

# 查看当前阶段状态
bash scripts/orchestrate.sh --status
```

**`gan-harness.sh` — GAN 循环**：
```bash
# 启动 GAN 生成对抗开发循环
bash scripts/gan-harness.sh "实现用户注册功能"

# 指定迭代次数
bash scripts/gan-harness.sh "优化首页性能" --iterations 3
```

GAN 循环流程：
```
Planner（规格设计）→ Generator（代码实现）→ Evaluator（质量评估）
    ↑                                            |
    └──────────── 反馈迭代 ←──────────────────────┘
```

---

## 七、开发工作流

### 7.1 全局阶段流程图

```
Phase 0: 项目初始化
|  创建目录结构、配置环境、创建 GitHub 仓库
|  门禁: 目录结构已创建 + 环境已配置 + 仓库已创建
|
Phase 0.5: 产品设计 [GStack，可选]
|  0.5a Think: office-hours → design-consultation → design-shotgun → design-html
|  0.5b Plan: autoplan → 品味决策审批
|  Bridge: gstack-bridge 转换输出为 PRD 格式
|  门禁: DESIGN.md + IMPLEMENTATION_PLAN.md + 各维度评分 ≥ 7.0
|
Phase 1: 需求分析（PM / PO / Architect / UI Designer 并行）
|  PM -> /product-requirements -> /autoplan
|  PO -> /product-requirements -> /user-onboarding
|  Architect -> /writing-plans -> /ui-style-selector（确认 UI 风格）
|  门禁: PRD + 用户故事 + 验收标准 + 架构设计 + DB + API + UI 设计 + 冻结层锁定
|
Phase 2: 开发实现（Frontend x3 / Backend-Java x2 / Backend-Python x1 并行）
|  Frontend -> /design-context -> /ui-ux-pro-max -> /tdd -> 开发 -> /code-review
|  Backend-Java -> /springboot-patterns -> /springboot-tdd -> /jpa-patterns -> 开发 -> /code-review
|  Backend-Python -> /design-context -> /prisma-database-setup -> /tdd -> 开发 -> /code-review
|  自动激活: 编辑 .tsx -> react-best-practices + antfu; 编辑 .prisma -> prisma-database-setup
|  内置: 大型重构(5+文件) -> /batch
|  门禁: 代码实现完成 + 单元测试通过 + 代码审查通过
|
Phase 3: 测试验证（QA）
|  QA -> /tdd -> 测试执行 -> /code-review
|  门禁: 覆盖率 >80% + 所有测试通过 + 无 P0/P1 Bug
|
Phase 4: 产品体验（产品体验师）
|  产品体验师 -> /user-onboarding -> /ui-ux-pro-max
|  门禁: 体验测试完成 + 体验报告输出
|
Phase 5: 部署发布（DevOps）
|  DevOps -> /code-review -> /simplify（合并前最终检查）
|  门禁: 部署成功 + 健康检查通过 + 代码已推送
|
完成: GitHub 推送 -> 完成报告
```

### 7.2 阶段门禁（Quality Gates）

每个阶段的通过条件定义在 `automation/phase-gates.json` 中：

| 阶段转换 | 关键条件 |
|----------|----------|
| Phase 0 → 0.5 | GStack 已启用（可选） |
| Phase 0.5 → 1 | DESIGN.md + IMPLEMENTATION_PLAN.md + 评分 ≥ 7.0 |
| Phase 0 → 1 | 目录结构、环境、GitHub 仓库（GStack 禁用时） |
| Phase 1 → 2 | 7 份设计文档完成 + 冻结层锁定 + 任务已分配 |
| Phase 2 → 3 | 代码完成 + 覆盖率 >80% + 代码审查通过 |
| Phase 3 → 4 | 所有测试通过 + 测试报告输出 |
| Phase 4 → 5 | 体验测试完成 + 关键问题已修复 |
| Phase 5 → 完成 | 部署成功 + 文档已更新 |

### 7.3 文档生命周期

```
+-------------------------------------------------+
| 冻结层 (docs/requirements/, docs/design/)        |
| Phase 1 产出，Phase 2 开始前冻结                  |
| 修改必须通过 ADR 流程                              |
+-------------------------------------------------+
| 演化层 (docs/dev/, docs/test/, docs/fixes/)      |
| 持续更新，Agent 可自行修改                          |
+-------------------------------------------------+
| ADR 层 (docs/superpowers/decisions/)             |
| 架构决策记录，每次重大变更必须创建                    |
+-------------------------------------------------+
```

### 7.4 TDD 工作流

```
1. Red Phase -- 写失败测试
   - 理解需求
   - 编写测试用例表达预期行为
   - 运行确认失败

2. Green Phase -- 最小实现
   - 编写刚好通过测试的代码
   - 不过度设计
   - 运行确认通过

3. Refactor Phase -- 清理优化
   - 去重、改善命名、优化结构
   - 每次重构后运行测试确认通过
```

**覆盖率要求**：
| 指标 | 要求 |
|------|------|
| 整体覆盖率 | > 80% |
| 核心业务逻辑 | 100% |
| 关键路径 | 100% |
| 新增代码 | > 90% |

---

## 七-A、GStack 产品设计层（Phase 0.5，可选）

> 当 GStack 启用时，Phase 0.5 在 Phase 0 和 Phase 1 之间执行。
> 当 GStack 禁用时（默认），Phase 0 直接进入 Phase 1，行为不变。

### 启用 GStack

```bash
# 一键启用
node scripts/gstack-toggle.js --enable

# 查看状态
node scripts/gstack-toggle.js --status

# 禁用（恢复默认）
node scripts/gstack-toggle.js --disable
```

### Phase 0.5 架构

```
Phase 0:   Init                        (不变)
    |
Phase 0.5: Product Design [GStack]     (新增 - 可选)
    |        |- 0.5a Think: 产品构思
    |        |- 0.5b Plan:  规划审查
    |        |- Bridge:   交接转换
    |
Phase 1-5: Requirements -> Development -> Testing -> Experience -> Deployment (不变)
```

### Phase 0.5a: Think（构思阶段）

**角色**: Product Designer
**SOP**: office-hours → design-consultation → design-shotgun → design-html

| 步骤 | 技能 | 功能 | 输出 |
|------|------|------|------|
| 1 | `/office-hours` | YC 6 问挑战假设 | OFFICE_HOURS.md |
| 2 | `/design-consultation` | 竞品研究+设计系统 | DESIGN.md |
| 3 | `/design-shotgun` | 4-6 UI 变体对比 | .taste-memory.json |
| 4 | `/design-html` | 模型转生产 HTML | workspace/docs/design/prototype/ |

**使用流程**：
```
1. 描述你的产品想法（可以很模糊）
2. /office-hours → AI 挑战你的假设，重新定义产品
3. /design-consultation → 研究竞品，构建设计系统
4. /design-shotgun → 生成 4-6 个 UI 方案，选择喜欢的
5. /design-html → 将选中的方案转为 HTML/CSS
```

### Phase 0.5b: Plan（规划阶段）

**角色**: Design Reviewer
**SOP**: autoplan → 品味决策审批 → gstack-bridge

| 步骤 | 技能 | 功能 | 输出 |
|------|------|------|------|
| 1 | `/autoplan` | 自动 CEO→设计→工程→DX 审查 | 评分报告 |
| 2 | 用户批准 | 品味决策审批（各维度 ≥ 7.0） | — |
| 3 | `gstack-bridge` | 交接：转换 GStack 输出为 PRD 格式 | PRD.md 预填充 |

**也可手动审查**（替代 /autoplan）：
- `/plan-ceo-review` — CEO 范围挑战（4 种模式：扩展/保持/缩减）
- `/plan-design-review` — 设计评分（6 维度 0-10）
- `/plan-eng-review` — 工程架构审查（架构图+数据流+测试矩阵）
- `/plan-devex-review` — 开发者体验审查（TTHW 基准+摩擦点）

### gstack-bridge 交接协议

gstack-bridge 是整个 Phase 0.5 到 Phase 1 的关键衔接点。它将 GStack 的输出转换为现有 PRD 格式：

```
GStack 输出                    →  现有项目文档
-------------------------------------------------
OFFICE_HOURS.md "问题"          →  PRD.md S1 产品背景
OFFICE_HOURS.md "用户"          →  PRD.md S2 目标用户
OFFICE_HOURS.md "现有方案"      →  PRD.md S7 竞品分析
OFFICE_HOURS.md "差异化"        →  PRD.md S1 核心差异化
DESIGN.md 设计令牌              →  04_UI设计规范.md 颜色/字体/间距
DESIGN.md 组件清单              →  04_UI设计规范.md 组件库
IMPLEMENTATION_PLAN CEO 审查    →  PRD.md S3 功能需求
IMPLEMENTATION_PLAN 工程架构    →  01_系统架构设计.md
IMPLEMENTATION_PLAN 数据流      →  02_数据库设计.md
IMPLEMENTATION_PLAN DX 审查     →  PRD.md S4 非功能需求
```

**合并策略**: 非破坏性——如果 PRD.md 已存在，在顶部追加 `## GStack 产品设计输入` 区段，用 `<!-- GSTACK-GENERATED -->` 标注。PM agent 在 Phase 1 中精炼而非重建。

### Phase 0.5 门禁条件

Phase 0.5 → Phase 1 的门禁条件：
- DESIGN.md 已生成
- IMPLEMENTATION_PLAN.md 已生成
- 各维度评分 ≥ 7.0/10
- 用户已批准品味决策

### 典型使用场景

**新项目从零开始**：
```
1. node scripts/gstack-toggle.js --enable
2. /office-hours → 描述想法 → AI 挑战假设
3. /design-consultation → 竞品研究 → 设计系统
4. /design-shotgun → 选择 UI 方案
5. /autoplan → 自动全流程审查
6. gstack-bridge → 交接到 Phase 1
7. Phase 1-5 正常执行（PM 精炼 PRD → 开发 → 测试 → 部署）
```

**已有产品添加新功能**：
```
1. /office-hours → 描述新功能想法
2. /autoplan → 快速审查可行性
3. gstack-bridge → 交接到 Phase 1
4. Phase 2-5 执行开发
```

---

## 八、UI 设计体系

### 8.1 前端技术栈

| 类别 | 选择 | 说明 |
|------|------|------|
| 框架 | **React 19+** | Server Components + Client Components |
| 语言 | **TypeScript** | strict mode |
| 构建工具 | **Vite** | 快速 HMR 和构建 |
| 包管理 | **pnpm** | 高效磁盘使用 |
| 测试 | **Vitest** + React Testing Library | Vite 原生测试 |
| Lint | **ESLint flat config** (antfu 风格) | 统一代码风格 |

> **注意**: 技术栈已固化，禁止使用 Vue/Angular/Svelte/Webpack/npm/yarn/Jest。变更需通过 ADR。

### 8.2 UI 风格选择流程

项目包含 **60 个品牌设计模板**，分为 7 大分类：

| 分类 | 适用场景 |
|------|----------|
| AI | AI 产品、机器学习平台 |
| 开发者工具 | IDE、API 平台、CLI 工具 |
| 基础设施 | 云平台、DevOps 工具 |
| 设计生产力 | 设计工具、协作平台 |
| 金融 | 金融科技、银行系统 |
| 企业消费 | ERP、CRM、企业管理 |
| 汽车 | 车联网、智能驾驶 |

**使用方法**：
```
1. 输入项目场景描述
   例: "一个面向开发者的 API 文档平台"
      ↓
2. /ui-style-selector 自动匹配 2-3 个候选风格
   例: Stripe-style、Linear-style、Vercel-style
      ↓
3. 确认选择后，自动加载对应 DESIGN.md
   例: tips/UI设计风格/design-md/stripe/DESIGN.md
      ↓
4. 设计规范写入 docs/design/04_UI设计规范.md
      ↓
5. Frontend 开发时通过 ui-ux-pro-max 继承风格约束
```

### 8.3 UI Designer 工作流程

```
1. 调用 Skill design-context --role ui-designer
2. 调用 Skill ui-style-selector（确认设计风格）
3. 调用 Skill ui-ux-pro-max --stack react
4. 输出 UI 设计规范到 docs/design/04_UI设计规范.md
```

---

## 九、狂暴模式

### 9.1 启用方式

在 `settings.json` 中已默认启用：
```json
{
  "customInstructions": {
    "rageMode": {
      "enabled": true
    }
  }
}
```

### 9.2 自动化能力

| 能力 | 触发条件 | 配置位置 |
|------|----------|----------|
| **自动 GitHub 推送** | 每 30 分钟 / 阶段完成 | `github-integration.json` |
| **Agent 健康监控** | 每 5 分钟 | `hooks.json` Scheduled |
| **自动重启 Agent** | Agent 失败（最多 3 次） | `rage-mode.json` |
| **阶段自动推进** | 前置阶段门禁通过 | `phase-gates.json` |
| **安全边界守护** | 每次工具调用前 | `safety-guard.js` |

### 9.3 安全边界

以下操作**需要用户确认**：
- 删除/编辑项目目录外的文件
- 执行 sudo 命令
- 访问 `~/.ssh`、`~/.gnupg` 等敏感路径

### 9.4 适用场景

- 适合：标准化的 CRUD 项目、内部工具、原型快速搭建
- 谨慎使用：涉及支付、安全认证等高风险模块
- 不建议：首次使用本模板时直接开启（先熟悉流程）

---

## 十、常见问题（FAQ）

### Q: 如何选择手动模式还是狂暴模式？

手动模式：逐步执行，每步确认。适合学习和复杂项目。
狂暴模式：全自动执行。适合标准化项目和有经验的团队。

### Q: 如何自定义技能？

1. 在 `skills/` 下创建新目录，如 `skills/my-skill/`
2. 创建 `SKILL.md`，编写 YAML frontmatter 和正文
3. 在 `automation/agent-orchestration.json` 中将技能分配给需要的角色

### Q: 如何添加新的 Agent 角色？

1. 在 `agents/` 下创建新的角色定义文件
2. 在 `automation/agent-orchestration.json` 中添加角色配置
3. 在 `CLAUDE.md` 第八节和第十节添加引用

### Q: 技能的 paths 自动激活不生效？

`paths` 配置仅表示"编辑匹配文件时自动考虑加载"，不是强制加载。Claude 会根据上下文判断是否需要加载。

### Q: 如何关闭狂暴模式？

在 `settings.json` 中设置：
```json
{
  "customInstructions": {
    "rageMode": {
      "enabled": false
    }
  }
}
```

### Q: 上下文不够用了怎么办？

| 使用率 | 行动 |
|--------|------|
| 50-70% | 考虑 `/compact` |
| 70-90% | 必须 `/compact` |
| 90%+ | 必须 `/clear` 重置 |

---

## 十一、进阶用法

### 11.1 自定义技能开发

```yaml
# skills/my-custom-skill/SKILL.md
---
name: my-custom-skill
description: |
  Custom skill description.
  TRIGGER when: specific conditions
effort: medium
paths: "**/*.py"
user-invocable: true
---

# Skill Title

Skill content and instructions here...
```

### 11.2 自定义代理角色

```markdown
<!-- agents/my-role.md -->
# My Custom Role

## 角色标准操作流程 (SOP)

### 1. 启动阶段
必调: Skill design-context --role my-role

### 2. 核心任务阶段
必调: [core skills]

### 3. 完成阶段
必调: code-review
```

### 11.3 MCP 服务器扩展

在 `.mcp.json` 中添加新的 MCP 服务：
```json
{
  "mcpServers": {
    "my-server": {
      "command": "mcp-adapter",
      "args": ["--server", "my-server"],
      "description": "My custom MCP server"
    }
  }
}
```

### 11.4 Hook 脚本自定义

在 `hooks/hooks.json` 中添加自定义钩子：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "node .claude/hooks/scripts/my-custom-hook.js"
        }]
      }
    ]
  }
}
```

---

## 附录

### A. 命令速查表

| 命令 | 用途 |
|------|------|
| `/doctor` | 诊断配置 |
| `/context` | 查看上下文使用 |
| `/memory` | 查看加载的文件 |
| `/skills` | 列出可用技能 |
| `/agents` | 查看配置的代理 |
| `/plan` | 进入计划模式 |
| `/commit` | 创建提交 |
| `/pr` | 创建 PR |
| `/review` | 代码审查 |
| `/compact` | 压缩上下文 |
| `/clear` | 清空对话 |
| `/batch` | 并行重构（内置） |
| `/simplify` | 代码质量审查（内置） |
| `/loop` | 定期监控（内置） |

**CLI 工具命令**：

| 命令 | 用途 |
|------|------|
| `node scripts/validate-config.js` | 验证项目配置完整性 |
| `node scripts/gstack-toggle.js --enable` | 启用 GStack Phase 0.5 |
| `node scripts/gstack-toggle.js --disable` | 禁用 GStack Phase 0.5 |
| `node scripts/gstack-toggle.js --status` | 查看 GStack 状态 |
| `bash scripts/team-manager.sh status` | 查看 Team 状态 |
| `bash scripts/team-manager.sh clean` | 清理已关闭 Agent 的残留文件 |
| `bash scripts/team-manager.sh nuke` | 完全清除所有 Team 数据 |
| `bash scripts/orchestrate.sh --phase 1` | 启动指定阶段（1-5） |
| `bash scripts/orchestrate.sh --phase 0.5a` | 启动 GStack Think 阶段 |
| `bash scripts/orchestrate.sh --phase 0.5b` | 启动 GStack Plan 阶段 |
| `bash scripts/orchestrate.sh --status` | 查看当前阶段状态 |
| `bash scripts/gan-harness.sh "描述"` | 启动 GAN 生成对抗开发循环 |
| `bash scripts/worktree-manager.sh create <branch>` | 创建新 worktree + 分支 |
| `bash scripts/worktree-manager.sh list` | 列出所有 worktree |
| `bash scripts/worktree-manager.sh status` | 显示 worktree 状态概览 |
| `bash scripts/worktree-manager.sh merge <branch>` | 合并 worktree 到 main |
| `bash scripts/worktree-manager.sh remove <branch>` | 删除 worktree + 分支 |

### B. 技能触发速查表

| 你在做什么 | 调用什么 |
|------------|----------|
| 分析需求 | `/product-requirements` |
| 规划 Sprint | `/autoplan` |
| 设计架构 | `/writing-plans` |
| 选择 UI 风格 | `/ui-style-selector` |
| 开始开发 | `/tdd` |
| 前端 UI 开发 | `/ui-ux-pro-max --stack react` |
| 数据库配置 | `/prisma-database-setup` |
| 代码审查 | `/code-review` |
| 设计用户引导 | `/user-onboarding` |
| 了解项目约束 | `Skill design-context --role {角色}` |
| 大规模重构 | `/batch` |
| 代码优化 | `/simplify` |
| 产品构思 | `/office-hours`（GStack） |
| 设计探索 | `/design-shotgun`（GStack） |
| 计划审查 | `/autoplan`（GStack） |

### C. 环境变量清单

| 变量 | 必需 | 获取方式 |
|------|------|----------|
| `GITHUB_TOKEN` | 是 | GitHub Settings → Developer Settings → Personal Access Tokens |
| `FIGMA_ACCESS_TOKEN` | UI Designer | Figma → Settings → Personal access tokens |
| `ANTHROPIC_API_KEY` | 视情况 | console.anthropic.com |
| `AUTOCOMPACT_PCT` | 推荐 | 设为 `80`，上下文达 80% 时自动压缩 |
| `MAX_THINKING_TOKENS` | 推荐 | 设为 `16000`，限制思考 token 数量 |
| `SUBAGENT_MODEL` | 推荐 | 设为 `sonnet`，Subagent 使用的模型 |
| `WORKTREE_BASE_PATH` | 可选 | Worktree 基础路径（默认父目录） |

---

*使用手册版本: 2.6.0 | 项目模板: [GitHub](https://github.com/circleone1980/claude-enterprise-starter)*