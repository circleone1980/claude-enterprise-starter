#!/usr/bin/env node
/**
 * phase-gate-guard.js — PreToolUse 阶段门禁前置守卫
 *
 * 在 Edit/Write 操作之前检查当前阶段是否允许操作目标文件。
 * 不满足条件时 exit(1) 阻止操作。
 *
 * 阶段约束规则:
 *   Phase 0:  只允许 docs/brainstorms/ + .claude/ + 框架配置
 *   Phase 1:  只允许 docs/requirements/ + docs/design/ + docs/reviews/ + docs/process-trace/
 *   Phase 2+: 允许 src/ 操作，但前置阶段门禁必须通过
 *
 * 白名单豁免（不受阶段约束）:
 *   - rules/, automation/, scripts/, .claude/, hooks/, skills/
 *   - CLAUDE.md, README.md, settings.json, package.json
 *   - templates/, test/, teams/, docs/CE-SETUP.md, docs/GUIDE.md
 *   - CHANGELOG.md, LICENSE
 *
 * 环境变量:
 *   CE_SKIP_GATE=1 — 临时跳过门禁检查
 *
 * Updated: 2026-04-27
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const PHASE_FILE = path.join(PHASE_LOG_DIR, 'current-phase.json');

// 允许跳过门禁（用于框架自身开发、初始化等场景）
if (process.env.CE_SKIP_GATE === '1') {
  process.exit(0);
}

// 如果没有阶段文件，说明项目未初始化阶段系统，放行
if (!fs.existsSync(PHASE_FILE)) {
  process.exit(0);
}

// 读取当前阶段
let currentPhase;
try {
  const data = JSON.parse(fs.readFileSync(PHASE_FILE, 'utf-8'));
  currentPhase = parseInt(data.currentPhase, 10);
  if (isNaN(currentPhase)) currentPhase = 0;
} catch {
  currentPhase = 0;
}

// 从 stdin 读取工具输入
let toolInput = {};
try {
  const chunks = [];
  process.stdin.setEncoding('utf-8');
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) {
    toolInput = JSON.parse(input);
  }
} catch {
  // 无输入则放行
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';
if (!filePath) {
  process.exit(0);
}

// 转为相对路径
const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

// === 白名单：不受阶段约束的路径 ===
const WHITELIST_PREFIXES = [
  'rules/',
  'automation/',
  'scripts/',
  '.claude/',
  '.git/',
  '.github/',
  'hooks/',
  'skills/',
  'templates/',
  'test/',
  'tests/',
  'teams/',
  'node_modules/',
];

const WHITELIST_FILES = [
  'CLAUDE.md',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'settings.json',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  '.mcp.json',
  '.gitignore',
  '.env',
  '.env.example',
  'docs/CE-SETUP.md',
  'docs/GUIDE.md',
  'docs/LIFECYCLE-EXECUTION-PLAN.md',
];

function isWhitelisted(p) {
  // 根级别白名单文件
  if (WHITELIST_FILES.includes(p)) return true;
  // 前缀白名单
  for (const prefix of WHITELIST_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

if (isWhitelisted(relPath)) {
  process.exit(0);
}

// === 阶段约束检查 ===

// Phase 允许的路径前缀
const PHASE_ALLOWED = {
  0: [
    'docs/brainstorms/',
    'docs/process-trace/',
    '.user-confirmed',
    '.claude/',
  ],
  1: [
    'docs/requirements/',
    'docs/design/',
    'docs/reviews/',
    'docs/process-trace/',
    'docs/brainstorms/',
    'docs/plans/',
    'docs/superpowers/',
  ],
};

// Phase 2+ 允许所有操作（门禁由 marker 文件控制）
function isAllowed(phase, p) {
  if (phase >= 2) return true;

  const allowed = PHASE_ALLOWED[phase] || [];
  for (const prefix of allowed) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

if (!isAllowed(currentPhase, relPath)) {
  const phaseNames = {
    0: 'Phase 0（头脑风暴）',
    1: 'Phase 1（需求分析）',
  };
  const phaseName = phaseNames[currentPhase] || `Phase ${currentPhase}`;

  console.error(`\n[CE Gate] 阶段门禁拦截！`);
  console.error(`  当前阶段: ${phaseName}`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  原因: 当前阶段不允许操作此路径`);
  console.error(`  解决: 先完成当前阶段的 Hard Gate，再操作该文件`);
  console.error(`  跳过: 设置环境变量 CE_SKIP_GATE=1（仅用于框架开发）\n`);

  process.exit(1);
}

process.exit(0);
