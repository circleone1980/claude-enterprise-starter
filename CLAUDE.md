# Claude Code 项目模板

> 📋 **使用说明**: 复制此目录到新项目的 `.claude/` 目录，根据项目需求修改配置

---

## 零、GStack 产品设计层 (Phase 0.5) 🔴

> **状态**: 可选功能，通过 `automation/agent-orchestration.json` 的 `gstackConfig.enabled` 控制
> **定位**: 产品构思与设计验证，在需求分析（Phase 1）之前
> **来源**: GStack (Garry Tan, YC CEO) 开源框架 MIT 协议，66K stars

### Phase 0.5 Pipeline

```
Phase 0.5a: Think (Product Ideation)
  /office-hours → /design-consultation → /design-shotgun → /design-html
  产出: DESIGN.md + HTML 原型

Phase 0.5b: Plan (Architecture Review)
  /autoplan (→ CEO → Design → Eng → DX 审查)
  产出: IMPLEMENTATION_PLAN.md (各维度评分 ≥ 7.0/10)

Bridge: gstack-bridge 自动将 Phase 0.5 输出转换为 Phase 1 PRD 格式
```

### GStack Agent 映射

| 角色 | 核心技能 | Phase | Agent 类型 |
|------|---------|-------|-----------|
| **Product Designer** | office-hours 🔴, design-consultation 🔴, design-shotgun, design-html | 0.5a | general-purpose |
| **Design Reviewer** | autoplan 🔴, plan-ceo-review, plan-design-review, plan-eng-review, plan-devex-review | 0.5b | general-purpose |

### GStack 技能文件

| 技能 | 路径 |
|------|------|
| office-hours | `skills/office-hours/SKILL.md` |
| design-consultation | `skills/design-consultation/SKILL.md` |
| design-shotgun | `skills/design-shotgun/SKILL.md` |
| design-html | `skills/design-html/SKILL.md` |
| autoplan | `skills/autoplan/SKILL.md` |
| plan-ceo-review | `skills/plan-ceo-review/SKILL.md` |
| plan-eng-review | `skills/plan-eng-review/SKILL.md` |
| plan-design-review | `skills/plan-design-review/SKILL.md` |
| plan-devex-review | `skills/plan-devex-review/SKILL.md` |
| gstack-bridge | `skills/gstack-bridge/SKILL.md` |

### 启用/禁用

```bash
# 启用 GStack（默认禁用，保证向后兼容）
node scripts/gstack-toggle.js --enable

# 禁用 GStack
node scripts/gstack-toggle.js --disable

# 查看状态
node scripts/gstack-toggle.js --status
```

> **向后兼容**: GStack 默认禁用。未启用时 Phase 0.5 被跳过，Phase 0 → Phase 1 直接衔接，行为与 v2.5.0 完全一致。

---

## 一、基础规则

### 规则1：语言

所有交互问答都用**中文**和我对话

### 规则2：项目启动

所有项目的启动都由我自己启动，不要擅自启动
**Why**: 避免端口冲突和资源争用，确保开发环境可控

### 规则3：问题处理

所有开发遇到的问题进行记录和总结，每次遇到问题先查询 `docx/fixed/` 文件夹下的错误记录
**Why**: 知识复用，避免重复踩坑

### 规则4：开发约束

**禁止**:

- 禁止 todo（使用 Task 工具代替）
- 禁止 token 不足时简化代码
- 禁止硬编码
- 禁止代码冲突功能重复
- 禁止数据 mock
- 禁止 MVP 版本

**Why**: 保证生产级代码质量，技术债成本远高于一次性做好

### 规则5：数据库变更

统一使用 Python 构建脚本插入，脚本统一放在 `docx/sql/` 文件夹下
**Why**: 版本可控、可审计、可回滚

### 规则6：退出前文档同步 🔴

退出 Claude Code 前，必须将本次会话所有变更同步到 `README.md` 和 `docs/GUIDE.md` 的对应位置。未同步不得退出。
**Why**: 文档是团队协作入口，不同步团队成员无法感知变更
**详细规则**: [rules/00_global.md](rules/00_global.md)

---

## 一-B、技术栈约束

### 前端技术栈（固定）

| 类别     | 技术选型                        | 版本要求                                    |
| -------- | ------------------------------- | ------------------------------------------- |
| 框架     | React                           | 19+ (Server Components + Client Components) |
| 语言     | TypeScript                      | strict mode                                 |
| 构建工具 | Vite                            | 6+                                          |
| 包管理   | pnpm                            | 9+                                          |
| 测试     | Vitest + React Testing Library  | 最新稳定版                                  |
| Lint     | ESLint flat config (antfu 风格) | 最新稳定版                                  |

> **Why**: 技术栈统一降低团队协作摩擦，模板工程默认基于此技术栈
> **约束**: 所有前端 Skills 和 Agent 配置默认基于此技术栈，如需变更需通过 ADR

### 后端技术栈（Java + Python 双栈）

| 类别     | 技术选型                           | 版本要求                      |
| -------- | ---------------------------------- | ----------------------------- |
| 主语言   | Java                               | 17+ (records, sealed classes) |
| 框架     | Spring Boot                        | 3.x                           |
| ORM      | Spring Data JPA                    | 最新稳定版                    |
| 构建     | Maven / Gradle                     | Maven 3.9+ / Gradle 8+        |
| 测试     | JUnit 5 + Mockito + Testcontainers | 最新稳定版                    |
| 辅助语言 | Python                             | 3.12+                         |
| AI SDK   | OpenAI SDK / Anthropic SDK         | 最新稳定版                    |
| 工作流   | Flowable / Prefect                 | 最新稳定版                    |

> **Why**: Java 处理核心业务逻辑和高并发场景，Python 处理 AI/ML 和数据处理
> **约束**: Java 后端使用 `everything-claude-code:java-reviewer`，Python 后端使用 `everything-claude-code:python-reviewer`

---

## 二、系统设计标准

### 角色定位

作为一名具有大型互联网企业架构经验的系统架构师（Staff / Principal Engineer Level）。

### 目标

所有系统设计和开发必须以 **Production-grade Enterprise System（企业级生产系统）** 为目标。

### 严禁输出

- MVP 版本设计
- Demo 级实现
- 简化架构
- 概念级模块说明
- 伪代码级系统设计
- "可以简单实现为..." 之类的方案

### 系统必须满足

- 高可用（High Availability）
- 高可扩展（Scalability）
- 高可维护（Maintainability）
- 高安全（Security）

---

## 三、上下文管理策略 🔴

> **Why**: Claude 在 70% 上下文时开始失去精度，85% 时幻觉增加，90%+ 时响应变得不稳定

### 上下文阈值

| 上下文使用率 | 状态    | 行动                     |
| ------------ | ------- | ------------------------ |
| 0-50%        | 🟢 正常 | 正常工作                 |
| 50-70%       | 🟡 注意 | 考虑使用 `/compact`    |
| 70-90%       | 🟠 警告 | 必须使用 `/compact`    |
| 90%+         | 🔴 危险 | 必须使用 `/clear` 重置 |

### 上下文优化原则

1. **引用而非嵌入**: 使用 `rules/*.md` 模块化规则，而非在此文件重复
2. **按需加载**: Skills 仅在需要时加载，不要在此文件引用具体 Skill 内容
3. **渐进披露**: 子目录 `CLAUDE.md` 仅在该目录工作时加载

---

## 四、文档体系

> **状态**: Phase 1 冻结层文档完成后锁定，修改需 ADR

### 文档分层

| 层级             | 路径                                           | 说明                                         |
| ---------------- | ---------------------------------------------- | -------------------------------------------- |
| **冻结层** | `docs/requirements/`, `docs/design/`       | Phase 1 产出，Phase 2 开始前冻结，修改需 ADR |
| **演化层** | `docs/dev/`, `docs/test/`, `docs/fixes/` | 持续更新，Agent 可自行修改                   |
| **ADR层**  | `docs/superpowers/decisions/`                | 设计变更记录                                 |

### 核心文档

| 文档                   | 路径                               | 负责人              |
| ---------------------- | ---------------------------------- | ------------------- |
| **PRD**          | `docs/requirements/PRD.md`       | PM + PO             |
| **系统架构设计** | `docs/design/01_系统架构设计.md` | Architect           |
| **数据库设计**   | `docs/design/02_数据库设计.md`   | Architect + Backend |
| **API 接口设计** | `docs/design/03_API接口设计.md`  | Architect           |
| **UI 设计规范**  | `docs/design/04_UI设计规范.md`   | UI Designer         |

### 文档生命周期

- **创建**: Phase 1 由 PM/PO/Architect/UI Designer 填充冻结层文档
- **冻结**: Phase 1→2 门禁通过后锁定，修改需 ADR
- **更新**: 演化层文档可随时更新，冻结层文档通过 ADR 更新

**详细规则**: [文档生命周期规则](rules/06_document_lifecycle.md)

---

## 五、需求分析方法

在分析系统功能时，必须按照 **product-requirements 方式进行需求拆解**：

```
Business Capability
  → Product Feature
  → System Capability
  → Technical Implementation
```

**Why**: 确保技术实现与业务目标对齐，避免过度工程或需求偏离

---

## 六、系统设计粒度要求

所有功能必须拆解为完整 **功能树结构**：

```
Module
└── Submodule
    └── Feature
        └── Capability
            └── API / Job / Task
```

每个 Feature 必须达到 **PRD级粒度**，确保研发团队可以直接实现。

---

## 七、开发质量流程（Quality Gates）

每完成一个 Feature 必须执行四项检查：

1. **功能完整性检测** - 验证实现是否符合 PRD 与设计要求
2. **代码评审** - 检查代码结构、规范、异常处理、日志、并发安全
3. **编译与测试** - 确保编译通过并完成基础测试
4. **及时更新** - 完成或者修改功能时，必须及时更新文档
5. **注释合规** - 每个源文件有模块头注释（@version, @since, @module, Changelog），每个公开函数有中文注释（详见 [rules/08_code_comments.md](rules/08_code_comments.md)）

**任何检查未通过，禁止进入下一阶段。**

**Why**: 质量问题的修复成本随阶段指数增长

---

## 八、Agent Team Skills 强制规则 🔴

> **角色-技能映射的定义源**: `automation/agent-orchestration.json`
> 以下为简化视图，完整配置含 subagentType、dependencies、count 等字段详见上述文件

### 各角色技能（简化视图）

| 角色                     | 核心技能 🔴                               | 辅助技能                                                                                                                 | Agent 类型          |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **Product Designer** | office-hours 🔴, design-consultation 🔴 | design-shotgun, design-html                                                                                              | general-purpose     |
| **Design Reviewer**  | autoplan 🔴                               | plan-ceo-review, plan-design-review, plan-eng-review, plan-devex-review                                                  | general-purpose     |
| **PM**             | product-requirements                      | sprint-planning                                                                                                          | planner             |
| **PO**             | product-requirements                      | sprint-planning, user-onboarding                                                                                         | general-purpose     |
| **Architect**      | writing-plans 🔴                          | product-requirements, react-best-practices, ui-ux-pro-max, ui-style-selector, code-review                                | architect           |
| **UI Designer**    | ui-ux-pro-max 🔴, ui-style-selector       | Figma MCP                                                                                                                | general-purpose     |
| **Frontend**       | tdd 🔴, antfu 🔴                          | ui-ux-pro-max, code-review                                                                                               | typescript-reviewer |
| **Backend-Java**   | springboot-patterns 🔴, springboot-tdd 🔴 | jpa-patterns, springboot-security, java-coding-standards, llm-integration, vlm-integration, workflow-engine, code-review | java-reviewer       |
| **Backend-Python** | tdd 🔴                                    | prisma-database-setup, llm-integration, vlm-integration, workflow-engine, code-review                                    | python-reviewer     |
| **QA**             | tdd, verification-loop 🔴                 | code-review, security-review, Playwright MCP                                                                             | tdd-guide           |
| **DevOps**         | code-review                               | security-review, GitHub MCP                                                                                              | general-purpose     |
| **产品体验师**     | user-onboarding 🔴                        | product-requirements, ui-ux-pro-max                                                                                      | planner             |
| **GAN Planner**    | gan-harness                               | writing-plans, product-requirements                                                                                      | planner             |
| **GAN Generator**  | gan-harness                               | tdd, code-review, springboot-patterns, antfu                                                                             | general-purpose     |
| **GAN Evaluator**  | gan-harness, verification-loop 🔴         | code-review, security-review                                                                                            | general-purpose     |

> **Product Designer** 和 **Design Reviewer** 仅在 GStack 启用时激活（gstackOnly: true）

**Why**: 技能映射确保角色专业化，避免通用 Agent 能力稀释

> 详细配置和启动命令模板见 `rules/04_agent_team.md`
> 角色标准操作流程（SOP）见各 `agents/*.md` 文件

### 启动 Agent 标准格式

```bash
# GStack Product Designer (Phase 0.5a)
Agent --name "Product-Designer-1" \
  --subagent-type "general-purpose" \
  --prompt "你是 Product Designer。必须遵循以下流程：
    1. 🔴 调用 Skill office-hours 挑战产品假设
    2. 🔴 调用 Skill design-consultation 研究竞品 + 构建设计系统
    3. 调用 Skill design-shotgun 生成 UI 变体
    4. 调用 Skill design-html 转换为生产级 HTML
    任务：..."

# GStack Design Reviewer (Phase 0.5b)
Agent --name "Design-Reviewer-1" \
  --subagent-type "general-purpose" \
  --prompt "你是 Design Reviewer。必须遵循以下流程：
    1. 🔴 调用 Skill autoplan 运行完整审查流水线
    2. 呈现品味决策给用户审批
    3. 确认所有维度评分 ≥ 7.0/10
    任务：..."

# Java 后端开发 - 标准
Agent --name "Backend-Java-1" \
  --subagent-type "everything-claude-code:java-reviewer" \
  --prompt "你是 Java 后端开发。必须遵循以下流程：
    1. 🔴 调用 Skill springboot-patterns 获取 SpringBoot 架构指导
    2. 🔴 调用 Skill springboot-tdd 启动 TDD 流程
    3. 编写测试用例（Red 阶段）
    4. 实现代码（Green 阶段）
    5. 重构优化（Refactor 阶段）
    6. 如涉及安全 → 调用 Skill springboot-security
    7. 如涉及 AI → 调用 Skill llm-integration / vlm-integration
    8. 使用 code-review 审查代码质量
    任务：..."

# Python 后端开发 - 标准
Agent --name "Backend-Python-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "你是 Python 后端开发。必须遵循以下流程：
    1. 🔴 调用 Skill tdd 启动 TDD 流程（垂直切片模式）
    2. 🔴 调用 Skill prisma-database-setup 获取数据库配置指导
    3. 编写测试用例（Red 阶段）
    4. 实现代码（Green 阶段）
    5. 重构优化（Refactor 阶段）
    6. 使用 code-review 审查代码质量
    7. 确保测试覆盖率 >80%
    任务：..."

# 前端开发 - 标准
Agent --name "Frontend-1" \
  --subagent-type "everything-claude-code:typescript-reviewer" \
  --prompt "你是前端开发。必须遵循以下流程：
    1. 调用 Skill ui-ux-pro-max --stack react 获取 React 最佳实践
    2. 🔴 调用 Skill tdd 启动 TDD 流程（垂直切片模式）
    3. 编写测试用例（Red 阶段）
    4. 实现组件代码（Green 阶段）
    5. 重构优化（Refactor 阶段）
    6. 使用 code-review 审查代码
    7. 确保测试覆盖率 >80%
    任务：..."
```

### 禁止行为

- ❌ 禁止创建不指定 subagent-type 的 Agent
- ❌ 禁止 Prompt 中不包含 Skill 调用指令
- ❌ 禁止后端/前端开发不使用 TDD
- ❌ 禁止任何开发角色跳过代码审查
- ❌ **禁止直接编写代码（必须先规划 → TDD → 实现 → 审查）**

---

## 九、狂暴模式（Rage Mode）🔴

> **全自动开发模式**: Claude Code 全权接管开发任务，无需人为介入确认各阶段推进

### 自动化能力

| 自动化功能                     | 触发条件                |
| ------------------------------ | ----------------------- |
| **自动创建 GitHub 仓库** | 项目初始化时            |
| **定时推送代码**         | 每 30 分钟 / 每阶段完成 |
| **Agent 健康监控**       | 每 5 分钟检查           |
| **自动重启下线 Agent**   | 检测到 Agent 下线       |
| **阶段自动推进**         | 前置阶段完成且通过验证  |
| **安全边界守护**         | 每次工具调用前          |

### 阶段自动推进流程

```
Phase 0: 项目初始化
    ↓ (自动, IF gstack.enabled)
Phase 0.5: 产品设计 (Product-Designer → Design-Reviewer)
    ↓ (自动, gstack-bridge 转换输出)
Phase 1: 需求分析 (PM/PO/Architect 并行)
    ↓ (自动验证通过后)
Phase 2: 开发实现 (Frontend x3 / Backend-Java x2 / Backend-Python x1 / UI Designer 并行)
    ↓ (自动验证通过后)
Phase 3: 测试验证 (QA + 代码审查)
    ↓ (自动验证通过后)
Phase 4: 产品体验 (产品体验师)
    ↓ (自动验证通过后)
Phase 5: 部署发布 (DevOps)
    ↓ (自动)
GitHub 推送 → 完成报告
```

### 安全边界 🔴

**需要用户确认的操作:**

- 删除/编辑项目目录外的任何文件
- 执行 sudo 命令
- 访问 `~/.ssh`, `~/.gnupg`, `~/.config` 等敏感路径

---

## 十、模组化规则加载

此项目使用模块化规则系统，按需加载：

- [全局规则](rules/00_global.md) - 语言、启动约束
- [开发约束](rules/01_development.md) - 禁止项、编码规范
- [数据库规范](rules/02_database.md) - SQL设计范式
- [质量门禁](rules/03_quality.md) - 测试覆盖率、代码审查
- [Agent Team 规则](rules/04_agent_team.md) - 角色映射、技能使用
- [安全规范](rules/05_security.md) - 安全边界、敏感数据处理
- [文档生命周期规则](rules/06_document_lifecycle.md) - 文档分层、冻结/演化规则、ADR 流程 🔴
- [技能触发规则](rules/07_skill_triggers.md) - 技能触发时机、动态调用指令 🔴
- [代码注释规范](rules/08_code_comments.md) - 模块头注释、中文函数注释、版本控制 🔴
- [GStack 集成规则](rules/09_gstack_integration.md) - Phase 0.5 触发规则、交接协议 🔴

**Why**: 模块化减少主文件大小，提高规则可维护性和可发现性

---

## 十一、代理定义文件

| 角色           | 路径                             |
| -------------- | -------------------------------- |
| Product Designer | `agents/product-designer.md` |
| Design Reviewer | `agents/design-reviewer.md` |
| PM             | `agents/pm.md`                 |
| PO             | `agents/po.md`                 |
| Architect      | `agents/architect.md`          |
| UI Designer    | `agents/ui-designer.md`        |
| Frontend       | `agents/frontend.md`           |
| Backend-Java   | `agents/backend-java.md`       |
| Backend-Python | `agents/backend-python.md`     |
| QA             | `agents/qa.md`                 |
| DevOps         | `agents/devops.md`             |
| 产品体验师     | `agents/product-experience.md` |
| GAN Planner    | `agents/gan-planner.md`        |
| GAN Generator  | `agents/gan-generator.md`      |
| GAN Evaluator  | `agents/gan-evaluator.md`      |

---

## 十二、技能文件位置

| 技能                             | 路径                                      |
| -------------------------------- | ----------------------------------------- |
| office-hours                     | `skills/office-hours/SKILL.md`          |
| design-consultation              | `skills/design-consultation/SKILL.md`   |
| design-shotgun                   | `skills/design-shotgun/SKILL.md`        |
| design-html                      | `skills/design-html/SKILL.md`           |
| autoplan                         | `skills/autoplan/SKILL.md`              |
| plan-ceo-review                  | `skills/plan-ceo-review/SKILL.md`       |
| plan-eng-review                  | `skills/plan-eng-review/SKILL.md`       |
| plan-design-review               | `skills/plan-design-review/SKILL.md`    |
| plan-devex-review                | `skills/plan-devex-review/SKILL.md`     |
| gstack-bridge                    | `skills/gstack-bridge/SKILL.md`         |
| product-requirements             | `skills/product-requirements/SKILL.md`  |
| sprint-planning                  | `skills/sprint-planning/SKILL.md`       |
| tdd                              | `skills/tdd/SKILL.md`                   |
| tdd-workflow                     | `skills/tdd-workflow/SKILL.md`          |
| code-review                      | `skills/code-review/SKILL.md`           |
| ui-ux-pro-max                    | `skills/ui-ux-pro-max/SKILL.md`         |
| user-onboarding                  | `skills/user-onboarding/SKILL.md`       |
| react-best-practices             | `skills/react-best-practices/SKILL.md`  |
| antfu                            | `skills/antfu/SKILL.md`                 |
| prisma-database-setup            | `skills/prisma-database-setup/SKILL.md` |
| design-context 🔴                | `skills/design-context/SKILL.md`        |
| ui-style-selector                | `skills/ui-style-selector/SKILL.md`     |
| **writing-plans**          | `skills/writing-plans/SKILL.md`         |
| **springboot-patterns** 🔴 | `skills/springboot-patterns/SKILL.md`   |
| **springboot-tdd** 🔴      | `skills/springboot-tdd/SKILL.md`        |
| **springboot-security**    | `skills/springboot-security/SKILL.md`   |
| **jpa-patterns**           | `skills/jpa-patterns/SKILL.md`          |
| **java-coding-standards**  | `skills/java-coding-standards/SKILL.md` |
| **llm-integration**        | `skills/llm-integration/SKILL.md`       |
| **vlm-integration**        | `skills/vlm-integration/SKILL.md`       |
| **workflow-engine**        | `skills/workflow-engine/SKILL.md`       |
| **verification-loop** 🔴   | `skills/verification-loop/SKILL.md`     |
| **search-first**           | `skills/search-first/SKILL.md`          |
| **security-review**        | `skills/security-review/SKILL.md`       |
| **strategic-compact**      | `skills/strategic-compact/SKILL.md`     |
| **gan-harness**            | `skills/gan-harness/SKILL.md`           |
| **continuous-learning**    | `skills/continuous-learning/SKILL.md`   |

### 代码注释模板

| 文件 | 语言 |
|------|------|
| `templates/code-headers/typescript.ts.template` | TypeScript / JavaScript |
| `templates/code-headers/java.java.template` | Java |
| `templates/code-headers/python.py.template` Python |

---

## 十三、验证与信任 🔴

> **Why**: Claude Code 生成的代码可能比人工代码多 1.75x 逻辑错误 (ACM 2025)

### 验证策略

| 场景               | 验证方式            |
| ------------------ | ------------------- |
| **个人开发** | 验证逻辑 + 边缘情况 |
| **团队开发** | 系统性同行评审      |
| **生产环境** | 强制门禁测试        |

### 信任校准

1. **每个输出必须验证** - 不要盲目信任 AI 生成
2. **使用 `/insights`** - 检查 Claude 的置信度
3. **测试覆盖** - 关键逻辑必须有测试
4. **代码审查** - 使用 code-review skill

---

## 十四、Agent Team 清理机制 🔴

> **已知 Bug**: TeamDelete 在 Agent 上下文耗尽/僵尸化后永久失败（5 个已确认 Bug）
>
> - #38116 — Agent 批准 shutdown 后仍被计为"active"
> - #29908 — 空闲 agent 成为僵尸，忽略 shutdown_request
> - #25371 — Agent 上下文耗尽后 TeamDelete 永久失败
> - #27882 — 手动删除文件后内存 AppState 残留
> - #36366 — 状态栏显示过期团队名

### 清理流程

1. 尝试优雅关闭: 向所有 Agent 发送 `SendMessage({ to: "agent-name", message: { type: "shutdown_request" } })`
2. 等待 30 秒
3. 尝试 `TeamDelete`
4. 如果失败 → 执行强制清理:
   ```bash
   bash scripts/team-manager.sh clean <team-name>
   ```
5. 重启 Claude Code 或 `/clear` 清除内存残留

### 批量清理

```bash
bash scripts/team-manager.sh status   # 扫描僵尸团队
bash scripts/team-manager.sh nuke     # 清除所有非 default 团队
```

**Why**: 阶段推进时自动调用 team-manager.sh 清理上阶段 Team，防止僵尸团队阻塞新团队创建

---

## 十五、智能模式选择引擎 🔴

> **定义源**: `automation/agent-orchestration.json` → `modeSelection` + `modeThresholds`

### 评分因子

| 因子                     | 范围 | 含义                            |
| ------------------------ | ---- | ------------------------------- |
| `communicationNeed`    | 0-3  | 角色间实时通信需求（讨论/协商） |
| `crossLayerDependency` | 0-3  | 跨层依赖（前后端接口对齐）      |
| `contextPressure`      | 0-2  | 上下文压力（长时间运行）        |
| `roleCount`            | 0-1  | 同类角色数量                    |
| `writeConflictRisk`    | -2-0 | 写冲突风险惩罚                  |

### 决策规则

| 总分 | 模式                                            | 适用场景           |
| ---- | ----------------------------------------------- | ------------------ |
| ≥ 6 | **Agent Team** (TeamCreate + SendMessage) | 需求讨论、接口对齐 |
| 3-5  | **Subagent 并行** (多个 Agent 同时 spawn) | 可并行的独立任务   |
| < 3  | **Subagent 顺序** (链式执行)              | 独立验证/部署      |

### 各阶段自动决策

| 阶段      | 角色                          | 总分 | 模式           |
| --------- | ----------------------------- | ---- | -------------- |
| Phase 0.5a | Product-Designer               | 1    | Subagent 顺序  |
| Phase 0.5b | Design-Reviewer                | 1    | Subagent 顺序  |
| Phase 1   | PM+PO+Architect               | 7    | **Team** |
| Phase 2A  | Frontend+Backend 接口对齐     | 7    | **Team** |
| Phase 2B  | 各角色独立开发                | 0-2  | Subagent 顺序  |
| Phase 3-5 | QA/体验师/DevOps              | 0-1  | Subagent 顺序  |
| GAN       | Planner→Generator→Evaluator | 2    | Subagent 顺序  |

---

## 十六、双模型协作策略

### 模型分工

| 场景               | 使用工具                       | 模型    | 原因                 |
| ------------------ | ------------------------------ | ------- | -------------------- |
| **代码开发** | Claude Code（GLM-5）           | GLM-5   | 开发任务，主会话模型 |
| **代码审查** | `/codex:review`              | GPT-5.4 | 编码能力强，独立视角 |
| **对抗审查** | `/codex:adversarial-review`  | GPT-5.4 | 主动挑错，提升质量   |
| **Bug 修复** | `/codex:rescue`              | GPT-5.4 | 诊断+修复一步到位    |
| **后台审查** | Stop Hook（Codex Review Gate） | GPT-5.4 | 每次会话结束自动审查 |

### 使用时机

**Phase 0.5（GStack 产品设计）**:

- 产品构思 → GLM-5
- 架构审查 → `/codex:review`

**Phase 1（需求分析）**:

- 文档编写 → GLM-5
- 架构审查 → `/codex:review`

**Phase 2（开发）**:

- 开发代码 → GLM-5
- 完成 Feature 后 → `/codex:review`
- 发现 Bug → `/codex:rescue`

**Phase 3（测试）**:

- QA 验证 → GLM-5
- 代码审查 → `/codex:review`

**Phase 5（部署前）**:

- 最终审查 → `/codex:adversarial-review`

### 启用 Stop Review Gate（L3 兜底层）

**首次使用必须执行**:
```bash
/codex:setup --enable-review-gate
```

启用后，每次会话结束自动运行 Codex 审查。Stop Gate 内置智能判断：
- **有代码变更** → 自动触发 Codex 审查（GPT-5.4）
- **纯文档/报告/状态输出** → 自动跳过，不触发
- **Codex 未安装** → 静默跳过，不阻塞

### Codex 自动触发时机总结

| 触发层 | 时机 | 方法 | 可跳过？ |
|--------|------|------|---------|
| **L1 自动** | Phase 2→3 门禁 | orchestrate.sh 调用 `codex review` | 否 |
| **L1 自动** | Phase 4→5 门禁 | orchestrate.sh 调用 `codex adversarial-review` | 否 |
| **L2 提醒** | Agent 任务完成 | prompt 注入提醒主 Claude | 是 |
| **L3 兜底** | 会话结束有代码变更 | Stop Review Gate（需首次 setup） | 否 |
| **L4 手动** | 随时 | `/codex:review` / `/codex:rescue` | 是 |

---

*模板版本: 2.6.0*
*最后更新: 2026-04-11*
*重大变更: GStack Phase 0.5 产品设计层集成（15 Agent + 37 Skills）*
*基于: [DataCamp CLAUDE.md Guide](https://www.datacamp.com/tutorial/writing-the-best-claude-md), [eesel AI Best Practices](https://www.eesel.ai/blog/claude-code-best-practices), [FlorianBruniaux Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)*
