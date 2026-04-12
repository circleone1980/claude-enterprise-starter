# 快速开始指南

> 从零开始，用本模板开发你的第一个项目

---

## 本项目是什么

`claude-enterprise-starter` 是 Claude Code 的**企业级开发引擎模板**。你 clone 它，然后在 `workspace/` 里开发你的实际项目。

```
claude-enterprise-starter/         ← 你 clone 下来的仓库（开发引擎）
├── agents/ skills/ hooks/         ← 引擎配置（不用动）
├── rules/                         ← 开发规则（不用动）
├── automation/                    ← 自动化配置（不用动）
├── workspace/                     ← 你的项目代码写在这里
│   ├── src/                       ← 你写的代码
│   └── docs/                      ← 你的项目文档
├── CLAUDE.md                      ← Claude 的行为指令
└── scripts/init.sh                ← 初始化脚本
```

**简单理解**: 引擎在外层，你的项目在 `workspace/` 里。

---

## 第一步：Clone 并初始化

```bash
# 1. Clone 仓库
git clone https://github.com/circleone1980/claude-enterprise-starter.git my-project
cd my-project

# 2. 初始化 workspace（选择你的技术栈）
#    node = React + TypeScript + Vite
#    java = Spring Boot
#    python = FastAPI / Django
bash scripts/init.sh --workspace --type node

# 3. [可选] 启用 GStack 产品设计层（Phase 0.5）
node scripts/gstack-toggle.js --enable
```

Windows 用 PowerShell:
```powershell
git clone https://github.com/circleone1980/claude-enterprise-starter.git my-project
cd my-project
.\scripts\init.ps1 -Workspace -ProjectType node
node scripts\gstack-toggle.js --enable  # [可选] 启用 GStack
```

初始化后你会得到:

```
my-project/
├── .claude/                       ← Claude Code 本地配置
│   └── settings.local.json        ← 你的个人设置（gitignored）
├── workspace/                     ← 你的项目（已创建好骨架）
│   ├── src/                       ← 空的，等你写代码
│   ├── docs/                      ← 空的文档模板
│   │   ├── requirements/          ← 需求文档（Phase 1 填写）
│   │   ├── design/                ← 设计文档（Phase 0.5/1 填写）
│   │   ├── test/                  ← 测试文档
│   │   └── ...
│   ├── package.json               ← 项目依赖（node 类型）
│   └── .gitignore
├── CLAUDE.md                      ← Claude 行为指令（引擎核心）
├── agents/                        ← 15 个 AI 角色定义（含 GStack 2 个）
├── skills/                        ← 36 个技能（含 GStack 10 个）
├── rules/                         ← 10 条开发规则（含 GStack 集成规则）
├── hooks/                         ← 自动钩子（安全检查/门禁/格式化...）
│   └── scripts/                   ← 钩子脚本（18 个）
├── automation/                    ← 自动化配置
│   ├── workspace.json             ← 告诉引擎 workspace/ 在哪
│   ├── phase-gates.json           ← 质量门禁条件（含 Phase 0.5）
│   └── ac-tracker.json            ← 验收标准追踪器
├── scripts/                       ← 工具脚本
│   ├── init.sh / init.ps1         ← 初始化脚本
│   ├── gstack-toggle.js           ← [新增] GStack 开关
│   └── validate-config.js         ← 配置验证
├── templates/code-headers/        ← 代码注释模板（TS/Java/Python）
└── docs/GUIDE.md                  ← 完整使用手册
```

---

## 第二步：在项目根目录启动 Claude Code

```bash
# 在 my-project/ 根目录启动（不是 workspace/ 里）
claude
```

> **重要**: 必须在仓库根目录启动 Claude Code，不是在 workspace/ 里。引擎需要读取外层的配置文件。

---

## 第三步：告诉 Claude 你要做什么

启动后直接用自然语言描述你的项目。以下是四种开发模式：

### 模式 D：GStack 产品设计（推荐新产品）

> **需要先启用 GStack**: `node scripts/gstack-toggle.js --enable`

先做产品构思，再进入开发。从模糊想法到可视化原型，然后交给 Agent 团队开发：

```
/office-hours 我要做一个在线教育平台
```

Claude 会自动:
1. 挑战你的产品假设 (office-hours) — 6 个 YC 强制问题
2. 研究竞品并构建设计系统 (design-consultation)
3. 生成多个 UI 方案让你选择 (design-shotgun)
4. 将选择转化为生产级原型 (design-html)
5. 自动审查架构可行性 (autoplan) — CEO→设计→工程→DX 四维审查
6. 无缝衔接到 Phase 1-5 开发流程

**这是从"我有一个想法"到"可发布产品"最完整的路径。**

### 模式 A：全自动（推荐新手）

直接告诉 Claude 你要做什么，它自动完成从需求到代码的全流程：

```
启用狂暴模式，创建一个博客系统，支持文章发布、评论、用户注册登录
```

Claude 会自动:
1. PM 分析需求 → 产出 PRD
2. Architect 设计架构 → 产出设计文档
3. 前端/后端并行开发 → 产出代码到 `workspace/src/`
4. QA 测试验证
5. 代码推送到 GitHub

### 模式 B：分阶段手动控制

逐步推进，每个阶段你来确认：

```
Phase 1: 分析需求 — 创建一个在线商城，需要商品管理、购物车、订单功能
```

完成后确认无误再推进:
```
Phase 2: 开始开发
```

### 模式 C：单功能开发

只做一个小功能，不启动全流程：

```
请帮我实现用户登录功能，包含 JWT 认证
```

---

## 第四步：查看产出

Claude 工作结束后，检查产出:

```bash
# 项目代码
ls workspace/src/

# 需求和设计文档
ls workspace/docs/requirements/
ls workspace/docs/design/

# GStack 产品设计输出（如启用了 GStack）
ls workspace/docs/design/OFFICE_HOURS.md
ls workspace/docs/design/DESIGN.md
ls workspace/docs/design/IMPLEMENTATION_PLAN.md

# 测试文档
ls workspace/docs/test/
```

---

## 开发阶段说明

全自动模式下，项目经历以下阶段自动推进:

```
Phase 0:   项目初始化    ← git repo + 目录结构
    ↓
Phase 0.5: 产品设计 [可选] ← GStack (需启用)
    │                      0.5a: office-hours → design-consultation → design-shotgun → design-html
    │                      0.5b: autoplan (CEO → 设计 → 工程 → DX 审查)
    │                      bridge: 转换输出为 PRD 格式
    ↓
Phase 1:   需求分析      ← PM + PO + Architect 并行
    ↓                      产出: PRD.md, 设计文档, 验收标准
Phase 2:   开发实现      ← Frontend + Backend 并行 (TDD)
    ↓                      产出: workspace/src/ 中的代码
Phase 3:   测试验证      ← QA + 代码审查
    ↓                      产出: 测试报告
Phase 4:   产品体验      ← 体验师审查
    ↓
Phase 5:   部署发布      ← DevOps 自动部署
```

**每个阶段有质量门禁**，上一阶段不达标不会进入下一阶段。

**GStack 默认禁用**，通过 `node scripts/gstack-toggle.js --enable` 启用。禁用时 Phase 0 → Phase 1 直接衔接，与 v2.5.0 完全一致。

---

## 代码注释规范

所有生成的代码自动遵循中文注释 + 版本控制标准:

```typescript
/**
 * @module services/auth
 * @version 1.0.0
 * @since 2026-04-11
 * @description 用户认证服务
 *
 * Changelog:
 * - 1.0.0 (2026-04-11): 初始实现
 */

/**
 * 用户登录
 *
 * @param {LoginRequest} req - 登录请求参数
 * @returns {Promise<AuthResult>} 认证结果
 */
```

你不需要手动加注释，Claude 会自动遵循。详见 `rules/08_code_comments.md`。

---

## 常用命令

| 命令 | 功能 |
|------|------|
| `/office-hours` | [GStack] 产品构思，6 个 YC 强制问题 |
| `/autoplan` | [GStack] 自动四维审查流水线 |
| `/plan` | 进入计划模式，规划实现方案 |
| `/commit` | 提交代码 |
| `/pr` | 创建 Pull Request |
| `/review` | 代码审查 |
| `/compact` | 压缩上下文（对话太长时用） |
| `/clear` | 清空对话重新开始 |

---

## 技术栈

| 类型 | 默认选项 |
|------|---------|
| **前端** | React 19 + TypeScript + Vite 6 + Tailwind CSS |
| **后端 (Java)** | Spring Boot 3.x + JPA |
| **后端 (Python)** | Python 3.12+ |
| **测试 (前端)** | Vitest + React Testing Library |
| **测试 (后端 Java)** | JUnit 5 + Mockito |
| **包管理 (前端)** | pnpm |

> 技术栈在 CLAUDE.md 中固定，变更需通过 ADR 审批。

---

## 常见问题

**Q: 代码写在哪？**
A: `workspace/src/` 目录。文档在 `workspace/docs/`。

**Q: 在哪个目录启动 Claude Code？**
A: 仓库根目录（有 CLAUDE.md 的那个目录），不是 workspace/ 里。

**Q: 如何选择技术栈？**
A: 初始化时通过 `--type` 参数选择: `node`、`java`、`python`。

**Q: GStack 是什么？我需要启用吗？**
A: GStack 是 YC CEO Garry Tan 的开源产品设计框架。它帮你在写代码前先想清楚产品。如果你已经知道要做什么（有现成 PRD），不需要启用。如果你只有一个模糊想法，建议启用模式 D。

**Q: 如何更新引擎？**
A: `git pull origin main` 拉取最新模板。`workspace/` 内的代码不会受影响。

**Q: 想换一种开发模式？**
A: 直接在对话中切换。模式 A/B/C/D 只是交互方式不同，底层引擎一样。

---

*更多细节见 [完整使用手册](docs/GUIDE.md) 和 [README.md](README.md)*
