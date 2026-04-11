#!/bin/bash
# =============================================================================
# orchestrate.sh — CLI 驱动的阶段式开发 Pipeline
#
# 用法:
#   bash scripts/orchestrate.sh --phase all      # 全流程（Phase 0 → 5）
#   bash scripts/orchestrate.sh --phase 1        # 仅 Phase 1（需求分析）
#   bash scripts/orchestrate.sh --phase 0.5a     # GStack Think 阶段
#   bash scripts/orchestrate.sh --phase 0.5b     # GStack Plan 阶段
#   bash scripts/orchestrate.sh --dry-run        # 干跑模式，输出计划不执行
#   bash scripts/orchestrate.sh --status         # 查看当前阶段状态
#
# 工作原理:
#   1. 读取 automation/agent-orchestration.json（SSOT）获取 agent 定义
#   2. 读取 automation/rage-mode.json 获取 phase-agent 映射
#   3. 读取 automation/phase-gates.json 获取门禁条件
#   4. 对每个 phase：执行门禁检查 → 启动 agents → 等待完成 → 清理
#
# Updated: 2026-04-11
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 配置文件路径
SSOT="$PROJECT_ROOT/automation/agent-orchestration.json"
RAGE_MODE="$PROJECT_ROOT/automation/rage-mode.json"
PHASE_GATES="$PROJECT_ROOT/automation/phase-gates.json"
FEATURE_GATES="$PROJECT_ROOT/automation/feature-gates.json"
PHASE_LOG="$PROJECT_ROOT/.claude/logs/current-phase.json"
TEAM_MANAGER="$PROJECT_ROOT/scripts/team-manager.sh"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[orchestrate]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[orchestrate]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[orchestrate]${NC} $1"; }
log_error() { echo -e "${RED}[orchestrate]${NC} $1"; }
log_gstack() { echo -e "${MAGENTA}[gstack]${NC} $1"; }

# --- 解析参数 ---
PHASE_TARGET="status"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --phase=*)
      PHASE_TARGET="${1#*=}"
      ;;
    --phase)
      PHASE_TARGET="$2"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      ;;
    --status)
      PHASE_TARGET="status"
      ;;
    *)
      log_error "未知参数: $1"
      echo "用法: bash scripts/orchestrate.sh [--phase <phase|all>] [--dry-run] [--status]"
      exit 1
      ;;
  esac
  shift
done

# --- 检查配置文件 ---
check_config() {
  if [ ! -f "$SSOT" ]; then
    log_error "SSOT 文件不存在: $SSOT"
    exit 1
  fi
  if [ ! -f "$RAGE_MODE" ]; then
    log_error "rage-mode.json 不存在: $RAGE_MODE"
    exit 1
  fi
}

# --- 检查 GStack 是否启用 ---
is_gstack_enabled() {
  node -e "
    const ssot = require('$SSOT');
    console.log(ssot.gstackConfig && ssot.gstackConfig.enabled ? 'true' : 'false');
  " 2>/dev/null
}

# --- 获取阶段信息 ---
get_phase_info() {
  local phase_id="$1"
  node -e "
    const rage = require('$RAGE_MODE');
    const phase = rage.phases.find(p => String(p.id) === '$phase_id');
    if (phase) {
      console.log(JSON.stringify(phase));
    } else {
      console.log('null');
    }
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

# --- 检查门禁 ---
check_gates() {
  local from_phase="$1"
  local to_phase="$2"
  local gate_key="phase${from_phase}_to_phase${to_phase}"

  node -e "
    const gates = require('$PHASE_GATES');
    const gate = gates.gates['$gate_key'];
    if (!gate) { console.log(JSON.stringify({ status: 'no_gate', results: [] })); process.exit(0); }

    const { execSync } = require('child_process');
    const results = gate.conditions.map(c => {
      if (!c.check) return { description: c.description, passed: true, note: 'no auto-check' };
      try {
        execSync(c.check, { cwd: '$PROJECT_ROOT', timeout: 5000, stdio: 'pipe' });
        return { description: c.description, passed: true };
      } catch(e) {
        return { description: c.description, passed: false };
      }
    });

    const allPassed = results.every(r => r.passed);
    console.log(JSON.stringify({ status: allPassed ? 'passed' : 'pending', results }));
  " 2>/dev/null
}

# --- 执行阶段 ---
run_phase() {
  local phase_id="$1"
  local phase_info
  phase_info=$(get_phase_info "$phase_id")

  if [ "$phase_info" = "null" ]; then
    log_error "Phase $phase_id 未定义"
    return 1
  fi

  local phase_name
  phase_name=$(echo "$phase_info" | node -e "const d=require('fs').readFileSync(0,'utf-8'); console.log(JSON.parse(d).name);")

  echo ""
  log_info "========================================"
  log_info "  Phase $phase_id: $phase_name"
  log_info "========================================"

  # 获取该阶段的 agents
  local agents
  agents=$(get_phase_agents "$phase_id")
  log_info "Agents: $agents"

  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] 将启动 agents: $agents"

    # 显示模式决策
    node -e "
      const ssot = require('$SSOT');
      const thresholds = ssot.modeThresholds;
      const agents = '$agents'.split(',').filter(Boolean);
      agents.forEach(name => {
        const a = ssot.agents[name];
        if (!a) return;
        const s = a.modeSelection || {};
        const total = Object.values(s).reduce((a,b) => a+b, 0);
        const mode = total >= (thresholds.team||6) ? 'Team' : total >= (thresholds.subagentParallel||3) ? 'Subagent(并行)' : 'Subagent(顺序)';
        console.log('  ' + name + ': score=' + total + ' → ' + mode);
      });
    " 2>/dev/null
    return 0
  fi

  # 实际执行：输出 JSON 指令
  log_info "生成启动指令..."
  node "$PROJECT_ROOT/hooks/scripts/auto-start-agents.js" --phase="$phase_id"

  log_ok "Phase $phase_id 指令已生成"
}

# --- GStack Phase 0.5 执行 ---
run_gstack_phase() {
  local phase_id="$1"
  local enabled
  enabled=$(is_gstack_enabled)

  if [ "$enabled" != "true" ]; then
    log_gstack "GStack 未启用，跳过 Phase $phase_id"
    return 0
  fi

  run_phase "$phase_id"

  # Phase 0.5b 完成后自动运行 gstack-bridge
  if [ "$phase_id" = "0.5b" ] && [ "$DRY_RUN" = false ]; then
    log_gstack "Phase 0.5b 完成，执行 gstack-bridge 交接..."
    log_gstack "请确认 Design Reviewer 已运行: Skill gstack-bridge"
    log_gstack "交接完成后将自动进入 Phase 1"
  fi
}

# --- 清理上阶段 Team ---
cleanup_team() {
  local phase_id="$1"
  if [ -f "$TEAM_MANAGER" ]; then
    log_info "清理 Phase $((phase_id - 1)) 的 Team..."
    bash "$TEAM_MANAGER" status 2>/dev/null || true
  fi
}

# --- 保存阶段状态 ---
save_phase() {
  local phase_id="$1"
  mkdir -p "$(dirname "$PHASE_LOG")"
  echo "{\"currentPhase\": \"$phase_id\", \"updatedAt\": \"$(date -Iseconds)\"}" > "$PHASE_LOG"
}

# --- 查看状态 ---
cmd_status() {
  check_config
  echo ""
  log_info "========================================"
  log_info "  当前项目状态"
  log_info "========================================"

  # GStack 状态
  local enabled
  enabled=$(is_gstack_enabled)
  if [ "$enabled" = "true" ]; then
    log_gstack "GStack: 已启用 ✓"
  else
    log_info "GStack: 未启用（默认）"
  fi

  # 当前阶段
  if [ -f "$PHASE_LOG" ]; then
    local current
    current=$(node -e "const d=require('$PHASE_LOG'); console.log(d.currentPhase || 0);" 2>/dev/null || echo "0")
    log_info "当前阶段: Phase $current"
  else
    log_info "当前阶段: Phase 0（未开始）"
  fi

  # 各阶段状态
  node -e "
    const rage = require('$RAGE_MODE');
    const ssot = require('$SSOT');
    const thresholds = ssot.modeThresholds;
    const enabled = '$enabled' === 'true';
    rage.phases.forEach(p => {
      if (p.gstackOnly && !enabled) return;
      const agents = p.requiredAgents || [];
      const modes = agents.map(name => {
        const a = ssot.agents[name];
        if (!a) return '?';
        const s = a.modeSelection || {};
        const total = Object.values(s).reduce((a,b) => a+b, 0);
        return total >= (thresholds.team||6) ? 'Team' : total >= (thresholds.subagentParallel||3) ? 'Parallel' : 'Sequential';
      });
      const gstackTag = p.gstackOnly ? ' [GStack]' : '';
      console.log('  Phase ' + p.id + ': ' + p.name + gstackTag + ' [' + agents.join(', ') + '] → ' + modes.join(', '));
    });
    if (rage.ganPhase) {
      console.log('  GAN: ' + rage.ganPhase.name + ' [' + rage.ganPhase.requiredAgents.join(', ') + '] → Sequential');
    }
  " 2>/dev/null

  # Team 状态
  if [ -f "$TEAM_MANAGER" ]; then
    echo ""
    bash "$TEAM_MANAGER" status 2>/dev/null || true
  fi
}

# --- Codex 阶段钩子 ---
# L1 自动层: Phase 2 完成后 review, Phase 4 完成后 adversarial-review
CODEX_SCRIPT=$(find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1)

run_codex_phase_hook() {
  local phase_id="$1"

  [ "$DRY_RUN" = true ] && return

  case "$phase_id" in
    2)
      # Phase 2 完成 → Codex 代码审查
      log_info "Phase 2 完成，执行 Codex (GPT-5.4) 代码审查..."
      if [ -f "$CODEX_SCRIPT" ]; then
        mkdir -p "$PROJECT_ROOT/.claude/logs"
        node "$CODEX_SCRIPT" review --wait --scope working-tree 2>&1 | \
          tee "$PROJECT_ROOT/.claude/logs/codex-review-phase2.md" || \
          log_warn "Codex review 失败（不阻塞流程）"
      else
        log_warn "Codex 插件未安装，跳过自动审查"
      fi
      ;;
    4)
      # Phase 4 完成 → 部署前对抗审查
      log_info "Phase 4 完成，执行 Codex (GPT-5.4) 对抗审查..."
      if [ -f "$CODEX_SCRIPT" ]; then
        mkdir -p "$PROJECT_ROOT/.claude/logs"
        node "$CODEX_SCRIPT" adversarial-review --wait --scope working-tree 2>&1 | \
          tee "$PROJECT_ROOT/.claude/logs/codex-adversarial-phase4.md" || \
          log_warn "Codex adversarial review 失败（不阻塞流程）"
      else
        log_warn "Codex 插件未安装，跳过对抗审查"
      fi
      ;;
  esac
}

# --- 主流程 ---
main() {
  check_config

  case "$PHASE_TARGET" in
    status)
      cmd_status
      ;;
    all)
      local enabled
      enabled=$(is_gstack_enabled)

      if [ "$enabled" = "true" ]; then
        log_info "全流程模式（含 GStack）: Phase 0 → 0.5a → 0.5b → 1 → 2 → 3 → 4 → 5"
        # Phase 0
        run_phase "0"
        [ "$DRY_RUN" = false ] && save_phase "0"

        # Phase 0.5a (Think)
        run_gstack_phase "0.5a"
        [ "$DRY_RUN" = false ] && save_phase "0.5a"

        # Phase 0.5b (Plan + Bridge)
        run_gstack_phase "0.5b"
        [ "$DRY_RUN" = false ] && save_phase "0.5b"

        # Phase 1-5
        for phase_id in 1 2 3 4 5; do
          run_phase "$phase_id"
          if [ "$DRY_RUN" = false ]; then
            save_phase "$phase_id"
            run_codex_phase_hook "$phase_id"
            cleanup_team "$((phase_id + 1))"
          fi
        done
      else
        log_info "全流程模式: Phase 0 → 5（GStack 未启用）"
        for phase_id in 0 1 2 3 4 5; do
          run_phase "$phase_id"
          if [ "$DRY_RUN" = false ]; then
            save_phase "$phase_id"
            run_codex_phase_hook "$phase_id"
            cleanup_team "$((phase_id + 1))"
          fi
        done
      fi
      log_ok "全流程完成!"
      ;;
    0.5a|0.5b)
      # GStack 指定阶段
      run_gstack_phase "$PHASE_TARGET"
      [ "$DRY_RUN" = false ] && save_phase "$PHASE_TARGET"
      ;;
    gan)
      log_info "GAN 模式"
      bash "$PROJECT_ROOT/scripts/gan-harness.sh" "" 2>/dev/null || \
        log_warn "gan-harness.sh 需要提供产品描述参数"
      ;;
    *)
      # 指定阶段
      run_phase "$PHASE_TARGET"
      if [ "$DRY_RUN" = false ]; then
        save_phase "$PHASE_TARGET"
        run_codex_phase_hook "$PHASE_TARGET"
      fi
      ;;
  esac
}

main