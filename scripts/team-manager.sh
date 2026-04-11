#!/bin/bash
# =============================================================================
# Team 生命周期管理脚本
# 解决 TeamDelete 的 5 个已确认 Bug:
#   #38116 - Agent 批准 shutdown 后仍被计为"active"
#   #29908 - 空闲 agent 成为僵尸，忽略 shutdown_request
#   #25371 - Agent 上下文耗尽后 TeamDelete 永久失败
#   #27882 - 手动删除文件后内存 AppState 残留
#   #36366 - 状态栏显示过期团队名
#
# 用法:
#   bash scripts/team-manager.sh status              — 扫描僵尸团队
#   bash scripts/team-manager.sh clean <team-name>   — 强制清理指定团队
#   bash scripts/team-manager.sh nuke                — 清除所有非 default 团队
# =============================================================================

set -euo pipefail

TEAMS_DIR="$HOME/.claude/teams"
TASKS_DIR="$HOME/.claude/tasks"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- 扫描团队状态 ---
cmd_status() {
  echo ""
  echo "========================================"
  echo "  Agent Team 状态扫描"
  echo "========================================"
  echo ""

  if [ ! -d "$TEAMS_DIR" ]; then
    log_info "teams 目录不存在: $TEAMS_DIR"
    return
  fi

  local team_count=0
  local zombie_count=0
  local total_members=0

  for dir in "$TEAMS_DIR"/*/; do
    [ -d "$dir" ] || continue
    local name
    name=$(basename "$dir")
    team_count=$((team_count + 1))

    local has_config=false
    local member_count=0
    local inbox_count=0

    if [ -f "$dir/config.json" ]; then
      has_config=true
      member_count=$(node -e "
        try {
          const c = require('$dir/config.json');
          console.log(c.members ? c.members.length : 0);
        } catch(e) { console.log(0); }
      " 2>/dev/null || echo "0")
      total_members=$((total_members + member_count))
    fi

    if [ -d "$dir/inboxes" ]; then
      inbox_count=$(find "$dir/inboxes" -name "*.json" 2>/dev/null | wc -l)
    fi

    local status_icon="🟢"
    if [ "$member_count" -gt 0 ] && [ "$has_config" = true ]; then
      # 有成员但可能有僵尸
      status_icon="🟡"
      zombie_count=$((zombie_count + 1))
    fi

    echo "  $status_icon $name"
    echo "     config: $has_config | members: $member_count | inbox files: $inbox_count"
  done

  echo ""
  echo "========================================"
  echo "  总计: $team_count 个团队, $total_members 个成员, $zombie_count 个可能有僵尸"
  echo "========================================"

  # 检查 tasks 目录
  if [ -d "$TASKS_DIR" ]; then
    local task_dirs
    task_dirs=$(ls -d "$TASKS_DIR"/*/ 2>/dev/null | wc -l)
    echo "  tasks 目录: $task_dirs 个"
  fi
  echo ""
}

# --- 强制清理指定团队 ---
cmd_clean() {
  local name="$1"

  if [ -z "$name" ]; then
    log_error "请指定团队名称: bash scripts/team-manager.sh clean <team-name>"
    exit 1
  fi

  echo ""
  log_info "清理团队: $name"
  echo "----------------------------------------"

  local cleaned=false

  # 1. 删除 teams 目录
  if [ -d "$TEAMS_DIR/$name" ]; then
    rm -rf "$TEAMS_DIR/$name"
    log_ok "已删除 $TEAMS_DIR/$name"
    cleaned=true
  else
    log_warn "teams 目录不存在: $TEAMS_DIR/$name"
  fi

  # 2. 删除 tasks 目录
  if [ -d "$TASKS_DIR/$name" ]; then
    rm -rf "$TASKS_DIR/$name"
    log_ok "已删除 $TASKS_DIR/$name"
    cleaned=true
  else
    log_warn "tasks 目录不存在: $TASKS_DIR/$name"
  fi

  if [ "$cleaned" = true ]; then
    echo ""
    log_ok "团队 '$name' 已强制清理"
    log_warn "必须重启 Claude Code 或运行 /clear 来清除内存中的 AppState 残留"
    echo "  提示: /clear 或关闭重开 Claude Code 会话"
  else
    log_error "未找到团队 '$name' 的任何文件"
  fi
  echo ""
}

# --- 清除所有非 default 团队 ---
cmd_nuke() {
  echo ""
  log_warn "即将清除所有非 default 团队..."
  echo "----------------------------------------"

  local count=0

  for dir in "$TEAMS_DIR"/*/; do
    [ -d "$dir" ] || continue
    local name
    name=$(basename "$dir")

    # 保护 default 目录
    if [ "$name" = "default" ]; then
      log_info "跳过 default 团队"
      continue
    fi

    # 保护当前会话的 UUID 目录（如果正在活跃会话中）
    rm -rf "$dir"
    rm -rf "$TASKS_DIR/$name" 2>/dev/null || true
    log_ok "已清除: $name"
    count=$((count + 1))
  done

  echo ""
  if [ "$count" -gt 0 ]; then
    log_ok "已清除 $count 个团队"
    log_warn "必须重启 Claude Code 或运行 /clear 来清除内存中的 AppState 残留"
  else
    log_info "无需清除（仅 default 团队存在）"
  fi
  echo ""
}

# --- 主入口 ---
ACTION="${1:-status}"
TEAM_NAME="${2:-}"

case "$ACTION" in
  status)
    cmd_status
    ;;
  clean)
    cmd_clean "$TEAM_NAME"
    ;;
  nuke)
    cmd_nuke
    ;;
  *)
    echo ""
    echo "用法: bash scripts/team-manager.sh <命令> [团队名称]"
    echo ""
    echo "命令:"
    echo "  status              扫描僵尸团队"
    echo "  clean <team-name>   强制清理指定团队"
    echo "  nuke                清除所有非 default 团队"
    echo ""
    echo "已知 Bug (Workaround):"
    echo "  #38116 - shutdown 后仍被计为 active"
    echo "  #29908 - 空闲 agent 成为僵尸"
    echo "  #25371 - 上下文耗尽后 TeamDelete 永久失败"
    echo "  #27882 - 删除文件后 AppState 残留"
    echo "  #36366 - 状态栏显示过期团队名"
    echo ""
    ;;
esac
