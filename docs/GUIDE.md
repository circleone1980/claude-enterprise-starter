# Claude Enterprise Starter 使用手册

> 版本: 2.2.0 | 最后更新: 2026-04-09

本手册帮助团队成员快速上手 Claude Enterprise Starter 模板项目。

---

## 一、项目概述

### 这是什么

Claude Enterprise Starter 是一个**企业级 Claude Code 配置模板**，将 AI 辅助开发从"个人对话"升级为"团队协作工程"。

### 解决什么问题

| 痛点 | 解决方案 |
|------|---------|
| AI 开发缺乏规范，代码质量不稳定 | 强制 TDD + 代码审查 + 质量门禁 |
| 需求理解偏差导致返工 | PM/PO/Architect 分角色协作，冻结层文档 |
| 前后端风格不统一 | 固化技术栈 + UI 风格选择机制 |
| 大型项目难以管理 | 5 阶段开发流程 + Agent 并行开发 |
| 重复造轮子 | 27 个内置技能覆盖常见开发场景 |

### 核心理念

```
AI Agent Team（9 角色并行）
  + TDD（测试驱动开发）
  + Quality Gates（质量门禁）
  + Document System（冻结/演化/ADR 三层文档）
  = Production-grade Enterprise System
```

---

## 二、安装与配置

### 2.1 前置条件

| 工具 | 版本要求 | 用途 |
|------|---------|------|
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
|------|------|---------|
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

8 个模块化规则文件，按需加载：

| 文件 | 内容 | 关键规则 |
|------|------|---------|
| `00_global.md` | 全局规则 | 中文交互、项目启动约束 |
| `01_development.md` | 开发约束 | 禁止硬编码/mock/MVP、技术栈固化 |
| `02_database.md` | 数据库规范 | SQL 设计范式 |
| `03_quality.md` | 质量门禁 | 测试覆盖率 >80%、4 项检查 |
| `04_agent_team.md` | Agent Team | 角色-技能映射（引用 SSOT） |
| `05_security.md` | 安全规范 | 敏感数据处理 |
| `06_document_lifecycle.md` | 文档生命周期 | 冻结层/演化层/ADR 层管理 |
| `07_skill_triggers.md` | 技能触发 | 什么场景触发什么技能 + 全局流程图 |

### 3.3 技能系统 (`skills/`)

27 个自定义技能，详见[第五章](#五技能系统skills)。

### 3.4 代理系统 (`agents/`)

13 个角色定义文件，每个包含：
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
| `github-integration.json` | GitHub 集成：自动推送、分支保护 |

### 3.6 钩子系统 (`hooks/`)

| 脚本 | 触发时机 | 功能 |
|------|---------|------|
| `safety-guard.js` | Bash/Edit/Write 前 | 安全边界检查 |
| `phase-controller.js` | TaskUpdate 后 | 阶段门禁验证 |
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

CLAUDE.md 是 Claude Code 的主要配置文件，包含 12 个章节：

| 章节 | 内容 |
|------|------|
| 一、基础规则 | 语言、启动约束、问题处理、开发约束、数据库变更 |
| 一-B、技术栈约束 | React + TypeScript + Vite 固定 |
| 二、系统设计标准 | 企业级生产系统要求 |
| 三、上下文管理 | 上下文阈值策略（50%/70%/90%） |
| 四、文档体系 | 冻结层/演化层/ADR 层 |
| 五、需求分析 | Business Capability → Technical Implementation |
| 六、质量门禁 | 功能完整性、代码评审、编译测试、文档更新 |
| 七、Agent Team | 角色-技能映射、启动格式、禁止行为 |
| 八、狂暴模式 | 自动化能力、阶段推进、安全边界 |
| 九、规则加载 | 8 个模块化规则文件 |
| 十、代理定义 | 9 个角色定义文件路径 |
| 十一、技能文件 | 27 个技能文件路径 |
| 十二、验证与信任 | 验证策略、信任校准 |

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
|------|------|--------|---------|---------|
| **tdd** | 流程控制 | - | 否 | Red-Green-Refactor TDD 流程 |
| **tdd-workflow** | 操作手册 | low | 否 | TDD 详细操作步骤 |
| **code-review** | 流程控制 | high | 否 | 多维度代码审查 |
| **writing-plans** | 流程控制 | high | 否 | 架构设计与实施计划 |
| **product-requirements** | 流程控制 | high | 否 | 需求拆解与分析 |
| **user-onboarding** | 流程控制 | high | 否 | FTUE 用户引导设计 |
| **sprint-planning** | 流程控制 | medium | 否 | Sprint 规划 |
| **ui-style-selector** | 创意生成 | high | 否 | 60 模板场景匹配 |
| **ui-ux-pro-max** | 背景知识 | - | paths: *.tsx | 50+ 设计风格、161 配色方案 |
| **react-best-practices** | 背景知识 | - | paths: *.tsx | React 架构模式 |
| **antfu** | 背景知识 | - | paths: *.ts | ESLint/TS/pnpm/Vitest 规范 |
| **prisma-database-setup** | 背景知识 | - | paths: *.prisma | 数据库配置指导 |
| **design-context** | 辅助工具 | low | 否 | 按角色加载设计文档 |
| **springboot-patterns** | 流程控制 | high | 否 | SpringBoot 架构模式 |
| **springboot-tdd** | 流程控制 | high | 否 | SpringBoot TDD |
| **springboot-security** | 流程控制 | high | 否 | SpringBoot 安全配置 |
| **jpa-patterns** | 背景知识 | - | 否 | JPA 数据访问模式 |
| **java-coding-standards** | 背景知识 | - | 否 | Java 编码规范 |
| **writing-plans** | 流程控制 | high | 否 | 架构设计与实施计划 |
| **llm-integration** | 背景知识 | - | 否 | LLM API 集成模式 |
| **vlm-integration** | 背景知识 | - | 否 | VLM 视觉语言模型集成 |
| **workflow-engine** | 背景知识 | high | 否 | 工作流编排模式 |
| **verification-loop** | 流程控制 | high | 否 | 6 阶段验证循环 |
| **search-first** | 流程控制 | medium | 否 | 编码前先研究 |
| **security-review** | 流程控制 | high | 否 | 10 域安全审查 |
| **strategic-compact** | 辅助工具 | low | 否 | 战略性上下文压缩 |
| **gan-harness** | 流程控制 | high | 否 | GAN 生成对抗网络式开发 |
| **continuous-learning** | 辅助工具 | low | 否 | 持续学习本能系统 |

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
|------|---------|
| 开始新功能开发 | `tdd` |
| 完成代码编写 | `code-review` |
| 需求分析 | `product-requirements` |
| 架构设计 | `writing-plans` |
| UI 风格选择 | `ui-style-selector` |
| 遇到 Bug | `systematic-debugging` |
| 卡住 >15 分钟 | `brainstorming` |

**内置技能**（Claude Code 自带，无需安装）：

| 命令 | 用途 | 触发场景 |
|------|------|---------|
| `/batch` | 并行重构 | 涉及 5+ 文件的大规模重构 |
| `/simplify` | 代码质量审查 | 完成代码审查后的进一步优化 |

---

## 六、Agent Team 系统

### 6.1 十三个角色

| 角色 | 职责 | Agent 类型 | 可并行 |
|------|------|-----------|--------|
| **PM** | 需求拆解、任务分配、Sprint 规划 | planner | 否 |
| **PO** | 需求分析、用户故事、用户引导 | general-purpose | 是 |
| **Architect** | 系统设计、技术选型、架构规划 | architect | 是 |
| **UI Designer** | 界面设计、交互规范、风格选择 | general-purpose | 是 |
| **Frontend** | 前端开发（React + TS + Vite） | typescript-reviewer | 是 ×3 |
| **Backend-Java** | Java 后端开发（SpringBoot + JPA） | java-reviewer | 是 ×2 |
| **Backend-Python** | Python 后端开发（Prisma + LLM） | python-reviewer | 是 ×1 |
| **QA** | 测试验证、Bug 追踪 | tdd-guide | 否 |
| **DevOps** | 部署、CI/CD、GitHub 管理 | general-purpose | 否 |
| **产品体验师** | 用户视角测试、体验评估 | planner | 否 |
| **GAN Planner** | 产品规格设计、功能拆解 | general-purpose | 否 |
| **GAN Generator** | 代码实现、开发服务器维护 | general-purpose | 是 |
| **GAN Evaluator** | 质量评估、评分反馈 | general-purpose | 否 |

### 6.2 Agent 类型说明

| Agent 类型 | 适用场景 | 可用工具 |
|-----------|---------|---------|
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
    1. 🔴 调用 Skill springboot-patterns 获取 SpringBoot 架构模式
    2. 🔴 调用 Skill springboot-tdd 启动 TDD 流程
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

---

## 七、开发工作流

### 7.1 全局阶段流程图

```
Phase 0: 项目初始化
│  创建目录结构、配置环境、创建 GitHub 仓库
│  门禁: 目录结构已创建 + 环境已配置 + 仓库已创建
↓
Phase 1: 需求分析（PM / PO / Architect / UI Designer 并行）
│  PM → /product-requirements → /sprint-planning
│  PO → /product-requirements → /user-onboarding
│  Architect → /writing-plans → /ui-style-selector（确认 UI 风格）
│  门禁: PRD + 用户故事 + 验收标准 + 架构设计 + DB + API + UI 设计 + 冻结层锁定
↓
Phase 2: 开发实现（Frontend ×3 / Backend-Java ×2 / Backend-Python ×1 并行）
│  Frontend → /design-context → /ui-ux-pro-max → /tdd → 开发 → /code-review
│  Backend-Java → /springboot-patterns → /springboot-tdd → /jpa-patterns → 开发 → /code-review
│  Backend-Python → /design-context → /prisma-database-setup → /tdd → 开发 → /code-review
│  自动激活: 编辑 .tsx → react-best-practices + antfu; 编辑 .prisma → prisma-database-setup
│  内置: 大型重构(5+文件) → /batch
│  门禁: 代码实现完成 + 单元测试通过 + 代码审查通过
↓
Phase 3: 测试验证（QA）
│  QA → /tdd → 测试执行 → /code-review
│  门禁: 覆盖率 >80% + 所有测试通过 + 无 P0/P1 Bug
↓
Phase 4: 产品体验（产品体验师）
│  产品体验师 → /user-onboarding → /ui-ux-pro-max
│  门禁: 体验测试完成 + 体验报告输出
↓
Phase 5: 部署发布（DevOps）
│  DevOps → /code-review → /simplify（合并前最终检查）
│  门禁: 部署成功 + 健康检查通过 + 代码已推送
↓
完成: GitHub 推送 → 完成报告
```

### 7.2 阶段门禁（Quality Gates）

每个阶段的通过条件定义在 `automation/phase-gates.json` 中：

| 阶段转换 | 关键条件 |
|---------|---------|
| Phase 0 → 1 | 目录结构、环境、GitHub 仓库 |
| Phase 1 → 2 | 7 份设计文档完成 + 冻结层锁定 + 任务已分配 |
| Phase 2 → 3 | 代码完成 + 覆盖率 >80% + 代码审查通过 |
| Phase 3 → 4 | 所有测试通过 + 测试报告输出 |
| Phase 4 → 5 | 体验测试完成 + 关键问题已修复 |
| Phase 5 → 完成 | 部署成功 + 文档已更新 |

### 7.3 文档生命周期

```
┌─────────────────────────────────────────────────┐
│ 冻结层 (docs/requirements/, docs/design/)        │
│ Phase 1 产出，Phase 2 开始前冻结                  │
│ 修改必须通过 ADR 流程                              │
├─────────────────────────────────────────────────┤
│ 演化层 (docs/dev/, docs/test/, docs/fixes/)      │
│ 持续更新，Agent 可自行修改                          │
├─────────────────────────────────────────────────┤
│ ADR 层 (docs/superpowers/decisions/)             │
│ 架构决策记录，每次重大变更必须创建                    │
└─────────────────────────────────────────────────┘
```

### 7.4 TDD 工作流

```
1. 🔴 Red Phase — 写失败测试
   - 理解需求
   - 编写测试用例表达预期行为
   - 运行确认失败

2. 🟢 Green Phase — 最小实现
   - 编写刚好通过测试的代码
   - 不过度设计
   - 运行确认通过

3. 🔵 Refactor Phase — 清理优化
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
|------|---------|
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
|------|---------|---------|
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
3. 在 `CLAUDE.md` 第七节和第十节添加引用

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

### B. 技能触发速查表

| 你在做什么 | 调用什么 |
|-----------|---------|
| 分析需求 | `/product-requirements` |
| 规划 Sprint | `/sprint-planning` |
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

### C. 环境变量清单

| 变量 | 必需 | 获取方式 |
|------|------|---------|
| `GITHUB_TOKEN` | 是 | GitHub Settings → Developer Settings → Personal Access Tokens |
| `FIGMA_ACCESS_TOKEN` | UI Designer | Figma → Settings → Personal access tokens |
| `ANTHROPIC_API_KEY` | 视情况 | console.anthropic.com |

---

*使用手册版本: 2.2.0 | 项目模板: [GitHub](https://github.com/circleone1980/claude-enterprise-starter)*
