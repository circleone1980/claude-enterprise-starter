# Plan History（迭代计划归档）

> 本文件记录 claude-enterprise-starter 项目的重大版本迭代计划，便于版本回滚和查阅。

---

## 2026-04-26 14:50 — v3.1.0 升级计划

**分支**: `refactor/v3.0-audit-optimization`
**基线版本**: v2.6.0（main）
**目标版本**: v3.1.0

### Context

**问题**: 当前 v2.6.0 存在三个核心缺口:
1. GStack 技能依赖 `~/.claude/skills/gstack/bin/` 全局安装（9 个文件 320 处引用），用户未安装 GStack 则技能完全不可用
2. 缺少浏览器端真实测试（/qa）、方案脑暴（/ce-brainstorm）、知识沉淀（/ce-compound）等关键能力
3. 文档创建（PRD/架构设计）过程缺乏"对抗审查"机制，无法发现逻辑漏洞和需求偏差

**目标**: v3.1.0 实现 GStack 技能完全自包含、集成 CE 插件（仅需求/设计/评审阶段）、新增 /qa 浏览器测试、实现"左右互搏"对抗式文档审查。

**用户决策**:
- GStack: 完全自包含，不要求用户额外安装
- /qa: 从 GStack 精简移植，用 Playwright MCP 重写
- CE /ce:work: 不集成到开发流程，仅保留 brainstorm/plan/review/compound

---

### Phase 1: GStack 技能独立化（P0）

#### 问题
9 个 GStack 技能的 `## Preamble (run first)` 区段（每个 ~170 行）硬编码调用 `~/.claude/skills/gstack/bin/` 下的 6 个脚本，共 320 处引用。

#### 方案：轻量级 Preamble 替换

**新建文件**: `skills/_shared/gstack-preamble-lite.sh`

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
_SESSION_DIR="$HOME/.claude-enterprise/sessions"
mkdir -p "$_SESSION_DIR" 2>/dev/null || true
touch "$_SESSION_DIR/$PPID" 2>/dev/null || true
_SESSIONS=$(find "$_SESSION_DIR" -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find "$_SESSION_DIR" -mmin +120 -type f -exec rm {} + 2>/dev/null || true
echo "SESSIONS: $_SESSIONS"
_REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
_SLUG=$(basename "$_REPO_ROOT" 2>/dev/null || echo "unknown")
echo "SLUG: $_SLUG"
```

**修改 9 个文件**（替换 Preamble 区段 + 移除 Telemetry 区段）:

| 文件 | Preamble 行数 | Telemetry 行数 | bin/ 引用数 |
|------|-------------|---------------|-----------|
| `skills/office-hours/SKILL.md` | ~170 | ~35 | 37 |
| `skills/plan-ceo-review/SKILL.md` | ~170 | ~35 | 39 |
| `skills/plan-devex-review/SKILL.md` | ~170 | ~35 | 39 |
| `skills/plan-eng-review/SKILL.md` | ~170 | ~30 | 38 |
| `skills/plan-design-review/SKILL.md` | ~170 | ~30 | 38 |
| `skills/autoplan/SKILL.md` | ~170 | ~30 | 36 |
| `skills/design-consultation/SKILL.md` | ~170 | ~30 | 36 |
| `skills/design-shotgun/SKILL.md` | ~170 | ~30 | 29 |
| `skills/design-html/SKILL.md` | ~170 | ~30 | 28 |

**同时修改**:
- `rules/09_gstack_integration.md` — 更新说明"不再依赖全局 GStack 安装"
- `settings.json` — 移除 gstackIntegration 的 enabled 限制，技能始终可用
- `automation/agent-orchestration.json` — Product-Designer 和 Design-Reviewer 的 `gstackOnly: true` 改为 `false`

---

### Phase 2: 新增 /qa 浏览器测试技能（P0）

#### 新建文件: `skills/qa/SKILL.md`

基于 GStack /qa 核心逻辑，用 Playwright MCP 重写，去掉 GStack 特有基础设施。

**核心功能**:
- 使用 Playwright MCP 工具（browser_navigate, browser_click, browser_snapshot, browser_take_screenshot 等）
- 支持 3 种模式: full（完整测试）、quick（30 秒冒烟）、diff-aware（仅测变更文件）
- 输出结构化测试报告（健康评分 + 截图证据 + Bug 列表）
- 10 阶段: 初始化 → 认证 → 定向 → 探索 → 记录 → 汇总 → 分诊 → 修复循环 → 最终 QA → 报告

**关联修改**:
- `automation/agent-orchestration.json` — QA agent 的 `requiredSkills` 添加 `"qa"`
- `agents/qa.md` — 必用技能表添加 `qa`，标准操作流程添加浏览器测试步骤
- `rules/07_skill_triggers.md` — 测试阶段添加 qa 触发规则
- `skills/PROVENANCE.md` — 添加 qa 条目（来源: custom，基于 gstack/qa 精简）

---

### Phase 3: CE 插件集成（P0）

#### 定位

CE 插件已全局安装，技能通过 `/ce-brainstorm`, `/ce-plan`, `/ce-review`, `/ce-compound` 访问。本项目**引用而非复制**。

**不集成 /ce:work**（用户决策），开发流程继续使用本项目 TDD 工作流。

#### 修改文件

**`settings.json`** — 添加 CE 插件声明:

```json
"compoundEngineering": {
  "enabled": true,
  "description": "Compound Engineering 全局插件集成（需全局安装 CE 插件）",
  "skills": ["ce-brainstorm", "ce-plan", "ce-review", "ce-compound"],
  "documentHandoff": {
    "brainstormOutput": "docs/brainstorms/",
    "planOutput": "docs/plans/",
    "reviewOutput": "docs/reviews/",
    "compoundOutput": "docs/solutions/"
  }
}
```

**`automation/agent-orchestration.json`** — Agent 技能映射更新:

| Agent | 新增 CE 技能 | 理由 |
|-------|-------------|------|
| PM | `ce-brainstorm` | 需求探索阶段多方案构思 |
| Architect | `ce-brainstorm`, `ce-plan` | 架构选型多方案 + 经验规划 |
| QA | `ce-review` | 多维度专项审查 |
| DevOps | `ce-review` | 部署前多维审查 |

**`rules/07_skill_triggers.md`** — 添加 CE 技能触发规则章节:

| 触发场景 | CE 技能 | 适用角色 |
|---------|--------|---------|
| 需求不明确，需要多方案探索 | `/ce-brainstorm` | PM, Architect |
| 文档创建完毕，需要详细规划 | `/ce-plan` | Architect |
| 代码/文档需要多维度审查 | `/ce-review` | QA, DevOps |
| 阶段结束，需要知识沉淀 | `/ce-compound` | 所有角色 |

#### 文档流转目录

```
/ce-brainstorm → docs/brainstorms/{topic}-requirements.md
/ce-plan       → docs/plans/{date}-{type}-{name}-plan.md
/ce-review     → docs/reviews/{topic}-review.md
/ce-compound   → docs/solutions/{category}/{topic}.md
```

**新建目录**（含 .gitkeep）:
- `docs/brainstorms/`
- `docs/plans/`
- `docs/reviews/`
- `docs/solutions/`

**新建规则**: `rules/16_ce_integration.md` — CE 插件集成规则（技能触发、文档流转、前置依赖说明）

---

### Phase 4: "左右互搏"对抗式文档审查（P1）

#### 机制设计

在文档创建过程中，两个对立视角的 Agent 同时审查:

- **"左派" Review-Champion**: 质疑者。使用 `/ce-review` 多维审查 + `/ce-brainstorm` 生成替代方案
- **"右派" PM/Architect**: 辩护者。逐条回应或采纳挑战

**核心流程**:
```
PM 创建 PRD 草稿
    ↓
[人工干预点] "PRD 初稿已就绪，建议运行 /adversarial-review prd"
    ↓
左派 Agent: /ce-review → /ce-brainstorm → 输出挑战报告
    ↓
右派 (PM): 逐条回应/采纳 → 输出修订文档
    ↓
[人工干预点] "左派提出 N 个挑战，右派采纳 M 个。请确认最终版本"
```

#### 新建文件

**`skills/adversarial-review/SKILL.md`** — 对抗审查编排技能:

```yaml
---
name: adversarial-review
version: 1.0.0
effort: high
description: |
  Adversarial document review - "left-right sparring" pattern.
  Launches opposing review agents to challenge and defend a document.
  Use: /adversarial-review prd | design | api | ui
---
```

**`agents/review-champion.md`** — 对抗审查"左派"Agent:

```yaml
---
name: review-champion
role: Review Champion (Devil's Advocate)
team: Quality
subagentType: general-purpose
phase: "1-review"
---
```

必用技能: `ce-review`, `ce-brainstorm`, `plan-ceo-review`, `plan-eng-review`

**`rules/15_adversarial_review.md`** — 对抗审查规则:
- 触发时机: Phase 1 文档初稿完成后
- 审查文档: PRD.md → `/adversarial-review prd`、01_系统架构设计.md → `/adversarial-review design`、03_API接口设计.md → `/adversarial-review api`、04_UI设计规范.md → `/adversarial-review ui`
- 评分: 每个挑战标记 accepted/partially-accepted/rejected
- 限制: 每轮最多 5 个挑战点，避免上下文爆炸

#### 关联修改

- `automation/agent-orchestration.json` — 添加 Review-Champion agent
- `rules/04_agent_team.md` — 添加 Review-Champion 角色
- `CLAUDE.md` 第七节 Agent Team 表 — 添加行

---

### Phase 5: 人工干预点嵌入（P1）

#### 干预点设计

| 阶段 | 干预时机 | 提示内容 |
|------|---------|---------|
| Phase 0.5a | office-hours 完成 | "产品构思完成。建议: /design-consultation 或直接进入 Phase 1" |
| Phase 1 (PRD) | PRD 初稿完成 | "PRD 初稿就绪。建议运行 /adversarial-review prd" |
| Phase 1 (架构) | 架构设计完成 | "架构设计完成。建议: /plan-eng-review 或 /adversarial-review design" |
| Phase 1→2 | 冻结层文档完成 | "所有文档就绪。建议运行 /ce-compound 沉淀本轮经验" |
| Phase 2 | Feature 完成 | "Feature 完成。建议: /ce-review 或 /code-review" |
| Phase 3→4 | 测试完成 | "测试通过。建议: /qa 浏览器测试 或直接进入体验阶段" |

#### 实现方式

1. **Agent prompt 内嵌**: 各 Agent 的 `## 标准操作流程` "完成"阶段添加 `AskUserQuestion`
2. **phase-gates.json**: 关键门禁添加 `requireApproval: true`
3. **rules/15_adversarial_review.md**: 定义标准干预提示模板

---

### Phase 6: Agent 编排更新（P1）

#### 变更汇总

| Agent | 变更 | 详情 |
|-------|------|------|
| **Review-Champion** | 新增 | `requiredSkills: [ce-review, ce-brainstorm, plan-ceo-review, plan-eng-review]` |
| PM | 修改 | +`ce-brainstorm` |
| Architect | 修改 | +`ce-brainstorm`, `ce-plan` |
| QA | 修改 | +`qa`, `ce-review` |
| DevOps | 修改 | +`ce-review` |
| Product-Designer | 修改 | `gstackOnly: true` → `false` |
| Design-Reviewer | 修改 | `gstackOnly: true` → `false` |

#### agent-orchestration.json 核心变更

1. 版本号: `2.6.0` → `3.1.0`
2. 新增 `Review-Champion` 条目
3. 更新 PM/Architect/QA/DevOps 的 `requiredSkills`
4. `gstackConfig` 保留但 `enabled` 不再影响 GStack 技能可用性（仅控制 Phase 0.5 是否自动触发）

#### teams/ 配置更新

- `teams/dev/config.json` — 添加 review-champion
- `teams/full/config.json` — 添加 review-champion，product-designer/design-reviewer 不再依赖 gstackOnly

---

### Phase 7: Rules 和 CLAUDE.md 更新（P1）

#### 新建规则

| 文件 | 说明 |
|------|------|
| `rules/15_adversarial_review.md` | 对抗审查规则 |
| `rules/16_ce_integration.md` | CE 插件集成规则 |

#### 修改规则

| 文件 | 修改 |
|------|------|
| `rules/04_agent_team.md` | 添加 Review-Champion，更新 PM/Architect/QA 技能表 |
| `rules/06_document_lifecycle.md` | 文档体系添加 brainstorms/plans/reviews/solutions |
| `rules/07_skill_triggers.md` | 添加 CE 触发、qa 触发、对抗审查触发，更新全局阶段流程图 |
| `rules/09_gstack_integration.md` | 更新"独立化说明"，不再要求全局安装 |
| `rules/10_mode_selection.md` | 添加 Phase 1-review 模式决策 |

#### CLAUDE.md 更新

1. 版本号 `3.0.0` → `3.1.0`
2. 第七节 Agent Team 表: 添加 Review-Champion 行，更新各角色技能
3. 第九节规则加载: 添加 rule 15、16 引用
4. 第零节 GStack: 更新为"已独立化，无需全局安装"
5. 新增"Compound Engineering 集成"小节
6. 新增"对抗审查机制"小节

---

### Phase 8: 文档、模板和发布（P2）

#### 文档更新

| 文件 | 修改 |
|------|------|
| `skills/PROVENANCE.md` | 添加 qa、adversarial-review；添加 CE 插件来源分类 |
| `README.md` | Skills 36→38, Agents 15→16, Rules 14→16；新增 CE 集成说明；版本 2.6.0→3.1.0 |
| `docs/GUIDE.md` | 版本号 2.6.0→3.1.0，添加 CE/qa/对抗审查使用说明 |
| `docs/fixes/CHANGELOG.md` | 添加 v3.1.0 变更记录 |

#### 新建目录

- `docs/brainstorms/`（含 .gitkeep）
- `docs/reviews/`（含 .gitkeep）
- `docs/solutions/`（含 .gitkeep）

#### ADR

- `docs/superpowers/decisions/ADR-003-v31-gstack-independence.md`
- `docs/superpowers/decisions/ADR-004-v31-adversarial-review.md`

---

### Git 策略

在当前分支 `refactor/v3.0-audit-optimization` 上直接完成所有修改，最终合并到 main。

#### 提交顺序

```
1. feat(v3.1): strip GStack bin/ dependencies — lightweight preamble
2. feat(v3.1): add /qa browser testing skill (Playwright MCP)
3. feat(v3.1): integrate CE plugin (brainstorm/plan/review/compound)
4. feat(v3.1): add adversarial-review skill + Review-Champion agent
5. feat(v3.1): embed human intervention points in document creation flow
6. feat(v3.1): update agent orchestration for v3.1
7. feat(v3.1): add rules 15 (adversarial review) and 16 (CE integration)
8. feat(v3.1): update CLAUDE.md, README.md, PROVENANCE.md for v3.1.0
```

#### 发布

```bash
git checkout main
git merge refactor/v3.0-audit-optimization
git tag -a v3.1.0 -m "v3.1.0: GStack Independence + CE Integration + Adversarial Review"
git push origin main --tags
```

---

### 文件变更汇总

| 类型 | 文件 | Phase |
|------|------|-------|
| 新建 | `skills/_shared/gstack-preamble-lite.sh` | 1 |
| 新建 | `skills/qa/SKILL.md` | 2 |
| 新建 | `skills/adversarial-review/SKILL.md` | 4 |
| 新建 | `agents/review-champion.md` | 4 |
| 新建 | `rules/15_adversarial_review.md` | 7 |
| 新建 | `rules/16_ce_integration.md` | 7 |
| 新建 | `docs/brainstorms/.gitkeep` | 3 |
| 新建 | `docs/reviews/.gitkeep` | 3 |
| 新建 | `docs/solutions/.gitkeep` | 3 |
| 修改 | `skills/office-hours/SKILL.md` | 1 |
| 修改 | `skills/plan-ceo-review/SKILL.md` | 1 |
| 修改 | `skills/plan-devex-review/SKILL.md` | 1 |
| 修改 | `skills/plan-eng-review/SKILL.md` | 1 |
| 修改 | `skills/plan-design-review/SKILL.md` | 1 |
| 修改 | `skills/autoplan/SKILL.md` | 1 |
| 修改 | `skills/design-consultation/SKILL.md` | 1 |
| 修改 | `skills/design-shotgun/SKILL.md` | 1 |
| 修改 | `skills/design-html/SKILL.md` | 1 |
| 修改 | `automation/agent-orchestration.json` | 3,4,6 |
| 修改 | `agents/pm.md` | 3 |
| 修改 | `agents/architect.md` | 3 |
| 修改 | `agents/qa.md` | 2 |
| 修改 | `agents/devops.md` | 3 |
| 修改 | `settings.json` | 1,3 |
| 修改 | `rules/04_agent_team.md` | 7 |
| 修改 | `rules/06_document_lifecycle.md` | 7 |
| 修改 | `rules/07_skill_triggers.md` | 2,3,7 |
| 修改 | `rules/09_gstack_integration.md` | 1 |
| 修改 | `rules/10_mode_selection.md` | 7 |
| 修改 | `CLAUDE.md` | 7 |
| 修改 | `skills/PROVENANCE.md` | 8 |
| 修改 | `README.md` | 8 |
| 修改 | `docs/GUIDE.md` | 8 |
| 修改 | `docs/fixes/CHANGELOG.md` | 8 |

**总计**: 新建 ~11 文件，修改 ~25 文件

---

### 验收标准

- [ ] 9 个 GStack 技能在无 `~/.claude/skills/gstack/bin/` 环境下可运行
- [ ] `/office-hours` 可独立运行（无需启用 gstackConfig）
- [ ] `/qa` 执行浏览器测试并生成报告
- [ ] `/ce-brainstorm` 可正常调用
- [ ] `/adversarial-review prd` 启动左右互搏审查
- [ ] PM/Architect/QA 的 requiredSkills 包含 CE 技能
- [ ] Product-Designer 和 Design-Reviewer 的 gstackOnly 为 false
- [ ] rules/15、rules/16 已创建
- [ ] 所有文档版本号统一为 3.1.0（CLAUDE.md, README.md, GUIDE.md, agent-orchestration.json, PROVENANCE.md）
- [ ] README.md 统计: 38 Skills, 16 Agents, 16 Rules
- [ ] git tag v3.1.0 已推送到 origin/main
