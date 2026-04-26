# Skills Provenance（技能来源注册表）

> 集中记录所有 Skill 的来源、许可证和修改状态，便于合规审计和上游更新追踪。

---

## 来源分类

| 代码 | 说明 | 许可证要求 |
|------|------|-----------|
| `ECC` | [everything-claude-code](https://github.com/affaan-m/everything-claude-code) by Affaan Mustafa | MIT — 保留版权声明 |
| `superpowers` | [Superpowers Marketplace](https://github.com/obra/superpowers-marketplace) by Obra | 参考原项目许可 |
| `gstack` | [GStack](https://github.com/garrytan/gstack) by Garry Tan | MIT |
| `claude-plugins-official` | [Anthropic Official Plugins](https://github.com/anthropics/claude-plugins-official) | 参考原项目许可 |
| `antfu` | [Anthony Fu's Skills](https://github.com/antfu/skills) | MIT |
| `marketing-skills` | Marketing Skills Plugin | 参考原项目许可 |
| `global` | 全局 Skills (`~/.claude/skills/`) | 按来源项目 |
| `prisma` | [Prisma](https://www.prisma.io) | MIT |
| `ui-ux-pro-max-skill` | UI/UX Pro Max Plugin | 参考原项目许可 |
| `custom` | 本项目自建 | 本项目许可 |
| `ce-plugin` | Compound Engineering Plugin (全局安装) | MIT |

---

## Skills 注册表（38 个）

### ECC 来源

| Skill | 上游名称 | 说明 |
|-------|---------|------|
| `springboot-patterns` | springboot-patterns | SpringBoot 架构模式 |
| `springboot-tdd` | springboot-tdd | SpringBoot TDD |
| `springboot-security` | springboot-security | SpringBoot 安全 |
| `jpa-patterns` | jpa-patterns | JPA 数据访问模式 |
| `java-coding-standards` | java-coding-standards | Java 编码规范 |
| `verification-loop` | verification-loop | 6 阶段验证循环 |
| `search-first` | search-first | 编码前先研究 |
| `security-review` | security-review | 10 域安全审查 |
| `strategic-compact` | strategic-compact | 战略性上下文压缩 |
| `continuous-learning` | continuous-learning | 持续学习本能系统 |
| `gan-harness` | gan-style-harness | GAN 生成对抗网络式开发 |

### Superpowers 来源

| Skill | 上游名称 | 说明 |
|-------|---------|------|
| `tdd` | test-driven-development | TDD 垂直切片+Red-Green-Refactor |
| `writing-plans` | writing-plans | 实施计划编写指南 |

### GStack 来源

| Skill | 说明 |
|-------|------|
| `office-hours` | YC 6 问挑战假设 |
| `design-consultation` | 竞品研究+设计系统 |
| `design-html` | 设计转生产级 HTML/CSS |
| `design-shotgun` | 多 UI 变体+品味记忆 |
| `autoplan` | 自动 CEO→设计→工程→DX 审查 |
| `plan-ceo-review` | CEO 范围挑战 |
| `plan-design-review` | 设计评分 6 维度 |
| `plan-eng-review` | 工程架构审查 |
| `plan-devex-review` | 开发者体验审查 |
| `gstack-bridge` | Phase 0.5→1 交接协议 |

### claude-plugins-official 来源

| Skill | 上游名称 | 说明 |
|-------|---------|------|
| `code-review` | code-review | 官方 PR 代码审查 |

### 全局 Skills (`~/.claude/skills/`)

| Skill | 说明 |
|-------|------|
| `react-best-practices` | Vercel React 性能优化指南 |
| `product-requirements` | PRD 交互生成器 |

### marketing-skills 来源

| Skill | 上游名称 | 说明 |
|-------|---------|------|
| `user-onboarding` | onboarding-cro | 产品用户引导/激活优化 |

### antfu 来源

| Skill | 说明 |
|-------|------|
| `antfu` | Anthony Fu 工具链惯例（含 references/） |
| `vitest` | Vitest 测试框架最佳实践 |
| `pnpm` | pnpm 包管理器指南 |

### 其他外部来源

| Skill | Origin | 说明 |
|-------|--------|------|
| `prisma-database-setup` | prisma | Prisma ORM 配置指南 |
| `ui-ux-pro-max` | ui-ux-pro-max-skill | 综合 UI 设计智能 |
| `ui-style-selector` | custom | 设计系统生成/审计工具 |

### 本项目自建

| Skill | 说明 |
|-------|------|
| `design-context` | 角色级设计约束加载器 |
| `llm-integration` | LLM API 集成模式 |
| `vlm-integration` | VLM 视觉语言模型集成 |

### CE 插件来源（全局安装）

| Skill | 说明 |
|-------|------|
| `ce:brainstorm` | 多方案脑暴，收敛为需求规格 |
| `ce:plan` | 历史经验规划，细粒度任务 |
| `ce:review` | 多维度专项评审 |
| `ce:compound` | 知识沉淀，经验复利 |

### 新增自建（v3.1.0）

| Skill | 说明 |
|-------|------|
| `qa` | Playwright MCP 浏览器测试（基于 gstack/qa 精简） |
| `adversarial-review` | 对抗审查"左右互搏"编排 |

---

## 已移除 Skills（v2.7.1）

| Skill | 移除原因 | 替代 |
|-------|---------|------|
| `sprint-planning` | 内容是 `planning-with-files`，非 GStack；功能与 `autoplan` 重叠 | PM/PO 使用 `autoplan` |
| `tdd-workflow` | 功能与 `tdd` 高度重叠 | 合并入 `tdd`（superpowers 原版） |
| `workflow-engine` | 内容是 `dmux-workflows`（tmux 工具），不是工作流引擎 | 按 CLAUDE.md 技术栈直接使用 Flowable/Prefect |

---

*最后更新: 2026-04-26*
*Skills 总数: 38*
*用途: 合规审计、上游更新追踪、技能来源溯源*
