#!/usr/bin/env node

/**
 * milestone-controller.js — 里程碑完成控制器
 *
 * 在任务标记完成时检查当前里程碑的 gate 条件是否满足。
 * 满足 → 创建 done 标记 + 输出下一里程碑 Task 创建建议。
 * 不满足 → 输出 pending 状态。
 *
 * 触发: PostToolUse TaskUpdate（status=completed 时）
 *
 * 环境变量:
 *   CE_SKIP_MILESTONE_CHECK=1 — 跳过检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const MILESTONES_PATH = path.join(PROJECT_ROOT, 'automation', 'milestones.json');
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const DONE_MARKER = (id) => path.join(PHASE_LOG_DIR, `milestone-${id}-done.marker`);

if (process.env.CE_SKIP_MILESTONE_CHECK === '1') {
  process.exit(0);
}

if (!fs.existsSync(MILESTONES_PATH)) {
  process.exit(0);
}

// Read stdin for TaskUpdate input
let toolInput = {};
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

// Only check when task status is set to completed
const status = toolInput.status || '';
if (status !== 'completed') {
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

// Find the first incomplete milestone
const incomplete = milestones.milestones.find(ms => !fs.existsSync(DONE_MARKER(ms.id)));
if (!incomplete) {
  // All milestones done
  console.log(JSON.stringify({ status: 'all-complete' }));
  process.exit(0);
}

// Check gate conditions
const gate = incomplete.gate || {};
const failed = [];

// Check gate.files
if (gate.files && Array.isArray(gate.files)) {
  for (const f of gate.files) {
    const fullPath = path.join(PROJECT_ROOT, f);
    if (!fs.existsSync(fullPath)) {
      failed.push(`文件缺失: ${f}`);
    }
  }
}

// Check gate.check command
if (gate.check && failed.length === 0) {
  try {
    execSync(gate.check, {
      encoding: 'utf-8',
      cwd: PROJECT_ROOT,
      timeout: 30000,
      stdio: 'pipe',
    });
  } catch (e) {
    failed.push(`检查命令失败: ${gate.check} — ${e.message.split('\n')[0]}`);
  }
}

if (failed.length > 0) {
  console.log(JSON.stringify({
    status: 'pending',
    milestone: incomplete.id,
    name: incomplete.name,
    failedChecks: failed,
  }));
  process.exit(0);
}

// Gate passed — create done marker
const logsDir = path.join(PROJECT_ROOT, '.claude', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

fs.writeFileSync(DONE_MARKER(incomplete.id), JSON.stringify({
  id: incomplete.id,
  name: incomplete.name,
  completedAt: new Date().toISOString(),
}));

// Find next milestone
const nextMs = milestones.milestones.find(ms => {
  if (fs.existsSync(DONE_MARKER(ms.id))) return false;
  const deps = ms.dependsOn || [];
  return deps.every(depId => fs.existsSync(DONE_MARKER(depId)));
});

console.log(JSON.stringify({
  status: 'advanced',
  completed: incomplete.id,
  completedName: incomplete.name,
  nextMilestone: nextMs ? { id: nextMs.id, name: nextMs.name, agents: nextMs.agents } : null,
}));

process.exit(0);
