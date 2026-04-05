#!/bin/bash
# Claude Code 模板初始化脚本
# 使用方法: ./init.sh <目标项目路径>

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 模板目录
TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 目标项目目录
TARGET_DIR="${1:-.}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}     Claude Code 项目模板初始化${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 检查目标目录
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}创建目录: $TARGET_DIR${NC}"
    mkdir -p "$TARGET_DIR"
fi

cd "$TARGET_DIR"
TARGET_DIR="$(pwd)"

echo -e "${GREEN}目标目录: $TARGET_DIR${NC}"
echo -e "${GREEN}模板目录: $TEMPLATE_DIR${NC}"
echo ""

# 创建 .claude 目录
echo -e "${BLUE}[1/6] 创建 .claude 目录结构...${NC}"
mkdir -p .claude

# 复制核心文件
echo -e "${BLUE}[2/6] 复制核心配置文件...${NC}"
cp "$TEMPLATE_DIR/CLAUDE.md" .claude/
cp "$TEMPLATE_DIR/settings.json" .claude/
cp "$TEMPLATE_DIR/.mcp.json" .
cp "$TEMPLATE_DIR/.worktreeinclude" .

# 复制规则
echo -e "${BLUE}[3/6] 复制规则文件...${NC}"
cp -r "$TEMPLATE_DIR/rules" .claude/

# 复制技能
echo -e "${BLUE}[4/6] 复制技能文件...${NC}"
cp -r "$TEMPLATE_DIR/skills" .claude/
if [ -d "$TEMPLATE_DIR/.claude/skills" ]; then
    mkdir -p .claude/.claude/skills
    cp -r "$TEMPLATE_DIR/.claude/skills/"* .claude/.claude/skills/ 2>/dev/null || true
fi

# 复制代理
echo -e "${BLUE}[5/6] 复制代理定义...${NC}"
cp -r "$TEMPLATE_DIR/agents" .claude/
cp -r "$TEMPLATE_DIR/agent-memory" .claude/ 2>/dev/null || true

# 复制命令和输出风格（可选）
echo -e "${BLUE}[6/6] 复制可选组件...${NC}"
cp -r "$TEMPLATE_DIR/commands" .claude/ 2>/dev/null || true
cp -r "$TEMPLATE_DIR/output-styles" .claude/ 2>/dev/null || true

# 创建本地配置
echo -e "${YELLOW}创建本地配置文件...${NC}"
if [ -f "$TEMPLATE_DIR/CLAUDE.local.md.example" ]; then
    cp "$TEMPLATE_DIR/CLAUDE.local.md.example" CLAUDE.local.md
    echo -e "${GREEN}  ✓ 创建 CLAUDE.local.md${NC}"
fi

if [ -f "$TEMPLATE_DIR/settings.local.json.example" ]; then
    cp "$TEMPLATE_DIR/settings.local.json.example" .claude/settings.local.json
    echo -e "${GREEN}  ✓ 创建 .claude/settings.local.json${NC}"
fi

# 更新 .gitignore
echo -e "${YELLOW}更新 .gitignore...${NC}"
if [ -f .gitignore ]; then
    if ! grep -q "CLAUDE.local.md" .gitignore; then
        echo "" >> .gitignore
        echo "# Claude Code 本地配置" >> .gitignore
        echo "CLAUDE.local.md" >> .gitignore
        echo ".claude/settings.local.json" >> .gitignore
        echo -e "${GREEN}  ✓ 已添加 gitignore 规则${NC}"
    fi
else
    echo "# Claude Code 本地配置" > .gitignore
    echo "CLAUDE.local.md" >> .gitignore
    echo ".claude/settings.local.json" >> .gitignore
    echo -e "${GREEN}  ✓ 创建 .gitignore${NC}"
fi

# 显示结果
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}     初始化完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}已创建的文件:${NC}"
echo -e "  .claude/CLAUDE.md"
echo -e "  .claude/settings.json"
echo -e "  .claude/rules/"
echo -e "  .claude/skills/"
echo -e "  .claude/agents/"
echo -e "  .mcp.json"
echo -e "  CLAUDE.local.md ${YELLOW}(gitignored)${NC}"
echo -e "  .claude/settings.local.json ${YELLOW}(gitignored)${NC}"
echo ""
echo -e "${BLUE}下一步:${NC}"
echo -e "  1. 编辑 CLAUDE.local.md 设置个人偏好"
echo -e "  2. 编辑 .mcp.json 配置 MCP 服务器"
echo -e "  3. 运行 ${GREEN}/doctor${NC} 验证配置"
echo ""
