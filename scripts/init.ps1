# Claude Code 模板初始化脚本 (Windows PowerShell)
# 使用方法:
#   .\init.ps1                                          # 传统模式
#   .\init.ps1 -Workspace -ProjectType java              # workspace 模式
#   .\init.ps1 C:\Projects\my-project                    # 传统模式到指定目录

param(
    [string]$TargetPath = ".",
    [switch]$Workspace,
    [string]$WorkspaceDir = "workspace",
    [ValidateSet("node", "java", "python")]
    [string]$ProjectType = "node",
    [switch]$Flat
)

# 模板目录
$TemplateDir = Split-Path -Parent $PSScriptRoot

# 确定模式
$UseWorkspace = $Workspace -and -not $Flat

# 目标目录
$TargetDir = Resolve-Path $TargetPath -ErrorAction SilentlyContinue
if (-not $TargetDir) {
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    $TargetDir = Resolve-Path $TargetPath
}

Write-Host "================================================" -ForegroundColor Blue
Write-Host "     Claude Code 项目模板初始化" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "目标目录: $TargetDir" -ForegroundColor Green
Write-Host "模板目录: $TemplateDir" -ForegroundColor Green
if ($UseWorkspace) {
    Write-Host "模式: workspace ($WorkspaceDir/)" -ForegroundColor Green
    Write-Host "项目类型: $ProjectType" -ForegroundColor Green
} else {
    Write-Host "模式: 传统 (flat)" -ForegroundColor Green
}
Write-Host ""

# ─── 核心复制步骤 ──────────────────────────────────

# 创建 .claude 目录
Write-Host "[1/8] 创建 .claude 目录结构..." -ForegroundColor Blue
$ClaudeDir = Join-Path $TargetDir ".claude"
New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null

# 复制核心文件
Write-Host "[2/8] 复制核心配置文件..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "CLAUDE.md") -Destination $ClaudeDir -Force
Copy-Item -Path (Join-Path $TemplateDir "settings.json") -Destination $ClaudeDir -Force
Copy-Item -Path (Join-Path $TemplateDir ".mcp.json") -Destination $TargetDir -Force
Copy-Item -Path (Join-Path $TemplateDir ".worktreeinclude") -Destination $TargetDir -Force

# 复制规则
Write-Host "[3/8] 复制规则文件..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "rules") -Destination $ClaudeDir -Recurse -Force

# 复制技能
Write-Host "[4/8] 复制技能文件..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "skills") -Destination $ClaudeDir -Recurse -Force

$InnerSkillsDir = Join-Path $TemplateDir ".claude\skills"
if (Test-Path $InnerSkillsDir) {
    $DestDir = Join-Path $ClaudeDir ".claude\skills"
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    Copy-Item -Path "$InnerSkillsDir\*" -Destination $DestDir -Recurse -Force
}

# 复制代理
Write-Host "[5/8] 复制代理定义..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "agents") -Destination $ClaudeDir -Recurse -Force

$AgentMemoryDir = Join-Path $TemplateDir "agent-memory"
if (Test-Path $AgentMemoryDir) {
    Copy-Item -Path $AgentMemoryDir -Destination $ClaudeDir -Recurse -Force
}

# 复制可选组件
Write-Host "[6/8] 复制可选组件..." -ForegroundColor Blue
$CommandsDir = Join-Path $TemplateDir "commands"
if (Test-Path $CommandsDir) {
    Copy-Item -Path $CommandsDir -Destination $ClaudeDir -Recurse -Force
}

$OutputStylesDir = Join-Path $TemplateDir "output-styles"
if (Test-Path $OutputStylesDir) {
    Copy-Item -Path $OutputStylesDir -Destination $ClaudeDir -Recurse -Force
}

# ─── 文档目录创建 ──────────────────────────────────

Write-Host "[7/8] 创建文档目录结构..." -ForegroundColor Blue
$DocsTemplatesDir = Join-Path $TemplateDir "docs\templates"

if ($UseWorkspace) {
    # Workspace 模式：文档放在 workspace/docs/
    $WorkspacePath = Join-Path $TargetDir $WorkspaceDir
    $DocsBase = Join-Path $WorkspacePath "docs"

    New-Item -ItemType Directory -Path (Join-Path $WorkspacePath "src") -Force | Out-Null

    if (Test-Path $DocsTemplatesDir) {
        $DocsDirs = @("requirements", "design", "superpowers\specs", "superpowers\decisions", "dev", "test", "fixes", "sql")
        foreach ($Dir in $DocsDirs) {
            $TargetDocsDir = Join-Path $DocsBase $Dir
            New-Item -ItemType Directory -Path $TargetDocsDir -Force | Out-Null
        }

        Copy-Item -Path (Join-Path $DocsTemplatesDir "requirements\*") -Destination (Join-Path $DocsBase "requirements") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "design\*") -Destination (Join-Path $DocsBase "design") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "superpowers\*") -Destination (Join-Path $DocsBase "superpowers") -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "dev\*") -Destination (Join-Path $DocsBase "dev") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "test\*") -Destination (Join-Path $DocsBase "test") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "fixes\*") -Destination (Join-Path $DocsBase "fixes") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "sql\*") -Destination (Join-Path $DocsBase "sql") -Force -ErrorAction SilentlyContinue

        Write-Host "  ✓ workspace/docs/ 已创建" -ForegroundColor Green
    }

    # 生成 workspace.json
    $AutomationDir = Join-Path $TargetDir "automation"
    New-Item -ItemType Directory -Path $AutomationDir -Force | Out-Null
    $WorkspaceJson = @"
{
  "version": "1.0.0",
  "workspaceDir": "$WorkspaceDir",
  "docsDir": "docs",
  "srcDir": "src",
  "_comment": "工作区路径配置。workspaceDir='.' 时回退到传统模式"
}
"@
    Set-Content -Path (Join-Path $AutomationDir "workspace.json") -Value $WorkspaceJson
    Write-Host "  ✓ automation/workspace.json 已创建" -ForegroundColor Green

    # 生成 workspace/.gitignore
    $WorkspaceGitignore = @"
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
"@
    Set-Content -Path (Join-Path $WorkspacePath ".gitignore") -Value $WorkspaceGitignore

    # 生成项目配置文件
    switch ($ProjectType) {
        "node" {
            $PackageJson = Join-Path $WorkspacePath "package.json"
            if (-not (Test-Path $PackageJson)) {
                $PkgContent = @"
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
"@
                Set-Content -Path $PackageJson -Value $PkgContent
                Write-Host "  ✓ workspace/package.json 已创建" -ForegroundColor Green
            }
        }
        "java" {
            $SrcMain = Join-Path $WorkspacePath "src\main\java"
            $SrcTest = Join-Path $WorkspacePath "src\test\java"
            if (-not (Test-Path $SrcMain)) {
                New-Item -ItemType Directory -Path $SrcMain -Force | Out-Null
                New-Item -ItemType Directory -Path $SrcTest -Force | Out-Null
                Write-Host "  ✓ workspace/src/main/java + src/test/java 已创建" -ForegroundColor Green
            }
        }
        "python" {
            $PyprojectPath = Join-Path $WorkspacePath "pyproject.toml"
            if (-not (Test-Path $PyprojectPath)) {
                $PyContent = @"
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.12"

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.ruff]
line-length = 120
"@
                Set-Content -Path $PyprojectPath -Value $PyContent
                New-Item -ItemType Directory -Path (Join-Path $WorkspacePath "tests") -Force | Out-Null
                Write-Host "  ✓ workspace/pyproject.toml 已创建" -ForegroundColor Green
            }
        }
    }
} else {
    # 传统模式
    if (Test-Path $DocsTemplatesDir) {
        $DocsDirs = @("requirements", "design", "superpowers\specs", "superpowers\decisions", "dev", "test", "fixes", "sql")
        foreach ($Dir in $DocsDirs) {
            $TargetDocsDir = Join-Path $TargetDir "docs\$Dir"
            New-Item -ItemType Directory -Path $TargetDocsDir -Force | Out-Null
        }

        Copy-Item -Path (Join-Path $DocsTemplatesDir "requirements\*") -Destination (Join-Path $TargetDir "docs\requirements") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "design\*") -Destination (Join-Path $TargetDir "docs\design") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "superpowers\*") -Destination (Join-Path $TargetDir "docs\superpowers") -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "dev\*") -Destination (Join-Path $TargetDir "docs\dev") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "test\*") -Destination (Join-Path $TargetDir "docs\test") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "fixes\*") -Destination (Join-Path $TargetDir "docs\fixes") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $DocsTemplatesDir "sql\*") -Destination (Join-Path $TargetDir "docs\sql") -Force -ErrorAction SilentlyContinue

        Write-Host "  ✓ docs/ 已创建" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ 跳过文档目录创建（模板文件不存在）" -ForegroundColor Yellow
    }
}

# ─── 本地配置和 .gitignore ────────────────────────

Write-Host "[8/8] 创建本地配置和 .gitignore..." -ForegroundColor Yellow

$LocalExample = Join-Path $TemplateDir "CLAUDE.local.md.example"
if (Test-Path $LocalExample) {
    Copy-Item -Path $LocalExample -Destination (Join-Path $TargetDir "CLAUDE.local.md") -Force
    Write-Host "  ✓ 创建 CLAUDE.local.md" -ForegroundColor Green
}

$SettingsExample = Join-Path $TemplateDir "settings.local.json.example"
if (Test-Path $SettingsExample) {
    Copy-Item -Path $SettingsExample -Destination (Join-Path $ClaudeDir "settings.local.json") -Force
    Write-Host "  ✓ 创建 .claude/settings.local.json" -ForegroundColor Green
}

# 更新 .gitignore
$GitignorePath = Join-Path $TargetDir ".gitignore"
$GitignoreContent = @"

# Claude Code 本地配置
CLAUDE.local.md
.claude/settings.local.json
"@

if (Test-Path $GitignorePath) {
    $CurrentContent = Get-Content $GitignorePath -Raw
    if ($CurrentContent -notmatch "CLAUDE.local.md") {
        Add-Content -Path $GitignorePath -Value $GitignoreContent
        Write-Host "  ✓ 已添加 gitignore 规则" -ForegroundColor Green
    }
} else {
    Set-Content -Path $GitignorePath -Value $GitignoreContent.TrimStart()
    Write-Host "  ✓ 创建 .gitignore" -ForegroundColor Green
}

# ─── 完成 ─────────────────────────────────────────

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "     初始化完成！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "已创建的文件:" -ForegroundColor Blue
Write-Host "  .claude\CLAUDE.md"
Write-Host "  .claude\settings.json"
Write-Host "  .claude\rules\"
Write-Host "  .claude\skills\"
Write-Host "  .claude\agents\"
Write-Host "  .mcp.json"
Write-Host "  CLAUDE.local.md " -NoNewline
Write-Host "(gitignored)" -ForegroundColor Yellow
Write-Host "  .claude\settings.local.json " -NoNewline
Write-Host "(gitignored)" -ForegroundColor Yellow

if ($UseWorkspace) {
    Write-Host ""
    Write-Host "workspace 模式:" -ForegroundColor Blue
    Write-Host "  $WorkspaceDir\src\  " -NoNewline
    Write-Host "← 实际开发代码" -ForegroundColor Yellow
    Write-Host "  $WorkspaceDir\docs\ " -NoNewline
    Write-Host "← 项目文档" -ForegroundColor Yellow
    Write-Host "  automation\workspace.json " -NoNewline
    Write-Host "← 工作区配置" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "下一步:" -ForegroundColor Blue
Write-Host "  1. 编辑 CLAUDE.local.md 设置个人偏好"
Write-Host "  2. 编辑 .mcp.json 配置 MCP 服务器"
Write-Host "  3. 运行 " -NoNewline
Write-Host "/doctor" -ForegroundColor Green -NoNewline
Write-Host " 验证配置"
Write-Host ""
