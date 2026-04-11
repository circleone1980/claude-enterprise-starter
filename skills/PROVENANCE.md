# Skills Provenance（技能来源注册表）

> 集中记录所有 Skill 的来源、许可证和修改状态，便于合规审计和上游更新追踪。

---

## 来源分类

| 代码 | 说明 | 许可证要求 |
|------|------|-----------|
| `ECC` | [everything-claude-code](https://github.com/affaan-m/everything-claude-code) by Affaan Mustafa | MIT — 保留版权声明 |
| `superpowers` | [Superpowers Plugin](https://github.com/anthropics/superpowers) by Anthropic | 参考原项目许可 |
| `claude-plugins-official` | [Anthropic Official Plugins](https://github.com/anthropics/claude-plugins-official) | 参考原项目许可 |
| `antfu` | [Anthony Fu's Skills](https://github.com/antfu/skills) | MIT |
| `prisma` | [Prisma](https://www.prisma.io) | MIT |
| `ui-ux-pro-max-skill` | UI/UX Pro Max Plugin | 参考原项目许可 |
| `planning-with-files` | Planning with Files Plugin | 参考原项目许可 |
| `custom` | 本项目自建 | 本项目许可 |

---

## Skills 注册表

### ECC 来源

| Skill | Origin | 上游名称 | 说明 |
|-------|--------|---------|------|
| springboot-patterns | ECC | springboot-patterns | SpringBoot 架构模式 |
| springboot-tdd | ECC | springboot-tdd | SpringBoot TDD |
| springboot-security | ECC | springboot-security | SpringBoot 安全 |
| jpa-patterns | ECC | jpa-patterns | JPA 数据访问模式 |
| java-coding-standards | ECC | java-coding-standards | Java 编码规范 |
| verification-loop | ECC | verification-loop | 6 阶段验证循环 |
| search-first | ECC | search-first | 编码前先研究 |
| security-review | ECC | security-review | 10 域安全审查 |
| strategic-compact | ECC | strategic-compact | 战略性上下文压缩 |
| continuous-learning | ECC | continuous-learning | 持续学习本能系统 |
| tdd-workflow | ECC | tdd-workflow | TDD Red-Green-Refactor |
| tdd | ECC | tdd-workflow | TDD（与 tdd-workflow 同源） |
| gan-harness | ECC | gan-style-harness | GAN 生成对抗网络式开发 |
| product-requirements | ECC | product-capability | 产品能力/需求规划 |
| ui-style-selector | ECC | design-system | 设计系统/视觉一致性 |
| user-onboarding | ECC | codebase-onboarding | 开发者 onboarding |
| workflow-engine | ECC | dmux-workflows | 多 Agent 工作流编排 |

### Superpowers 来源

| Skill | Origin | 说明 |
|-------|--------|------|
| writing-plans | superpowers | 实施计划编写指南 |

### claude-plugins-official 来源

| Skill | Origin | 上游名称 | 说明 |
|-------|--------|---------|------|
| code-review | claude-plugins-official | code-review | 官方 PR 代码审查 |
| react-best-practices | claude-plugins-official | frontend-design | 官方前端设计 |

### 其他外部来源

| Skill | Origin | 说明 |
|-------|--------|------|
| antfu | antfu | Anthony Fu 工具链惯例 |
| prisma-database-setup | prisma | Prisma ORM 配置指南 |
| ui-ux-pro-max | ui-ux-pro-max-skill | 综合 UI 设计智能 |
| sprint-planning | planning-with-files | 文件式任务规划 |

### 本项目自建

| Skill | Origin | 说明 |
|-------|--------|------|
| design-context | custom | 角色级设计约束加载器 |
| llm-integration | custom | LLM API 集成模式 |
| vlm-integration | custom | VLM 视觉语言模型集成 |

---

*最后更新: 2026-04-11*
*用途: 合规审计、上游更新追踪、技能来源溯源*
