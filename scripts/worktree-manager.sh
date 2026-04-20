#!/bin/bash
# =============================================================================
# Git Worktree 生命周期管理脚本
# 用法:
#   bash scripts/worktree-manager.sh create <branch-name>    - 创建新 worktree + 分支
#   bash scripts/worktree-manager.sh list                     - 列出所有 worktree
#   bash scripts/worktree-manager.sh merge <branch-name>      - 合并 worktree 到 main
#   bash scripts/worktree-manager.sh remove <branch-name>     - 删除 worktree + 分支
#   bash scripts/worktree-manager.sh status                   - 显示 worktree 状态概览
# =============================================================================

set -euo pipefail

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_INCLUDE="$PROJECT_ROOT/.worktreeinclude"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${BLUE}==>${NC} $1"; }

# --- 检查是否在 Git 仓库中 ---
check_git_repo() {
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "当前目录不是 Git 仓库"
    exit 1
  fi
}

# --- 复制 .worktreeinclude 中列出的文件 ---
copy_included_files() {
  local target_dir="$1"

  if [ ! -f "$WORKTREE_INCLUDE" ]; then
    log_info ".worktreeinclude 不存在，跳过文件复制"
    return
  fi

  log_step "复制 .worktreeinclude 文件到新 worktree..."

  local copied=0
  local skipped=0

  while IFS= read -r line; do
    # 跳过注释和空行
    [[ "$line" =~ ^# ]] && continue
    [[ -z "$line" ]] && continue

    local src_path="$PROJECT_ROOT/$line"
    local dst_path="$target_dir/$line"

    if [ -e "$src_path" ]; then
      # 创建目标目录
      local dst_dir
      dst_dir=$(dirname "$dst_path")
      mkdir -p "$dst_dir"

      # 复制文件/目录
      if cp -r "$src_path" "$dst_path" 2>/dev/null; then
        copied=$((copied + 1))
        log_info "  ✓ $line"
      else
        log_warn "  ✗ $line (复制失败)"
        skipped=$((skipped + 1))
      fi
    else
      skipped=$((skipped + 1))
    fi
  done < "$WORKTREE_INCLUDE"

  log_ok "复制完成: $copied 个文件, $skipped 个跳过"
}

# --- 创建 worktree ---
cmd_create() {
  local branch_name="$1"

  if [ -z "$branch_name" ]; then
    log_error "请指定分支名称: bash scripts/worktree-manager.sh create <branch-name>"
    exit 1
  fi

  check_git_repo

  # 检查分支是否已存在
  local branch_exists
  branch_exists=$(git branch --list "$branch_name")
  if [ -n "$branch_exists" ]; then
    log_warn "分支 '$branch_name' 已存在"
  fi

  # 检查 worktree 是否已存在
  local worktree_path="$PROJECT_ROOT/../worktree-$(basename "$PROJECT_ROOT")-$branch_name"
  if [ -d "$worktree_path" ]; then
    log_error "Worktree 目录已存在: $worktree_path"
    exit 1
  fi

  log_step "创建 worktree: $branch_name"
  echo "----------------------------------------"
  log_info "目标路径: $worktree_path"
  log_info "分支: $branch_name"

  # 创建 worktree
  if git worktree add "$worktree_path" -b "$branch_name" 2>/dev/null; then
    log_ok "Worktree 创建成功"
  else
    log_error "Worktree 创建失败"
    exit 1
  fi

  # 复制 .worktreeinclude 文件
  copy_included_files "$worktree_path"

  echo ""
  log_ok "Worktree '$branch_name' 已准备就绪"
  echo ""
  echo "接下来:"
  echo "  1. cd \"$worktree_path\""
  echo "  2. code .                    (启动 VS Code)"
  echo "  3. claude-code               (启动 Claude Code)"
  echo ""
}

# --- 列出所有 worktree ---
cmd_list() {
  check_git_repo

  echo ""
  echo "========================================"
  echo "  Git Worktree 列表"
  echo "========================================"
  echo ""

  git worktree list

  echo ""
  echo "========================================"
  echo "  分支状态"
  echo "========================================"
  echo ""

  git worktree list --porcelain | grep -E "^branch|^detached|^HEAD" | while read -r line; do
    echo "$line"
  done
  echo ""
}

# --- 合并 worktree 到 main ---
cmd_merge() {
  local branch_name="$1"

  if [ -z "$branch_name" ]; then
    log_error "请指定分支名称: bash scripts/worktree-manager.sh merge <branch-name>"
    exit 1
  fi

  check_git_repo

  # 检查分支是否存在
  local branch_exists
  branch_exists=$(git branch --list "$branch_name")
  if [ -z "$branch_exists" ]; then
    log_error "分支 '$branch_name' 不存在"
    exit 1
  fi

  # 获取 main 分支名称
  local main_branch
  main_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@refs/remotes/origin/@@')
  if [ -z "$main_branch" ]; then
    main_branch="main"
  fi

  log_step "合并 $branch_name -> $main_branch"
  echo "----------------------------------------"

  # 切换到 main 分支
  log_info "切换到 $main_branch 分支..."
  git checkout "$main_branch" 2>/dev/null || git checkout -b "$main_branch" "origin/$main_branch"

  # 拉取最新代码
  log_info "拉取最新代码..."
  git pull origin "$main_branch"

  # 合并分支
  log_info "合并 $branch_name..."
  if git merge "$branch_name" --no-ff -m "Merge $branch_name into $main_branch"; then
    log_ok "合并成功"
  else
    log_error "合并失败，请解决冲突"
    exit 1
  fi

  # 推送
  log_info "推送到远程..."
  git push origin "$main_branch"

  log_ok "合并完成"
  echo ""
  log_info "现在可以删除 worktree: bash scripts/worktree-manager.sh remove $branch_name"
  echo ""
}

# --- 删除 worktree ---
cmd_remove() {
  local branch_name="$1"

  if [ -z "$branch_name" ]; then
    log_error "请指定分支名称: bash scripts/worktree-manager.sh remove <branch-name>"
    exit 1
  fi

  check_git_repo

  # 查找 worktree
  local worktree_path
  worktree_path=$(git worktree list --porcelain | grep -B1 "branch refs/heads/$branch_name" | grep "worktree" | cut -d' ' -f2)

  if [ -z "$worktree_path" ]; then
    log_error "未找到分支 '$branch_name' 的 worktree"
    exit 1
  fi

  log_step "删除 worktree: $branch_name"
  echo "----------------------------------------"
  log_info "路径: $worktree_path"

  # 检查是否有未提交的改动
  local status
  status=$(cd "$worktree_path" && git status --porcelain 2>/dev/null || echo "")

  if [ -n "$status" ]; then
    log_warn "Worktree 中有未提交的改动:"
    cd "$worktree_path" && git status --short
    echo ""
    read -p "确定要删除吗? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "取消删除"
      exit 0
    fi
  fi

  # 删除 worktree
  git worktree remove "$worktree_path" 2>/dev/null || {
    log_warn "git worktree remove 失败，尝试手动删除..."
    rm -rf "$worktree_path"
  }

  log_ok "Worktree 已删除: $worktree_path"

  # 询问是否删除分支
  echo ""
  read -p "删除分支 '$branch_name'? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -d "$branch_name" 2>/dev/null || git branch -D "$branch_name"
    log_ok "分支已删除: $branch_name"
  fi
  echo ""
}

# --- 显示状态概览 ---
cmd_status() {
  check_git_repo

  echo ""
  echo "========================================"
  echo "  Worktree 状态概览"
  echo "========================================"
  echo ""

  local count=0
  local main_branch
  main_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@refs/remotes/origin/@@' || echo "main")

  while IFS= read -r line; do
    count=$((count + 1))

    local path
    path=$(echo "$line" | awk '{print $1}')

    local branch="detached"
    local commit
    local dirty=""

    # 提取分支和状态
    local is_main=false
    if echo "$line" | grep -q "\[$main_branch"; then
      branch="$main_branch"
      is_main=true
    elif echo "$line" | grep -q "\[([a-zA-Z0-9/_-]+)\]"; then
      branch=$(echo "$line" | grep -oP "\[\K[^\]]+")
    fi

    commit=$(echo "$line" | grep -oP "\[.*\]\s+\K[a-f0-9]{7}")

    if echo "$line" | grep -q "dirty"; then
      dirty=" ${YELLOW}✗${NC}"
    fi

    local status_icon="🌲"
    if [ "$is_main" = true ]; then
      status_icon="🏠"
    fi

    echo "  $status_icon ${GREEN}$branch${NC}${dirty}"
    echo "     路径: $path"
    echo "     提交: $commit"
    echo ""

  done < <(git worktree list)

  echo "========================================"
  echo "  总计: $count 个 worktree"
  echo "========================================"
  echo ""

  # 显示提示
  echo "常用命令:"
  echo "  bash scripts/worktree-manager.sh create <branch>   - 创建新 worktree"
  echo "  bash scripts/worktree-manager.sh merge <branch>    - 合并到 main"
  echo "  bash scripts/worktree-manager.sh remove <branch>   - 删除 worktree"
  echo ""
}

# --- 主入口 ---
ACTION="${1:-}"
BRANCH_NAME="${2:-}"

case "$ACTION" in
  create)
    cmd_create "$BRANCH_NAME"
    ;;
  list)
    cmd_list
    ;;
  merge)
    cmd_merge "$BRANCH_NAME"
    ;;
  remove)
    cmd_remove "$BRANCH_NAME"
    ;;
  status)
    cmd_status
    ;;
  *)
    echo ""
    echo "用法: bash scripts/worktree-manager.sh <命令> [分支名称]"
    echo ""
    echo "命令:"
    echo "  create <branch>    创建新 worktree + 分支"
    echo "  list               列出所有 worktree"
    echo "  merge <branch>     合并 worktree 到 main"
    echo "  remove <branch>    删除 worktree + 分支"
    echo "  status             显示 worktree 状态概览"
    echo ""
    ;;
esac
