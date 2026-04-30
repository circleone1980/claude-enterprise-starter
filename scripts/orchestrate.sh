#!/bin/bash
# =============================================================================
# orchestrate.sh — 阶段式开发 Prompt 生成器
#
# 核心变更（vs v3.x 被动 CLI）:
#   1. 不再输出 JSON，而是生成 Claude Code 可执行的 prompt 文本
#   2. prompt 写入 .claude/logs/phase-{N}-prompt.md
#   3. 主会话读取 prompt 文件并执行 Agent/Skill 调用
#   4. --interactive 模式每阶段暂停等用户确认
#
# 用法:
#   bash scripts/orchestrate.sh --phase 0       # Phase 0（头脑风暴）
#   bash scripts/orchestrate.sh --phase 1       # Phase 1（需求分析）
#   bash scripts/orchestrate.sh --phase all     # 全流程
#   bash scripts/orchestrate.sh --dry-run       # 干跑模式
#   bash scripts/orchestrate.sh --interactive   # 交互模式
#   bash scripts/orchestrate.sh --status        # 查看状态
#
# Updated: 2026-04-30 v5.2.0
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && { pwd -W 2>/dev/null || pwd; })"

# 配置文件路径
SSOT="$PROJECT_ROOT/automation/agent-orchestration.json"
RAGE_MODE="$PROJECT_ROOT/automation/rage-mode.json"
PHASE_GATES="$PROJECT_ROOT/automation/phase-gates.json"
PHASE_LOG_DIR="$PROJECT_ROOT/.claude/logs"
PHASE_LOG="$PHASE_LOG_DIR/current-phase.json"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[orchestrate]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[orchestrate]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[orchestrate]${NC} $1"; }
log_error() { echo -e "${RED}[orchestrate]${NC} $1"; }

# --- 解析参数 ---
PHASE_TARGET="status"
DRY_RUN=false
INTERACTIVE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --phase=*) PHASE_TARGET="${1#*=}" ;;
    --phase)   PHASE_TARGET="$2"; shift ;;
    --dry-run) DRY_RUN=true ;;
    --interactive) INTERACTIVE=true ;;
    --status)  PHASE_TARGET="status" ;;
    *) log_error "未知参数: $1"; exit 1 ;;
  esac
  shift
done

# --- 确保日志目录存在 ---
mkdir -p "$PHASE_LOG_DIR"

# --- 检查配置文件 ---
check_config() {
  for f in "$SSOT" "$RAGE_MODE"; do
    if [ ! -f "$f" ]; then
      log_error "配置文件不存在: $f"
      exit 1
    fi
  done
}

# --- 获取阶段信息 ---
get_phase_info() {
  local phase_id="$1"
  node -e "
    const rage = require('$RAGE_MODE');
    const phase = rage.phases.find(p => String(p.id) === '$phase_id');
    console.log(phase ? JSON.stringify(phase) : 'null');
  " 2>/dev/null
}

# --- 获取阶段 agents ---
get_phase_agents() {
  local phase_id="$1"
  node -e "
    const rage = require('$RAGE_MODE');
    const phase = rage.phases.find(p => String(p.id) === '$phase_id');
    console.log(phase ? phase.requiredAgents.join(',') : '');
  " 2>/dev/null
}

# --- 生成 Phase 0 prompt ---
generate_phase0_prompt() {
  local prompt_file="$PHASE_LOG_DIR/phase-0-prompt.md"
  cat > "$prompt_file" << 'PHASE0_EOF'
# Phase 0: 头脑风暴 — 执行指令

## 执行步骤

1. 调用 Agent 工具生成 Brainstormer:
   ```
   Agent({
     description: "Phase 0 头脑风暴",
     name: "Brainstormer",
     subagent_type: "everything-claude-code:planner",
     prompt: `你是 Brainstormer（头脑风暴师）。遵循 agents/brainstormer.md 定义的 SOP。

必须调用以下 Skill:
1. 调用 Skill ce-brainstorm 开启头脑风暴
2. 调用 Skill design-context 获取项目上下文

工作流程:
- 与用户交互式讨论产品定位和假设
- 对关键技术决策给出 ≥2 种方案对比
- 将讨论结果输出到 docs/brainstorms/ 目录
- 创建过程追踪记录 docs/process-trace/phase0/001-brainstorm.md
  - 记录使用的 Agent: Brainstormer
  - 记录调用的 Skill: ce-brainstorm, design-context
  - 记录关键决策和原因

任务: 与用户讨论项目需求方向。等待用户输入项目描述后开始。`
   })
   ```

2. Brainstormer 完成后，检查输出:
   - docs/brainstorms/ 目录下有 .md 文件
   - docs/process-trace/phase0/001-brainstorm.md 已创建

3. 请用户确认方向，确认后创建 `.user-confirmed` 标记文件

4. 运行缺口检测:
   ```bash
   node scripts/gap-detector.js --phase=0
   ```

5. 如果无缺口，Phase 0 完成
PHASE0_EOF

  log_ok "Phase 0 prompt 已生成: $prompt_file"
}

# --- 生成 Phase 1 prompt ---
generate_phase1_prompt() {
  local prompt_file="$PHASE_LOG_DIR/phase-1-prompt.md"

  local agents
  agents=$(get_phase_agents "1")

  cat > "$prompt_file" << 'PHASE1_EOF'
# Phase 1: 需求分析 — 主会话守门模式

> **设计原则**: Claude Code 子 agent 操作不触发主会话 hooks。
> 因此采用"主会话守门"模式：主会话调 Skill + 写冻结层文档，子 agent 只出内容到临时文件。

## 执行步骤

### Step 1: 创建 Team

```
TeamCreate({
  team_name: "phase1-requirements",
  description: "Phase 1 需求分析团队 — PM + PO + Architect + UI Designer"
})
```

### Step 2: 主会话调用必需 Skills（触发 PostToolUse hooks，创建 markers）

```
// Architect 需要的 Skill
Skill writing-plans

// UI Designer 需要的 Skill
Skill ui-ux-pro-max --stack react
```

### Step 3: 创建任务

为每个产出物创建 Task:
- PRD 文档
- 用户故事
- 验收标准
- 系统架构设计
- 数据库设计
- API 接口设计
- UI 设计规范

### Step 4: 并行 spawn 子 agent 生成内容（写到临时文件）

子 agent 写到 `.claude/temp/` 目录，不直接写冻结层路径。

```
// Architect agent
Agent({
  description: "Architect 准备 3 份设计文档草稿",
  mode: "bypassPermissions",
  run_in_background: true,
  prompt: `你是 Architect。准备以下 3 份设计文档的内容。

## 框架绑定（强制）

你必须在执行任务前完成以下步骤：

### 1. 读取角色定义
- Read agents/architect.md（你的角色定义和 SOP）

### 2. 调用必需 Skills
按照 agents/architect.md 的技能表，依次调用：
- Skill writing-plans（架构设计指导）

### 3. 遵循 Rules
- Rule 04 (Agent Team): 使用框架定义的 Agent 类型
- Rule 07 (Skill 触发): 按触发规则调用 Skills
- Rule 17 (过程追踪): 完成后创建追踪记录

### 4. 自报（强制）
完成后将执行摘要写入: .claude/logs/agent-self-report/architect-{时间戳}.md

格式:
```
agent: architect
phase: 1
timestamp: {ISO时间}
outputs:
  - {输出文件路径}
skills_called:
  - {skill名}: {调用时间}
rules_followed:
  - {rule编号和名称}
---

# 执行摘要

## 读取的文档
- {列出的每个 Read 操作}

## 调用的 Skills
- {每个 Skill 调用及结果摘要}

## 关键决策
| 决策点 | 选择 | 原因 |
|--------|------|------|
| {决策} | {选择} | {原因} |
```

## 必读文档
1. Read docs/requirements/PRD.md
2. Read docs/requirements/user-stories.md
3. Read docs/requirements/acceptance-criteria.md

## 输出（写到临时文件，不要写到 docs/design/）
1. .claude/temp/01_系统架构设计.md
2. .claude/temp/02_数据库设计.md
3. .claude/temp/03_API接口设计.md

## 设计标准
- Production-grade, 中文, 每份 400+ 行
- 包含 C4 架构图 / ER 图 / API 定义`
})

// UI Designer agent
Agent({
  description: "UI Designer 准备 UI 设计规范草稿",
  mode: "bypassPermissions",
  run_in_background: true,
  prompt: `你是 UI Designer。准备 UI 设计规范内容。

## 框架绑定（强制）

你必须在执行任务前完成以下步骤：

### 1. 读取角色定义
- Read agents/ui-designer.md（你的角色定义和 SOP）

### 2. 调用必需 Skills
按照 agents/ui-designer.md 的技能表，依次调用：
- Skill ui-ux-pro-max（UI/UX 设计指导）

### 3. 遵循 Rules
- Rule 04 (Agent Team): 使用框架定义的 Agent 类型
- Rule 07 (Skill 触发): 按触发规则调用 Skills
- Rule 17 (过程追踪): 完成后创建追踪记录

### 4. 自报（强制）
完成后将执行摘要写入: .claude/logs/agent-self-report/ui-designer-{时间戳}.md

格式:
```
agent: ui-designer
phase: 1
timestamp: {ISO时间}
outputs:
  - {输出文件路径}
skills_called:
  - {skill名}: {调用时间}
rules_followed:
  - {rule编号和名称}
---

# 执行摘要

## 读取的文档
- {列出的每个 Read 操作}

## 调用的 Skills
- {每个 Skill 调用及结果摘要}

## 关键决策
| 决策点 | 选择 | 原因 |
|--------|------|------|
| {决策} | {选择} | {原因} |
```

## 必读文档
1. Read docs/requirements/PRD.md
2. Read docs/requirements/user-stories.md

## 输出（写到临时文件，不要写到 docs/design/）
- .claude/temp/04_UI设计规范.md

## 设计标准
- 75 寸大屏 3840x2160, 深色主题, 中文, 500+ 行
- 设计令牌 / 组件库 / 布局系统 / 动效规范`
})
```

### Step 5: 子 agent 完成后，主会话写入冻结层文档

等待子 agent 完成（自动通知），然后主会话执行：

```
// 读取临时文件内容
const arch1 = Read('.claude/temp/01_系统架构设计.md')
const arch2 = Read('.claude/temp/02_数据库设计.md')
const arch3 = Read('.claude/temp/03_API接口设计.md')
const ui4   = Read('.claude/temp/04_UI设计规范.md')

// 主会话写入冻结层路径 → PreToolUse hooks 验证 Skill markers → 放行
Write('docs/design/01_系统架构设计.md', arch1)
Write('docs/design/02_数据库设计.md', arch2)
Write('docs/design/03_API接口设计.md', arch3)
Write('docs/design/04_UI设计规范.md', ui4)
```

### Step 6: 事后对账（自动生成 process-trace）

```bash
node scripts/post-phase-reconcile.js --phase=1
```

此脚本会：
- 扫描所有冻结层文档
- 读取 .claude/logs/trace-audit.jsonl 中的记录
- 自动生成 docs/process-trace/phase1/ 下的过程追踪文件
- 补建 .claude/logs/skill-invocations/ 中的 marker 文件

### Step 7: 对抗审查（4 个 Review Champion 并行）

```
Agent({ name: "Review-PRD", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/requirements/PRD.md，挑战假设和决策。输出到 docs/reviews/review-prd.md\n\n## 自报（强制）\n完成后写入 .claude/logs/agent-self-report/review-prd-{时间戳}.md，记录：读取的文档、发现的挑战点数、Critical/High/Medium 分布。" })

Agent({ name: "Review-Arch", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/design/01_系统架构设计.md，挑战架构决策。输出到 docs/reviews/review-architecture.md\n\n## 自报（强制）\n完成后写入 .claude/logs/agent-self-report/review-arch-{时间戳}.md，记录：读取的文档、发现的挑战点数、Critical/High/Medium 分布。" })

Agent({ name: "Review-API", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/design/03_API接口设计.md，挑战 API 设计。输出到 docs/reviews/review-api.md\n\n## 自报（强制）\n完成后写入 .claude/logs/agent-self-report/review-api-{时间戳}.md，记录：读取的文档、发现的挑战点数、Critical/High/Medium 分布。" })

Agent({ name: "Review-UI", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/design/04_UI设计规范.md，挑战 UI 设计。输出到 docs/reviews/review-ui.md\n\n## 自报（强制）\n完成后写入 .claude/logs/agent-self-report/review-ui-{时间戳}.md，记录：读取的文档、发现的挑战点数、Critical/High/Medium 分布。" })
```

### Step 8: 综合审查报告 + 修复

生成 docs/reviews/phase1-review-report.md，修复审查发现的问题

### Step 9: 验证

```bash
node hooks/scripts/process-trace-check.js --phase=phase1
```

### Step 10: 文档冻结 + 人工审批

创建 docs/requirements/.frozen，请求用户确认
PHASE1_EOF

  log_ok "Phase 1 prompt 已生成: $prompt_file"
}

# --- 生成 Phase 3 prompt ---
generate_phase3_prompt() {
  local prompt_file="$PHASE_LOG_DIR/phase-3-prompt.md"
  cat > "$prompt_file" << 'PHASE3_EOF'
# Phase 3: 测试验证 — 测试-修复-回归闭环

> **模式**: Team（QA + Frontend + Backend-Python + Architect + PM）
> **核心**: 测试-修复-回归闭环，直到所有 Bug 清零

## 执行步骤

### Step 1: 创建 Team

```
TeamCreate({
  team_name: "phase3-test-fix-loop",
  description: "Phase 3 测试验证团队 — 测试-修复-回归闭环"
})
```

### Step 2: 分配角色

| 角色 | 职责 | Agent 类型 |
|------|------|-----------|
| QA (Lead) | 执行测试、报告 Bug、回归验证 | tdd-guide |
| Frontend | 修复前端 Bug | typescript-reviewer |
| Backend-Python | 修复后端 Bug | python-reviewer |
| Architect | 审查涉及架构的修改（ADR） | architect |
| PM | 协调优先级、确认需求 | planner |

### Step 3: 测试-修复-回归闭环

```
## Loop 流程

1. QA 执行全面测试:
   - 单元测试覆盖率验证
   - 集成测试
   - E2E 测试（Playwright）
   - 输出 test-report.md

2. 如果 test-report.md 中有未解决 Bug:
   a. QA 通过 SendMessage 通知相关 Dev:
      - 前端 Bug → Frontend
      - 后端 Bug → Backend-Python
      - 跨层 Bug → Frontend + Backend-Python
   b. Dev 评估 Bug 严重程度:
      - 简单 Bug: 直接修复 → QA 回归
      - 涉及架构变更: 通知 Architect 做 ADR 审查 → 修复 → QA 回归
      - 需求理解偏差: 通知 PM 澄清 → 修复 → QA 回归
   c. Architect 审查重大修改:
      - 评估修改影响范围
      - 如需 ADR: 写 docs/superpowers/decisions/ADR-xxx.md
      - 创建 .claude/logs/.phase3-adr-reviewed 标记
      - 如有架构变更: 创建 .claude/logs/.phase3-arch-changes 标记
   d. 修复后 → QA 回归测试 → 更新 test-report.md
   e. 循环直到 test-report.md 中 Bug 数量为 0

3. 所有测试通过后:
   - 创建 .claude/logs/.phase3-tests-pass
   - 创建 .claude/logs/.phase3-integration-pass
   - 创建 .claude/logs/.phase3-e2e-pass
   - 创建 .claude/logs/.phase3-bugs-fixed
```

### Step 4: 代码审查集成

在 Bug 修复过程中，触发以下审查:
- `/codex:review` — 双模型审查每个 Bug Fix
- `code-review` — Skill 审查代码质量
- `security-review` — 安全相关 Bug 必须触发

### Step 5: 验证

```bash
node scripts/gap-detector.js --phase=3
```

### Step 6: 关闭 Team

确认所有 gate 条件满足后，关闭 Team。
PHASE3_EOF

  log_ok "Phase 3 prompt 已生成: $prompt_file"
}

# --- 生成 Phase 4 prompt ---
generate_phase4_prompt() {
  local prompt_file="$PHASE_LOG_DIR/phase-4-prompt.md"
  cat > "$prompt_file" << 'PHASE4_EOF'
# Phase 4: 产品体验 — UX 问题修复闭环

> **模式**: Team（产品体验师 + UI-Designer + Frontend + Backend-Python + Architect + PM）
> **核心**: UX 发现-修复-验证闭环，直到所有体验问题解决

## 执行步骤

### Step 1: 创建 Team

```
TeamCreate({
  team_name: "phase4-ux-fix-loop",
  description: "Phase 4 产品体验团队 — UX 发现-修复-验证闭环"
})
```

### Step 2: 分配角色

| 角色 | 职责 | Agent 类型 |
|------|------|-----------|
| 产品体验师 (Lead) | 执行体验测试、报告 UX 问题、回归验证 | planner |
| UI-Designer | 评估和修复视觉/交互问题 | general-purpose |
| Frontend | 实现前端 UX 修复 | typescript-reviewer |
| Backend-Python | 修复后端业务逻辑问题 | python-reviewer |
| Architect | 审查涉及架构的修改（ADR） | architect |
| PM | 确认优先级、协调需求 | planner |

### Step 3: UX 发现-修复-验证闭环

```
## Loop 流程

1. 产品体验师执行体验测试:
   - 视觉一致性检查（对照 UI 设计规范）
   - 交互流畅性测试
   - 业务流程完整性验证
   - 输出 ux-report.md（含问题清单和优先级）

2. 如果 ux-report.md 中有未解决 UX 问题:
   a. 体验师通过 SendMessage 通知相关角色:
      - 视觉/交互问题 → UI-Designer + Frontend
      - 操作流程问题 → Frontend + Backend-Python
      - 业务逻辑问题 → Backend-Python + PM
      - 影响架构 → Architect（ADR）
   b. 修复分类:
      - 视觉/交互 → UI Designer 评估 + Frontend 修复 → 体验师验证
      - 操作流程 → Frontend + Backend 协作 → 体验师验证
      - 业务逻辑 → Backend 修复 + PM 确认 → 体验师验证
      - 影响架构 → Architect 做 ADR → 修复 → 体验师验证
   c. Architect 审查重大修改:
      - 写 docs/superpowers/decisions/ADR-xxx.md
      - 创建 .claude/logs/.phase4-adr-reviewed 标记
      - 如有架构变更: 创建 .claude/logs/.phase4-arch-changes 标记
   d. 修复后 → 体验师回归验证 → 更新 ux-report.md
   e. 循环直到 ux-report.md 中问题数量为 0

3. 所有 UX 问题解决后:
   - 创建 .claude/logs/.phase4-ux-complete
   - 创建 .claude/logs/.phase4-ux-fixes-complete
   - 创建 .claude/logs/.phase4-ux-loop-pass
```

### Step 4: 验证

```bash
node scripts/gap-detector.js --phase=4
```

### Step 5: 关闭 Team

确认所有 gate 条件满足后，关闭 Team。
PHASE4_EOF

  log_ok "Phase 4 prompt 已生成: $prompt_file"
}

# --- 生成通用 Phase prompt ---
generate_phase_prompt() {
  local phase_id="$1"
  local prompt_file="$PHASE_LOG_DIR/phase-${phase_id}-prompt.md"

  local phase_info
  phase_info=$(get_phase_info "$phase_id")
  if [ "$phase_info" = "null" ]; then
    log_error "Phase $phase_id 未定义"
    return 1
  fi

  local phase_name
  phase_name=$(echo "$phase_info" | node -e "const d=require('fs').readFileSync(0,'utf-8'); console.log(JSON.parse(d).name);")

  local agents
  agents=$(get_phase_agents "$phase_id")

  cat > "$prompt_file" << PHASE_GENERIC_EOF
# Phase ${phase_id}: ${phase_name} — 执行指令

## 阶段 Agent: ${agents}

## 执行方式

1. 读取 .claude/logs/phase-${phase_id}-agents.md（由 auto-start-agents.js --format=prompt 生成）
2. 按其中的 Agent 调用指令执行
3. 每个 Agent 完成后创建过程追踪记录
4. 运行缺口检测:
   \`\`\`bash
   node scripts/gap-detector.js --phase=${phase_id}
   \`\`\`

## 注意事项
- 所有 Agent 必须遵循 agents/*.md 定义的 SOP
- 所有 Skill 调用必须在过程追踪中记录
- 完成后运行 node scripts/gap-detector.js --phase=${phase_id} 验证
PHASE_GENERIC_EOF

  # 同时生成详细的 agent 启动指令
  node "$PROJECT_ROOT/hooks/scripts/auto-start-agents.js" --phase="$phase_id" --format=prompt > "$PHASE_LOG_DIR/phase-${phase_id}-agents.md" 2>/dev/null || true

  log_ok "Phase $phase_id prompt 已生成: $prompt_file"
}

# --- 生成 prompt ---
generate_prompt() {
  local phase_id="$1"

  case "$phase_id" in
    0)  generate_phase0_prompt ;;
    1)  generate_phase1_prompt ;;
    3)  generate_phase3_prompt ;;
    4)  generate_phase4_prompt ;;
    *)  generate_phase_prompt "$phase_id" ;;
  esac
}

# --- 运行缺口检测 ---
run_gap_detector() {
  local phase_id="$1"
  if [ -f "$PROJECT_ROOT/scripts/gap-detector.js" ]; then
    log_info "运行 Phase $phase_id 缺口检测..."
    node "$PROJECT_ROOT/scripts/gap-detector.js" --phase="$phase_id" || true
  fi
}

# --- 保存阶段状态 ---
save_phase() {
  local phase_id="$1"
  echo "{\"currentPhase\": \"$phase_id\", \"updatedAt\": \"$(date -Iseconds)\"}" > "$PHASE_LOG"
}

# --- 查看状态 ---
cmd_status() {
  check_config
  echo ""
  log_info "========================================"
  log_info "  当前项目状态 (v5.2.0)"
  log_info "========================================"

  if [ -f "$PHASE_LOG" ]; then
    local current
    current=$(node -e "const d=require('$PHASE_LOG'); console.log(d.currentPhase || 0);" 2>/dev/null || echo "0")
    log_info "当前阶段: Phase $current"
  else
    log_info "当前阶段: Phase 0（未开始）"
  fi

  echo ""
  node -e "
    const rage = require('$RAGE_MODE');
    rage.phases.forEach(p => {
      const agents = p.requiredAgents || [];
      console.log('  Phase ' + p.id + ': ' + p.name + ' [' + agents.join(', ') + ']');
    });
  " 2>/dev/null

  echo ""
  log_info "Prompt 文件:"
  ls -la "$PHASE_LOG_DIR"/phase-*-prompt.md 2>/dev/null || log_info "  （无）"
}

# --- 主流程 ---
main() {
  check_config

  case "$PHASE_TARGET" in
    status)
      cmd_status
      ;;
    all)
      log_info "全流程模式: Phase 0 → 5"
      for phase_id in 0 1 2 3 4 5; do
        echo ""
        log_info "======== Phase $phase_id ========"

        generate_prompt "$phase_id"

        if [ "$DRY_RUN" = false ]; then
          save_phase "$phase_id"
        fi

        if [ "$INTERACTIVE" = true ]; then
          echo ""
          log_info "Phase $phase_id prompt 已生成。请在新终端中执行:"
          log_info "  cat $PHASE_LOG_DIR/phase-${phase_id}-prompt.md"
          log_info ""
          read -p "按 Enter 继续 Phase $((phase_id + 1))..."
        fi
      done
      log_ok "全流程 prompt 已生成!"
      ;;
    *)
      generate_prompt "$PHASE_TARGET"
      if [ "$DRY_RUN" = false ]; then
        save_phase "$PHASE_TARGET"
      fi
      ;;
  esac
}

main
