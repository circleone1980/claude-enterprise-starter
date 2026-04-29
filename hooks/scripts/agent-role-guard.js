#!/usr/bin/env node

/**
 * agent-role-guard.js — PreToolUse 角色门禁
 *
 * Phase 2-5 期间写 src/ 或 test/ 路径时，检查主会话是否已采用 Agent 角色。
 * 未采用角色 → exit(2) 阻止写操作。
 * 角色不匹配写入路径 → exit(2) 阻止越权写入。
 *
 * 豁免路径: docs/, .claude/, CLAUDE.md, README.md 等 — 任何角色都可写
 *
 * 环境变量:
 *   CE_SKIP_ROLE_GUARD=1 — 跳过角色检查
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const PHASE_FILE = path.join(PHASE_LOG_DIR, 'current-phase.json');
const ROLE_FILE = path.join(PHASE_LOG_DIR, 'active-role.json');

const ROLE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// 跳过检查
if (process.env.CE_SKIP_ROLE_GUARD === '1') {
  process.exit(0);
}

// 读取当前阶段
let currentPhase = 0;
if (fs.existsSync(PHASE_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(PHASE_FILE, 'utf-8'));
    currentPhase = parseInt(data.currentPhase, 10);
    if (isNaN(currentPhase)) currentPhase = 0;
  } catch { /* fallback to 0 */ }
}

// Phase 0/1: 不检查角色
if (currentPhase < 2) {
  process.exit(0);
}

// 从 stdin 读取工具输入
let toolInput = {};
try {
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';
if (!filePath) {
  process.exit(0);
}

const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

// 豁免路径 — 任何角色都可写
const EXEMPT_PREFIXES = [
  'docs/',
  '.claude/',
  '.git/',
  'rules/',
  'automation/',
  'scripts/',
  'hooks/',
  'skills/',
  'templates/',
  'teams/',
];

const EXEMPT_FILES = [
  'CLAUDE.md',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'settings.json',
  'package.json',
];

function isExempt(p) {
  if (EXEMPT_FILES.includes(p)) return true;
  for (const prefix of EXEMPT_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

if (isExempt(relPath)) {
  process.exit(0);
}

// 只检查 src/ 和 test/ 路径（代码路径）
if (!relPath.startsWith('src/') && !relPath.startsWith('test/')) {
  process.exit(0);
}

// 检查角色标记文件
if (!fs.existsSync(ROLE_FILE)) {
  console.error(`\n[角色门禁] 未采用角色！`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  原因: 当前阶段 Phase ${currentPhase} 写代码需要先采用角色`);
  console.error(`  解决: 调用 /assume-role <角色名> 采用角色`);
  console.error(`  可用角色: Frontend, Backend-Python, Backend-Java, QA, DevOps, Architect\n`);
  process.exit(2);
}

// 读取角色信息
let roleInfo;
try {
  roleInfo = JSON.parse(fs.readFileSync(ROLE_FILE, 'utf-8'));
} catch {
  console.error(`\n[角色门禁] 角色标记文件损坏`);
  console.error(`  解决: 重新调用 /assume-role <角色名>\n`);
  process.exit(2);
}

// 检查过期
const timestamp = roleInfo.timestamp || 0;
if (Date.now() - timestamp > ROLE_EXPIRY_MS) {
  console.error(`\n[角色门禁] 角色已过期（>30分钟）！`);
  console.error(`  当前角色: ${roleInfo.role}`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  解决: 重新调用 /assume-role <角色名>\n`);
  process.exit(2);
}

// 检查路径是否在该角色的 allowedPaths 内
const allowedPaths = roleInfo.allowedPaths || [];
const isAllowed = allowedPaths.some(allowed => relPath.startsWith(allowed));

if (!isAllowed) {
  console.error(`\n[角色门禁] 角色越权！`);
  console.error(`  当前角色: ${roleInfo.role}`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  允许路径: ${allowedPaths.join(', ') || '(无)'}`);
  console.error(`  解决: 切换到有权限的角色 /assume-role <角色名>\n`);
  process.exit(2);
}

process.exit(0);
