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
# Updated: 2026-04-27 v4.0.0
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

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

  cat > "$prompt_file" << PHASE1_EOF
# Phase 1: 需求分析 — 执行指令

## 阶段 Agent: $agents

## 执行步骤

### Step 1: 创建 Team

\`\`\`
TeamCreate({
  team_name: "phase1-requirements",
  description: "Phase 1 需求分析团队 — PM + PO + Architect"
})
\`\`\`

### Step 2: 创建任务

为每个产出物创建 Task:
- PRD 文档
- 用户故事
- 验收标准
- 系统架构设计
- 数据库设计
- API 接口设计
- UI 设计规范

### Step 3: 启动 PM Agent

\`\`\`
Agent({
  description: "PM 生成 PRD",
  name: "PM",
  subagent_type: "everything-claude-code:planner",
  team_name: "phase1-requirements",
  prompt: \`你是 PM（项目经理）。遵循 agents/pm.md 定义的 SOP。

必须调用以下 Skill:
1. 调用 Skill design-context 获取项目当前设计状态
2. 调用 Skill product-requirements 生成 PRD

输出: docs/requirements/PRD.md
过程追踪: docs/process-trace/phase1/001-prd.md\`
})
\`\`\`

### Step 4: 启动 PO Agent

\`\`\`
Agent({
  description: "PO 生成用户故事和验收标准",
  name: "PO",
  subagent_type: "general-purpose",
  team_name: "phase1-requirements",
  prompt: \`你是 PO（产品负责人）。遵循 agents/po.md 定义的 SOP。

必须调用以下 Skill:
1. 调用 Skill product-requirements 分析需求

输出:
- docs/requirements/user-stories.md
- docs/requirements/acceptance-criteria.md
过程追踪: docs/process-trace/phase1/002-user-stories.md, 003-acceptance-criteria.md\`
})
\`\`\`

### Step 5: 启动 Architect Agent

\`\`\`
Agent({
  description: "Architect 生成设计文档",
  name: "Architect",
  subagent_type: "everything-claude-code:architect",
  team_name: "phase1-requirements",
  prompt: \`你是 Architect（架构师）。遵循 agents/architect.md 定义的 SOP。

必须调用以下 Skill:
1. 调用 Skill writing-plans 生成系统架构设计
2. 调用 Skill design-context 获取设计约束

输出:
- docs/design/01_系统架构设计.md
- docs/design/02_数据库设计.md
- docs/design/03_API接口设计.md
过程追踪: docs/process-trace/phase1/004-architecture.md, 005-database.md, 006-api.md\`
})
\`\`\`

### Step 6: 启动 UI Designer Agent

\`\`\`
Agent({
  description: "UI Designer 生成 UI 规范",
  name: "UI-Designer",
  subagent_type: "general-purpose",
  team_name: "phase1-requirements",
  prompt: \`你是 UI Designer。遵循 agents/ui-designer.md 定义的 SOP。

必须调用以下 Skill:
1. 调用 Skill ui-ux-pro-max 获取 UI 最佳实践
2. 调用 Skill ui-style-selector 选择 UI 风格

输出: docs/design/04_UI设计规范.md
过程追踪: docs/process-trace/phase1/007-ui-design.md\`
})
\`\`\`

### Step 7: 对抗审查（4 个 Review Champion 并行）

PM/PO/Architect 完成后，启动 4 个并行审查:

\`\`\`
Agent({ name: "Review-PRD", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/requirements/PRD.md，从对立视角主动挑战每个假设和设计决策。输出到 docs/reviews/review-prd.md" })

Agent({ name: "Review-Arch", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/design/01_系统架构设计.md，从对立视角主动挑战架构决策。输出到 docs/reviews/review-architecture.md" })

Agent({ name: "Review-API", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/design/03_API接口设计.md，从对立视角主动挑战 API 设计。输出到 docs/reviews/review-api.md" })

Agent({ name: "Review-UI", subagent_type: "general-purpose",
  prompt: "执行对抗审查。Read docs/design/04_UI设计规范.md，从对立视角主动挑战 UI 设计。输出到 docs/reviews/review-ui.md" })
\`\`\`

### Step 8: 综合审查报告

生成 docs/reviews/phase1-review-report.md

### Step 9: 修复审查发现的问题

### Step 10: 过程追踪记录

创建 docs/process-trace/phase1/008-review.md 记录审查过程

### Step 11: 运行缺口检测

\`\`\`bash
node scripts/gap-detector.js --phase=1
\`\`\`

### Step 12: 文档冻结

创建 docs/requirements/.frozen 标记文件

### Step 13: 人工审批

请求用户确认文档冻结
PHASE1_EOF

  log_ok "Phase 1 prompt 已生成: $prompt_file"
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
  log_info "  当前项目状态 (v4.0.0)"
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
