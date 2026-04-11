# Skills Provenance（技能来源注册表）

> 集中记录所有 Skill 的来源、许可证和修改状态，便于合规审计和上游更新追踪。

---

## 来源分类

| 代码 | 说明 | 许可证要求 |
|------|------|-----------|
| `ECC` | [everything-claude-code](https://github.com/affaan-m/everything-claude-code) by Affaan Mustafa | MIT — 保留版权声明 |
| `superpowers` | [Superpowers Plugin](https://github.com/anthropics/superpowers) | 参考原项目许可 |
| `antfu` | [Anthony Fu's Skills](https://github.com/antfu/skills) | MIT |
| `vercel` | [Vercel Engineering](https://vercel.com) | MIT |
| `prisma` | [Prisma](https://www.prisma.io) | MIT |
| `gstack` | [GStack](https://github.com/garrytan/gstack) by Garry Tan | MIT |
| `custom` | 本项目自建 | 本项目许可 |

---

## Skills 注册表

### ECC 来源

| Skill | Origin | 已标注 | Adapted | 说明 |
|-------|--------|--------|---------|------|
| springboot-patterns | ECC | ✅ | ✅ | SpringBoot 架构模式 |
| springboot-tdd | ECC | ✅ | ✅ | SpringBoot TDD |
| springboot-security | ECC | ✅ | ✅ | SpringBoot 安全 |
| jpa-patterns | ECC | ✅ | ✅ | JPA 数据访问模式 |
| java-coding-standards | ECC | ✅ | ✅ | Java 编码规范 |
| verification-loop | ECC | ✅ | ✅ | 6 阶段验证循环 |
| search-first | ECC | ✅ | ✅ | 编码前先研究 |
| security-review | ECC | ✅ | ✅ | 10 域安全审查 |
| strategic-compact | ECC | ✅ | ✅ | 战略性上下文压缩 |
| continuous-learning | ECC | ✅ | ✅ | 持续学习本能系统 |
| tdd | ECC | ❌→✅ | ✅ | TDD 垂直切片模式 |
| tdd-workflow | ECC | ❌→✅ | ✅ | TDD Red-Green-Refactor |
| code-review | ECC | ❌→✅ | ✅ | 4 维度代码审查 |
| product-requirements | ECC | ❌→✅ | ✅ | 需求分析 + PRD 生成 |

### Superpowers 来源

| Skill | Origin | 已标注 | Adapted | 说明 |
|-------|--------|--------|---------|------|
| writing-plans | superpowers | ❌→✅ | ✅ | 架构设计 + 功能拆解 |

### GStack 来源

| Skill | Origin | 已标注 | Adapted | 说明 |
|-------|--------|--------|---------|------|
| office-hours | gstack | ✅ | ✅ | YC 6 问挑战假设，输出 OFFICE_HOURS.md |
| design-consultation | gstack | ✅ | ✅ | 竞品研究+设计系统，输出 DESIGN.md |
| design-shotgun | gstack | ✅ | ✅ | 4-6 UI 变体+品味记忆 |
| design-html | gstack | ✅ | ✅ | 模型转生产级 HTML/CSS |
| autoplan | gstack | ✅ | ✅ | 自动 CEO→设计→工程→DX 审查 |
| plan-ceo-review | gstack | ✅ | ✅ | CEO 范围挑战（4 种模式） |
| plan-design-review | gstack | ✅ | ✅ | 设计评分 6 维度 0-10 |
| plan-eng-review | gstack | ✅ | ✅ | 工程架构审查 |
| plan-devex-review | gstack | ✅ | ✅ | 开发者体验审查 |
| gstack-bridge | custom | ✅ | ✅ | Phase 0.5→1 交接协议（本项目自建，受 gstack 启发） |

### 外部来源（有明确作者）

| Skill | Origin | Author | Source | License | Adapted |
|-------|--------|--------|--------|---------|----------| 
| antfu | antfu | Anthony Fu | [GitHub](https://github.com/antfu/skills/tree/main/skills/antfu) | MIT | ✅ |
| react-best-practices | vercel | Vercel Engineering | — | MIT | ✅ |
| prisma-database-setup | prisma | Prisma | — | MIT | ✅ |

### 本项目自建

| Skill | Origin | 说明 |
|-------|--------|------|
| ui-ux-pro-max | custom | 161 色板 + 99 UX 准则的综合 UI 设计智能 |
| sprint-planning | custom | Sprint 计划和迭代管理 |
| user-onboarding | custom | 产品首次体验设计 |
| ui-style-selector | custom | 60 品牌 UI 风格选择器 |
| design-context | custom | 角色级设计约束加载器 |
| gan-harness | custom | GAN 生成对抗网络式开发（概念来自 ECC） |
| llm-integration | custom | LLM API 集成模式 |
| vlm-integration | custom | VLM 视觉语言模型集成 |
| workflow-engine | custom | 工作流编排模式 |

---

*最后更新: 2026-04-11*
*用途: 合规审计、上游更新追踪、技能来源溯源*