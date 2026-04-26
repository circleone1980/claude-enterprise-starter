#!/bin/bash
# =============================================================================
# gan-harness.sh — GAN 迭代循环（Planner → Generator → Evaluator）
#
# 用法:
#   bash scripts/gan-harness.sh "产品描述"
#   bash scripts/gan-harness.sh "一个支持多语言的文章发布平台" --iterations 5
#   bash scripts/gan-harness.sh "..." --threshold 8.0
#
# 流程:
#   1. GAN-Planner: 产品描述 → 完整 spec
#   2. GAN-Generator: spec → 代码实现
#   3. GAN-Evaluator: 代码 → 质量评分 (0-10)
#   4. 如果评分 < threshold → 返回 Step 2（保留 spec，重新生成）
#   5. 如果评分 >= threshold → 输出最终代码
#
# 注意: 此脚本需要 `claude` CLI 在 PATH 中
#
# Updated: 2026-04-11
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SSOT="$PROJECT_ROOT/automation/agent-orchestration.json"

# 默认参数
PRODUCT_DESC="${1:-}"
MAX_ITERATIONS=3
THRESHOLD=7.0
OUTPUT_DIR="$PROJECT_ROOT/output"

# 解析参数
shift 2>/dev/null || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --iterations=*) MAX_ITERATIONS="${1#*=}" ;;
    --threshold=*)  THRESHOLD="${1#*=}" ;;
    --output=*)     OUTPUT_DIR="${1#*=}" ;;
    *) ;;
  esac
  shift
done

# 从 SSOT 读取 GAN 配置
if [ -f "$SSOT" ]; then
  GAN_CONFIG=$(node -e "
    const ssot = require('$SSOT');
    const gc = ssot.ganConfig || {};
    console.log(JSON.stringify({
      threshold: gc.threshold || $THRESHOLD,
      maxIterations: gc.maxIterations || $MAX_ITERATIONS,
      outputDir: gc.outputDir || 'output'
    }));
  " 2>/dev/null)
  THRESHOLD=$(echo "$GAN_CONFIG" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0,'utf-8')).threshold)")
  MAX_ITERATIONS=$(echo "$GAN_CONFIG" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0,'utf-8')).maxIterations)")
  OUTPUT_DIR="$PROJECT_ROOT/$(echo "$GAN_CONFIG" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0,'utf-8')).outputDir)")"
fi

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[gan-harness]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[gan-harness]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[gan-harness]${NC} $1"; }
log_error() { echo -e "${RED}[gan-harness]${NC} $1"; }

# --- 检查依赖 ---
check_deps() {
  if ! command -v claude &>/dev/null; then
    log_error "claude CLI 不在 PATH 中。请先安装 Claude Code。"
    exit 1
  fi

  if [ -z "$PRODUCT_DESC" ]; then
    log_error "请提供产品描述: bash scripts/gan-harness.sh \"产品描述\""
    exit 1
  fi
}

# --- GAN 阶段 ---
run_planner() {
  log_info "Phase 1/3: GAN-Planner — 生成产品 Spec"
  mkdir -p "$OUTPUT_DIR"

  local spec_file="$OUTPUT_DIR/spec.md"

  claude -p "你是 GAN-Planner。基于以下产品描述生成完整的产品规格说明：

$PRODUCT_DESC

要求:
1. 功能树结构（Module → Submodule → Feature → Capability → API）
2. 每个功能的验收标准
3. 技术约束（参考项目 CLAUDE.md）
4. 输出为 Markdown 格式

将结果写入: $spec_file" 2>/dev/null || {
    log_error "GAN-Planner 执行失败"
    return 1
  }

  if [ -f "$spec_file" ]; then
    log_ok "Spec 已生成: $spec_file"
    return 0
  else
    log_error "Spec 文件未生成"
    return 1
  fi
}

run_generator() {
  local iteration="$1"
  log_info "Phase 2/3: GAN-Generator (迭代 $iteration/$MAX_ITERATIONS) — 生成代码"

  local spec_file="$OUTPUT_DIR/spec.md"
  local code_dir="$OUTPUT_DIR/iteration-$iteration"

  if [ ! -f "$spec_file" ]; then
    log_error "Spec 文件不存在: $spec_file"
    return 1
  fi

  local spec_content
  spec_content=$(cat "$spec_file")

  claude -p "你是 GAN-Generator。基于以下 Spec 生成代码实现：

$spec_content

要求:
1. 遵循 TDD 流程（Red → Green → Refactor）
2. 测试覆盖率 > 80%
3. 遵循项目技术栈（CLAUDE.md 中定义的）
4. 代码输出到: $code_dir/

$( [ -f "$OUTPUT_DIR/evaluation.md" ] && echo "上一轮评估反馈：" && cat "$OUTPUT_DIR/evaluation.md" || echo "这是第一次迭代，无历史反馈" )" 2>/dev/null || {
    log_error "GAN-Generator 执行失败 (迭代 $iteration)"
    return 1
  }

  log_ok "代码已生成: $code_dir"
  return 0
}

run_evaluator() {
  local iteration="$1"
  log_info "Phase 3/3: GAN-Evaluator (迭代 $iteration/$MAX_ITERATIONS) — 评估质量"

  local code_dir="$OUTPUT_DIR/iteration-$iteration"
  local eval_file="$OUTPUT_DIR/evaluation.md"

  if [ ! -d "$code_dir" ]; then
    log_error "代码目录不存在: $code_dir"
    return 1
  fi

  local score
  score=$(claude -p "你是 GAN-Evaluator。评估以下代码质量（0-10 分）：

代码位置: $code_dir

评估维度:
1. 功能完整性 (0-2.5)
2. 代码质量 (0-2.5)
3. 测试覆盖率 (0-2.5)
4. 架构合理性 (0-2.5)

输出格式（第一行必须是分数）:
SCORE: X.X/10

然后是详细评估报告。

将评估报告写入: $eval_file" 2>/dev/null | grep -oP 'SCORE:\s*\K[\d.]+' || echo "0")

  log_info "评分: $score / 10"

  echo "$score" > "$OUTPUT_DIR/score.txt"
  return 0
}

# --- CE 多维评审 ---
run_gan_ce_review() {
  local iteration="$1"

  # 从 SSOT 读取 multiReview 配置
  local multi_review_enabled
  multi_review_enabled=$(node -e "
    const ssot = require('$SSOT');
    console.log(ssot.ganConfig && ssot.ganConfig.multiReview && ssot.ganConfig.multiReview.enabled ? 'true' : 'false');
  " 2>/dev/null || echo "false")

  if [ "$multi_review_enabled" != "true" ]; then
    return
  fi

  log_info "执行 CE 多维评审 (迭代 $iteration)..."

  local eval_file="$OUTPUT_DIR/evaluation.md"

  # 追加 CE 评审标记到 evaluation.md
  {
    echo ""
    echo "## CE Multi-Dimensional Review (Iteration $iteration)"
    echo ""
    echo "> 此评审由 CE 插件自动触发，提供 6+ 维度独立审查。"
    echo "> 触发命令: \`/ce-review --scope gan-iteration-${iteration}\`"
    echo ""
  } >> "$eval_file"

  log_ok "CE 评审标记已追加到 $eval_file"
}

# --- 主循环 ---
main() {
  check_deps

  echo ""
  log_info "========================================"
  log_info "  GAN Harness 启动"
  log_info "========================================"
  log_info "产品描述: $PRODUCT_DESC"
  log_info "评分阈值: $THRESHOLD"
  log_info "最大迭代: $MAX_ITERATIONS"
  log_info "输出目录: $OUTPUT_DIR"
  echo ""

  # Phase 1: Planner（只执行一次）
  run_planner || exit 1

  # Phase 2+3: Generator → Evaluator 循环
  local iteration=1
  local score=0

  while [ "$iteration" -le "$MAX_ITERATIONS" ]; do
    echo ""
    log_info "--- 迭代 $iteration / $MAX_ITERATIONS ---"

    run_generator "$iteration" || {
      log_error "生成失败，跳到下一迭代"
      iteration=$((iteration + 1))
      continue
    }

    run_evaluator "$iteration" || {
      log_error "评估失败"
      iteration=$((iteration + 1))
      continue
    }

    score=$(cat "$OUTPUT_DIR/score.txt" 2>/dev/null || echo "0")

    # CE 多维评审（如果启用）
    run_gan_ce_review "$iteration"

    log_info "迭代 $iteration 评分: $score / 10（阈值: $THRESHOLD）"

    # 比较分数（浮点数）
    if node -e "process.exit($score >= $THRESHOLD ? 0 : 1)" 2>/dev/null; then
      log_ok "评分达标! ($score >= $THRESHOLD)"
      log_ok "最终代码: $OUTPUT_DIR/iteration-$iteration"
      log_ok "评估报告: $OUTPUT_DIR/evaluation.md"
      exit 0
    else
      log_warn "评分未达标 ($score < $THRESHOLD)，继续迭代..."
    fi

    iteration=$((iteration + 1))
  done

  log_warn "达到最大迭代次数 ($MAX_ITERATIONS)，最终评分: $score"
  log_info "最佳代码: $OUTPUT_DIR/iteration-$((iteration - 1))"
}

main
