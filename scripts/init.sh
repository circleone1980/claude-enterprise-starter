#!/bin/bash
# Claude Code 模板初始化脚本
# 使用方法:
#   ./init.sh                                    # 传统模式：复制到当前目录
#   ./init.sh /path/to/project                   # 传统模式：复制到指定目录
#   ./init.sh --workspace [dir] --type [type]    # workspace 模式
#   ./init.sh --gstack                           # 启用 GStack 产品设计层

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 模板目录
TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 解析参数
TARGET_DIR="."
WORKSPACE_MODE=false
WORKSPACE_DIR="workspace"
PROJECT_TYPE="node"
GSTACK_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --workspace)
      WORKSPACE_MODE=true
      shift
      if [[ $# -gt 0 && ! "$1" =~ ^-- ]]; then
        WORKSPACE_DIR="$1"
        shift
      fi
      ;;
    --type)
      shift
      PROJECT_TYPE="$1"
      shift
      ;;
    --gstack)
      GSTACK_MODE=true
      shift
      ;;
    --flat)
      WORKSPACE_MODE=false
      shift
      ;;
    -h|--help)
      echo "用法: ./init.sh [选项] [目标目录]"
      echo ""
      echo "选项:"
      echo "  --workspace [dir]  启用 workspace 模式 (默认目录: workspace)"
      echo "  --type <type>      项目类型: node|java|python (默认: node)"
      echo "  --gstack           启用 GStack 产品设计层 (Phase 0.5)"
      echo "  --flat             传统模式（直接复制到目标目录）"
      echo "  -h, --help         显示帮助"
      echo ""
      echo "示例:"
      echo "  ./init.sh                                    # 传统模式"
      echo "  ./init.sh --workspace --type java            # workspace 模式"
      echo "  ./init.sh --workspace --gstack               # workspace + GStack"
      echo "  ./init.sh /path/to/project --flat            # 传统模式到指定目录"
      exit 0
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

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
if [ "$WORKSPACE_MODE" = true ]; then
    echo -e "${GREEN}模式: workspace (${WORKSPACE_DIR}/)${NC}"
    echo -e "${GREEN}项目类型: $PROJECT_TYPE${NC}"
else
    echo -e "${GREEN}模式: 传统（flat）${NC}"
fi
if [ "$GSTACK_MODE" = true ]; then
    echo -e "${MAGENTA}GStack 产品设计层: 已启用${NC}"
fi
echo ""

# ─── 核心复制步骤（共用于两种模式）───────────────

# 创建 .claude 目录
echo -e "${BLUE}[1/8] 创建 .claude 目录结构...${NC}"
mkdir -p .claude

# 复制核心文件
echo -e "${BLUE}[2/8] 复制核心配置文件...${NC}"
cp "$TEMPLATE_DIR/CLAUDE.md" .claude/
cp "$TEMPLATE_DIR/settings.json" .claude/
cp "$TEMPLATE_DIR/.mcp.json" .
cp "$TEMPLATE_DIR/.worktreeinclude" .

# 复制规则
echo -e "${BLUE}[3/8] 复制规则文件...${NC}"
cp -r "$TEMPLATE_DIR/rules" .claude/

# 复制技能
echo -e "${BLUE}[4/8] 复制技能文件...${NC}"
cp -r "$TEMPLATE_DIR/skills" .claude/
if [ -d "$TEMPLATE_DIR/.claude/skills" ]; then
    mkdir -p .claude/.claude/skills
    cp -r "$TEMPLATE_DIR/.claude/skills/"* .claude/.claude/skills/ 2>/dev/null || true
fi

# 复制代理
echo -e "${BLUE}[5/8] 复制代理定义...${NC}"
cp -r "$TEMPLATE_DIR/agents" .claude/
cp -r "$TEMPLATE_DIR/agent-memory" .claude/ 2>/dev/null || true

# 复制团队配置
echo -e "${BLUE}[5b/8] 复制团队配置...${NC}"
cp -r "$TEMPLATE_DIR/teams" .claude/ 2>/dev/null || true

# 复制命令和输出风格
echo -e "${BLUE}[6/8] 复制可选组件...${NC}"
cp -r "$TEMPLATE_DIR/commands" .claude/ 2>/dev/null || true
cp -r "$TEMPLATE_DIR/output-styles" .claude/ 2>/dev/null || true

# 复制自动化配置（hooks、automation、scripts、templates）
echo -e "${BLUE}[6b/8] 复制自动化配置...${NC}"
cp -r "$TEMPLATE_DIR/hooks" .claude/ 2>/dev/null || true
cp -r "$TEMPLATE_DIR/automation" .claude/ 2>/dev/null || true
cp -r "$TEMPLATE_DIR/scripts" .claude/ 2>/dev/null || true
cp -r "$TEMPLATE_DIR/templates" .claude/ 2>/dev/null || true

# ─── 文档目录创建 ─────────────────────────────────

echo -e "${BLUE}[7/8] 创建文档目录结构...${NC}"
if [ "$WORKSPACE_MODE" = true ]; then
    # Workspace 模式：文档放在 workspace/docs/
    DOCS_BASE="$WORKSPACE_DIR/docs"
    mkdir -p "$WORKSPACE_DIR/src"
    mkdir -p "$DOCS_BASE"/{requirements,design,superpowers/{specs,decisions},dev,test,fixes,sql}

    if [ -d "$TEMPLATE_DIR/docs/templates" ]; then
        cp -r "$TEMPLATE_DIR/docs/templates/requirements/"* "$DOCS_BASE/requirements/" 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/design/"* "$DOCS_BASE/design/" 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/superpowers/"* "$DOCS_BASE/superpowers/" 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/dev/"* "$DOCS_BASE/dev/" 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/test/"* "$DOCS_BASE/test/" 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/fixes/"* "$DOCS_BASE/fixes/" 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/sql/"* "$DOCS_BASE/sql/" 2>/dev/null || true
        echo -e "${GREEN}  ✓ workspace/docs/ 已创建${NC}"
    fi

    # GStack 设计目录
    if [ "$GSTACK_MODE" = true ]; then
        mkdir -p "$DOCS_BASE/design/prototype"
        echo -e "${MAGENTA}  ✓ workspace/docs/design/prototype/ 已创建（GStack 原型输出目录）${NC}"
    fi

    # 生成 workspace.json
    mkdir -p automation
    cat > automation/workspace.json << WSEOF
{
  "version": "1.0.0",
  "workspaceDir": "$WORKSPACE_DIR",
  "docsDir": "docs",
  "srcDir": "src",
  "_comment": "工作区路径配置。workspaceDir='.' 时回退到传统模式"
}
WSEOF
    echo -e "${GREEN}  ✓ automation/workspace.json 已创建${NC}"

    # 生成 workspace/.gitignore
    cat > "$WORKSPACE_DIR/.gitignore" << GIEOF
# 依赖
node_modules/
__pycache__/
*.pyc

# 构建输出
dist/
build/
out/
target/

# 环境变量
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/

# 测试覆盖率
coverage/

# 日志
*.log
GIEOF

    # 生成项目配置文件
    case "$PROJECT_TYPE" in
      node)
        if [ ! -f "$WORKSPACE_DIR/package.json" ]; then
          cat > "$WORKSPACE_DIR/package.json" << PKGEOF
{
  "name": "my-project",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
PKGEOF
          echo -e "${GREEN}  ✓ workspace/package.json 已创建${NC}"
        fi
        ;;
      java)
        if [ ! -f "$WORKSPACE_DIR/pom.xml" ]; then
          mkdir -p "$WORKSPACE_DIR/src/main/java" "$WORKSPACE_DIR/src/test/java"
          echo -e "${GREEN}  ✓ workspace/src/main/java + src/test/java 已创建${NC}"
        fi
        ;;
      python)
        if [ ! -f "$WORKSPACE_DIR/pyproject.toml" ]; then
          cat > "$WORKSPACE_DIR/pyproject.toml" << PYEOF
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.12"

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.ruff]
line-length = 120
PYEOF
          mkdir -p "$WORKSPACE_DIR/tests"
          echo -e "${GREEN}  ✓ workspace/pyproject.toml 已创建${NC}"
        fi
        ;;
    esac

    # 生成 workspace/README.md（项目文档模板）
    if [ ! -f "$WORKSPACE_DIR/README.md" ]; then
      if [ -f "$TEMPLATE_DIR/docs/templates/workspace-readme.md" ]; then
        cp "$TEMPLATE_DIR/docs/templates/workspace-readme.md" "$WORKSPACE_DIR/README.md"
        echo -e "${GREEN}  ✓ workspace/README.md 已创建（含项目文档模板）${NC}"
      fi
    fi
else
    # 传统模式：文档放在项目根目录
    if [ -d "$TEMPLATE_DIR/docs/templates" ]; then
        mkdir -p docs/{requirements,design,superpowers/{specs,decisions},dev,test,fixes,sql}
        cp -r "$TEMPLATE_DIR/docs/templates/requirements/"* docs/requirements/ 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/design/"* docs/design/ 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/superpowers/"* docs/superpowers/ 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/dev/"* docs/dev/ 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/test/"* docs/test/ 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/fixes/"* docs/fixes/ 2>/dev/null || true
        cp -r "$TEMPLATE_DIR/docs/templates/sql/"* docs/sql/ 2>/dev/null || true
        echo -e "${GREEN}  ✓ docs/ 已创建${NC}"
    else
        echo -e "${YELLOW}  ⚠ 跳过文档目录创建（模板文件不存在）${NC}"
    fi

    # GStack 设计目录（传统模式）
    if [ "$GSTACK_MODE" = true ]; then
        mkdir -p docs/design/prototype
        echo -e "${MAGENTA}  ✓ docs/design/prototype/ 已创建（GStack 原型输出目录）${NC}"
    fi
fi

# ─── 本地配置和 .gitignore ────────────────────────

echo -e "${BLUE}[8/8] 创建本地配置和 .gitignore...${NC}"

if [ -f "$TEMPLATE_DIR/CLAUDE.local.md.example" ]; then
    cp "$TEMPLATE_DIR/CLAUDE.local.md.example" CLAUDE.local.md
    echo -e "${GREEN}  ✓ 创建 CLAUDE.local.md${NC}"
fi

if [ -f "$TEMPLATE_DIR/settings.local.json.example" ]; then
    cp "$TEMPLATE_DIR/settings.local.json.example" .claude/settings.local.json
    echo -e "${GREEN}  ✓ 创建 .claude/settings.local.json${NC}"
fi

# GStack 启用时自动开启
if [ "$GSTACK_MODE" = true ]; then
    echo -e "${MAGENTA}  启用 GStack 产品设计层...${NC}"
    if [ -f "$TEMPLATE_DIR/scripts/gstack-toggle.js" ]; then
        node "$TEMPLATE_DIR/scripts/gstack-toggle.js" --enable 2>/dev/null && \
            echo -e "${MAGENTA}  ✓ GStack 已启用（gstackConfig.enabled: true）${NC}" || \
            echo -e "${YELLOW}  ⚠ GStack 启用失败，请手动运行: node scripts/gstack-toggle.js --enable${NC}"
    fi
fi

# 更新 .gitignore
if [ -f .gitignore ]; then
    if ! grep -q "CLAUDE.local.md" .gitignore; then
        echo "" >> .gitignore
        echo "# Claude Code 本地配置" >> .gitignore
        echo "CLAUDE.local.md" >> .gitignore
        echo ".claude/settings.local.json" >> .gitignore
        echo "settings.local.json" >> .gitignore
        echo -e "${GREEN}  ✓ 已添加 gitignore 规则${NC}"
    fi
else
    echo "# Claude Code 本地配置" > .gitignore
    echo "CLAUDE.local.md" >> .gitignore
    echo ".claude/settings.local.json" >> .gitignore
    echo -e "${GREEN}  ✓ 创建 .gitignore${NC}"
fi

# ─── 完成 ─────────────────────────────────────────

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

if [ "$WORKSPACE_MODE" = true ]; then
    echo ""
    echo -e "${BLUE}workspace 模式:${NC}"
    echo -e "  ${WORKSPACE_DIR}/src/  ${YELLOW}← 实际开发代码${NC}"
    echo -e "  ${WORKSPACE_DIR}/docs/ ${YELLOW}← 项目文档${NC}"
    echo -e "  automation/workspace.json ${YELLOW}← 工作区配置${NC}"
fi

if [ "$GSTACK_MODE" = true ]; then
    echo ""
    echo -e "${MAGENTA}GStack 模式:${NC}"
    echo -e "  Phase 0.5 已启用: Think → Plan → Bridge"
    echo -e "  使用 /office-hours 开始产品构思"
    echo -e "  或 bash scripts/orchestrate.sh --phase 0.5a"
fi

echo ""
echo -e "${BLUE}下一步:${NC}"
echo -e "  1. 编辑 CLAUDE.local.md 设置个人偏好"
echo -e "  2. 编辑 .mcp.json 配置 MCP 服务器"
echo -e "  3. 运行 ${GREEN}/doctor${NC} 验证配置"
if [ "$GSTACK_MODE" = true ]; then
    echo -e "  4. 运行 ${MAGENTA}/office-hours${NC} 开始产品设计"
fi
echo ""