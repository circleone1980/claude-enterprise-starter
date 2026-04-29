#!/usr/bin/env node

/**
 * milestone-guard.js — PreToolUse 里程碑门禁
 *
 * Phase 2-5 期间写 src/ 或 test/ 路径时，检查写入路径所属里程碑的前置依赖是否完成。
 * 未完成 → exit(2) 阻止写入。
 *
 * 豁免: 无 milestones.json 时跳过检查
 *
 * 环境变量:
 *   CE_SKIP_MILESTONE_GUARD=1 — 跳过检查
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const MILESTONES_PATH = path.join(PROJECT_ROOT, 'automation', 'milestones.json');
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const PHASE_FILE = path.join(PHASE_LOG_DIR, 'current-phase.json');
const DONE_MARKER = (id) => path.join(PHASE_LOG_DIR, `milestone-${id}-done.marker`);

// Skip checks
if (process.env.CE_SKIP_MILESTONE_GUARD === '1') {
  process.exit(0);
}

// No milestones file — skip
if (!fs.existsSync(MILESTONES_PATH)) {
  process.exit(0);
}

// Read current phase
let currentPhase = 0;
if (fs.existsSync(PHASE_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(PHASE_FILE, 'utf-8'));
    currentPhase = parseInt(data.currentPhase, 10);
    if (isNaN(currentPhase)) currentPhase = 0;
  } catch { /* fallback to 0 */ }
}

// Phase 0/1: no milestone check
if (currentPhase < 2) {
  process.exit(0);
}

// Read stdin
let toolInput = {};
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';
if (!filePath) {
  process.exit(0);
}

const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

// Only check src/ and test/ paths
if (!relPath.startsWith('src/') && !relPath.startsWith('test/')) {
  process.exit(0);
}

// Load milestones
let milestones;
try {
  milestones = JSON.parse(fs.readFileSync(MILESTONES_PATH, 'utf-8'));
} catch {
  process.exit(0);
}

if (!milestones.milestones || !Array.isArray(milestones.milestones)) {
  process.exit(0);
}

// Find which milestone this path belongs to
for (const ms of milestones.milestones) {
  const deliverables = ms.deliverables || [];
  const matches = deliverables.some(d => relPath.startsWith(d));

  if (!matches) continue;

  // Check dependsOn
  const deps = ms.dependsOn || [];
  const incompleteDeps = deps.filter(depId => !fs.existsSync(DONE_MARKER(depId)));

  if (incompleteDeps.length > 0) {
    console.error(`\n[里程碑门禁] 里程碑 ${ms.id} 前置未完成！`);
    console.error(`  写入路径: ${relPath}`);
    console.error(`  所属里程碑: ${ms.id} — ${ms.name}`);
    console.error(`  未完成前置: ${incompleteDeps.join(', ')}`);
    console.error(`  解决: 先完成里程碑 ${incompleteDeps.join(', ')} 的所有交付物\n`);
    process.exit(2);
  }

  // Dependencies met — allow
  process.exit(0);
}

// Path doesn't belong to any milestone — allow
process.exit(0);
