# install-prerequisites.ps1 — claude-enterprise-starter v5.0 前置依赖一键安装
# 用法: powershell -ExecutionPolicy Bypass -File scripts\install-prerequisites.ps1

$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " claude-enterprise-starter v5.0 前置安装" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---- Step 1: 添加插件市场 ----
Write-Host "=== 1/5 添加插件市场 ===" -ForegroundColor Yellow

$marketplaces = @(
    @{ Name = "ecc"; Repo = "affaan-m/everything-claude-code" },
    @{ Name = "compound-engineering-plugin"; Repo = "EveryInc/compound-engineering-plugin" },
    @{ Name = "ui-ux-pro-max-skill"; Repo = "nextlevelbuilder/ui-ux-pro-max-skill" }
)

foreach ($mp in $marketplaces) {
    Write-Host "  添加 $($mp.Name) ($($mp.Repo))..."
    claude plugin marketplace add $mp.Repo 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $($mp.Name) 市场添加成功" -ForegroundColor Green
    } else {
        Write-Host "[WARN] $($mp.Name) 可能已存在" -ForegroundColor Yellow
    }
}

Write-Host ""

# ---- Step 2: 安装核心插件 ----
Write-Host "=== 2/5 安装核心插件 ===" -ForegroundColor Yellow

$plugins = @(
    "superpowers",
    "ecc",
    "compound-engineering",
    "ui-ux-pro-max",
    "context7",
    "playwright",
    "codex"
)

foreach ($plugin in $plugins) {
    Write-Host "  安装 $plugin..."
    claude plugin install $plugin 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $plugin 安装成功" -ForegroundColor Green
    } else {
        Write-Host "[WARN] $plugin 可能已安装" -ForegroundColor Yellow
    }
}

Write-Host ""

# ---- Step 3: 部署 GStack ----
Write-Host "=== 3/5 部署 GStack ===" -ForegroundColor Yellow

$gstackDir = "$env:USERPROFILE\.claude\skills\gstack"

if (Test-Path $gstackDir) {
    Write-Host "[OK] GStack 已部署 ($gstackDir)" -ForegroundColor Green
    Write-Host "  更新中..."
    Push-Location $gstackDir
    git pull 2>$null
    Pop-Location
} else {
    Write-Host "  克隆 GStack..."
    git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git $gstackDir
    Push-Location $gstackDir
    bash ./setup
    Pop-Location
    Write-Host "[OK] GStack 部署完成" -ForegroundColor Green
}

Write-Host ""

# ---- Step 4: 启用插件 ----
Write-Host "=== 4/5 启用插件 ===" -ForegroundColor Yellow

$enablePlugins = @("superpowers", "ecc", "compound-engineering", "ui-ux-pro-max", "codex")
foreach ($plugin in $enablePlugins) {
    claude plugin enable $plugin 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $plugin 已启用" -ForegroundColor Green
    } else {
        Write-Host "[WARN] $plugin 启用失败" -ForegroundColor Yellow
    }
}

Write-Host ""

# ---- Step 5: 验证 ----
Write-Host "=== 5/5 验证安装 ===" -ForegroundColor Yellow

Write-Host ""
Write-Host "--- 插件列表 ---"
claude plugin list 2>$null

Write-Host ""
Write-Host "--- GStack ---"
if (Test-Path "$gstackDir\SKILL.md") {
    Write-Host "[OK] GStack SKILL.md 存在" -ForegroundColor Green
} else {
    Write-Host "[FAIL] GStack SKILL.md 缺失" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 安装完成!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后续步骤:"
Write-Host "  1. 重启 Claude Code 会话"
Write-Host "  2. 运行 npm run check-all 验证配置"
Write-Host ""
Write-Host "更新命令:"
Write-Host "  claude plugin update superpowers"
Write-Host "  claude plugin update ecc"
Write-Host "  claude plugin update compound-engineering"
Write-Host "  claude plugin update ui-ux-pro-max"
Write-Host "  claude plugin update codex"
Write-Host "  cd $gstackDir; git pull"
Write-Host ""
