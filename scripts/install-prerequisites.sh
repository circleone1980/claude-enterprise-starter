#!/bin/bash
# install-prerequisites.sh — claude-enterprise-starter v5.0 前置依赖一键安装
# 用法: bash scripts/install-prerequisites.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

echo "============================================"
echo " claude-enterprise-starter v5.0 前置安装"
echo "============================================"
echo ""

# ---- Step 1: 添加插件市场 ----
echo "=== 1/5 添加插件市场 ==="

add_marketplace() {
  local name="$1"
  local repo="$2"
  if claude plugin marketplace list 2>/dev/null | grep -q "$name"; then
    ok "$name 市场已存在"
  else
    echo "  添加 $name ($repo)..."
    claude plugin marketplace add "$repo" 2>/dev/null && ok "$name 市场添加成功" || warn "$name 市场添加失败（可能已存在）"
  fi
}

add_marketplace "ecc" "affaan-m/everything-claude-code"
add_marketplace "compound-engineering-plugin" "EveryInc/compound-engineering-plugin"
add_marketplace "ui-ux-pro-max-skill" "nextlevelbuilder/ui-ux-pro-max-skill"

echo ""

# ---- Step 2: 安装核心插件 ----
echo "=== 2/5 安装核心插件 ==="

install_plugin() {
  local name="$1"
  local marketplace="$2"
  local key="${name}@${marketplace}"
  if claude plugin list 2>/dev/null | grep -q "$name"; then
    ok "$name 已安装"
  else
    echo "  安装 $name..."
    claude plugin install "$name" 2>/dev/null && ok "$name 安装成功" || fail "$name 安装失败"
  fi
}

install_plugin "superpowers" "claude-plugins-official"
install_plugin "ecc" "ecc"
install_plugin "compound-engineering" "compound-engineering-plugin"
install_plugin "ui-ux-pro-max" "ui-ux-pro-max-skill"
install_plugin "context7" "claude-plugins-official"
install_plugin "playwright" "claude-plugins-official"
install_plugin "codex" "openai-codex"

echo ""

# ---- Step 3: 部署 GStack ----
echo "=== 3/5 部署 GStack 到本地 ==="

# 前置检查: Bun（GStack setup 依赖）
if command -v bun &>/dev/null; then
  ok "Bun 已安装"
else
  warn "Bun 未安装 — GStack setup 需要 Bun"
  echo "  安装 Bun: curl -fsSL https://bun.sh/install | bash"
  echo "  跳过 GStack 部署（安装 Bun 后重新运行）"
  GSTACK_DIR=""
fi

GSTACK_DIR="$HOME/.claude/skills/gstack"
if [ -n "$GSTACK_DIR" ]; then
  if [ -d "$GSTACK_DIR" ]; then
    ok "GStack 已部署 ($GSTACK_DIR)"
    echo "  更新中..."
    cd "$GSTACK_DIR" && git pull 2>/dev/null && ok "GStack 已更新" || warn "GStack 更新失败"
  else
    echo "  克隆 GStack..."
    git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR"
    cd "$GSTACK_DIR" && chmod +x ./setup && ./setup
    ok "GStack 部署完成"
  fi
fi

echo ""

# ---- Step 4: 启用插件 ----
echo "=== 4/5 启用插件 ==="

enable_plugin() {
  local name="$1"
  claude plugin enable "$name" 2>/dev/null && ok "$name 已启用" || warn "$name 启用失败"
}

enable_plugin "superpowers"
enable_plugin "ecc"
enable_plugin "compound-engineering"
enable_plugin "ui-ux-pro-max"
enable_plugin "codex"

echo ""

# ---- Step 5: 验证安装 ----
echo "=== 5/5 验证安装 ==="

echo ""
echo "--- 插件列表 ---"
claude plugin list 2>/dev/null || echo "  (无法获取插件列表)"

echo ""
echo "--- GStack ---"
[ -f "$GSTACK_DIR/SKILL.md" ] && ok "GStack SKILL.md 存在" || fail "GStack SKILL.md 缺失"

echo ""
echo "--- Codex 插件 ---"
claude plugin list 2>/dev/null | grep -i codex && ok "Codex 插件已安装" || warn "Codex 插件未安装（双模型审查不可用）"

echo ""
echo "--- CE 插件技能 ---"
for skill in ce-brainstorm ce-plan ce-work ce-review ce-compound; do
  echo "  $skill: 由 compound-engineering 插件提供"
done

echo ""
echo "============================================"
echo " 安装完成!"
echo "============================================"
echo ""
echo "后续步骤:"
echo "  1. 重启 Claude Code 会话"
echo "  2. 运行 npm run check-all 验证配置"
echo ""
echo "更新命令:"
echo "  claude plugin update superpowers"
echo "  claude plugin update ecc"
echo "  claude plugin update compound-engineering"
echo "  claude plugin update ui-ux-pro-max"
echo "  claude plugin update codex"
echo "  cd ~/.claude/skills/gstack && git pull && ./setup"
echo ""
