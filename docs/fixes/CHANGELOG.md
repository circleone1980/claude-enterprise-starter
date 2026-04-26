# CHANGELOG

> **项目名称**: [项目名称]

---

## v3.1.0 (2026-04-26)

### 重大变更
- **GStack 独立化**: 9 个 GStack 技能不再依赖全局安装，Preamble 替换为轻量级版本
- **CE 插件集成**: 引入 Compound Engineering 插件（brainstorm/plan/review/compound），仅需求/设计/评审阶段
- **对抗审查**: 新增 `/adversarial-review` 命令和 Review-Champion Agent，实现"左右互搏"文档审查
- **浏览器测试**: 新增 `/qa` 技能（Playwright MCP），支持 full/quick/diff-aware 模式

### 新增文件
- `skills/qa/SKILL.md` — 浏览器测试
- `skills/adversarial-review/SKILL.md` — 对抗审查编排
- `skills/_shared/gstack-preamble-lite.sh` — 轻量级 preamble 模板
- `agents/review-champion.md` — 对抗审查质疑者 Agent
- `rules/15_adversarial_review.md` — 对抗审查规则
- `rules/16_ce_integration.md` — CE 插件集成规则
- `docs/brainstorms/`, `docs/reviews/`, `docs/solutions/` — CE 文档流转目录

### 修改文件
- 9 个 GStack 技能 SKILL.md — Preamble 独立化（共减少 ~4000 行）
- `automation/agent-orchestration.json` — 版本 2.6.0→3.1.0，新增 Review-Champion，PM/Architect/QA/DevOps 增加 CE 技能
- `settings.json` — 新增 compoundEngineering、adversarialReview 配置
- `CLAUDE.md` — 版本 3.0.0→3.1.0，新增 CE 集成和对抗审查章节
- `rules/09_gstack_integration.md` — 更新为独立化说明

### 统计
- Skills: 36 → 38
- Agents: 15 → 16
- Rules: 14 → 16

---

## [1.0.0] - 2026-04-08

### Added
- 初始版本发布
- 功能 1
- 功能 2

### Changed
- 变更 1

### Fixed
- 修复 1

### Security
- 安全修复 1

---

## [0.1.0] - 2026-04-01

### Added
- 项目初始化

---

*格式遵循 Keep a Changelog*
