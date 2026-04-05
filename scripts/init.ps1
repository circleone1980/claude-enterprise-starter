# Claude Code 模板初始化脚本 (Windows PowerShell)
# 使用方法: .\init.ps1 <目标项目路径>

param(
    [string]$TargetPath = "."
)

# 模板目录
$TemplateDir = Split-Path -Parent $PSScriptRoot

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
Write-Host ""

# 创建 .claude 目录
Write-Host "[1/6] 创建 .claude 目录结构..." -ForegroundColor Blue
$ClaudeDir = Join-Path $TargetDir ".claude"
New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null

# 复制核心文件
Write-Host "[2/6] 复制核心配置文件..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "CLAUDE.md") -Destination $ClaudeDir -Force
Copy-Item -Path (Join-Path $TemplateDir "settings.json") -Destination $ClaudeDir -Force
Copy-Item -Path (Join-Path $TemplateDir ".mcp.json") -Destination $TargetDir -Force
Copy-Item -Path (Join-Path $TemplateDir ".worktreeinclude") -Destination $TargetDir -Force

# 复制规则
Write-Host "[3/6] 复制规则文件..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "rules") -Destination $ClaudeDir -Recurse -Force

# 复制技能
Write-Host "[4/6] 复制技能文件..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "skills") -Destination $ClaudeDir -Recurse -Force

$InnerSkillsDir = Join-Path $TemplateDir ".claude\skills"
if (Test-Path $InnerSkillsDir) {
    $DestDir = Join-Path $ClaudeDir ".claude\skills"
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    Copy-Item -Path "$InnerSkillsDir\*" -Destination $DestDir -Recurse -Force
}

# 复制代理
Write-Host "[5/6] 复制代理定义..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $TemplateDir "agents") -Destination $ClaudeDir -Recurse -Force

$AgentMemoryDir = Join-Path $TemplateDir "agent-memory"
if (Test-Path $AgentMemoryDir) {
    Copy-Item -Path $AgentMemoryDir -Destination $ClaudeDir -Recurse -Force
}

# 复制可选组件
Write-Host "[6/6] 复制可选组件..." -ForegroundColor Blue
$CommandsDir = Join-Path $TemplateDir "commands"
if (Test-Path $CommandsDir) {
    Copy-Item -Path $CommandsDir -Destination $ClaudeDir -Recurse -Force
}

$OutputStylesDir = Join-Path $TemplateDir "output-styles"
if (Test-Path $OutputStylesDir) {
    Copy-Item -Path $OutputStylesDir -Destination $ClaudeDir -Recurse -Force
}

# 创建本地配置
Write-Host "创建本地配置文件..." -ForegroundColor Yellow

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
Write-Host "更新 .gitignore..." -ForegroundColor Yellow
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

# 显示结果
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
Write-Host ""
Write-Host "下一步:" -ForegroundColor Blue
Write-Host "  1. 编辑 CLAUDE.local.md 设置个人偏好"
Write-Host "  2. 编辑 .mcp.json 配置 MCP 服务器"
Write-Host "  3. 运行 " -NoNewline
Write-Host "/doctor" -ForegroundColor Green -NoNewline
Write-Host " 验证配置"
Write-Host ""
