#!/usr/bin/env node

/**
 * teammate-milestone-watch.js — TeammateIdle 里程碑看门狗
 *
 * 检查当前里程碑是否有未完成任务。
 * 有 → exit(2) 阻止闲置，要求继续工作。
 * 无 → 放行。
 *
 * 触发: TeammateIdle
 *
 * 环境变量:
 *   CE_SKIP_MILESTONE_WATCH=1 — 跳过检查
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const MILESTONES_PATH = path.join(PROJECT_ROOT, 'automation', 'milestones.json');
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const DONE_MARKER = (id) => path.join(PHASE_LOG_DIR, `milestone-${id}-done.marker`);

if (process.env.CE_SKIP_MILESTONE_WATCH === '1') {
  process.exit(0);
}

if (!fs.existsSync(MILESTONES_PATH)) {
  process.exit(0);
}

// Read stdin for TeammateIdle input
let toolInput = {};
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
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

// Find the first incomplete milestone whose dependencies are met
const activeMilestone = milestones.milestones.find(ms => {
  if (fs.existsSync(DONE_MARKER(ms.id))) return false;
  const deps = ms.dependsOn || [];
  return deps.every(depId => fs.existsSync(DONE_MARKER(depId)));
});

if (!activeMilestone) {
  process.exit(0);
}

// Check for pending tasks (via task list directory)
const tasksDir = path.join(PROJECT_ROOT, '.claude', 'tasks');
let hasPending = false;

if (fs.existsSync(tasksDir)) {
  try {
    const teams = fs.readdirSync(tasksDir);
    for (const team of teams) {
      const taskFiles = fs.readdirSync(path.join(tasksDir, team))
        .filter(f => f.endsWith('.json'));

      for (const tf of taskFiles) {
        try {
          const task = JSON.parse(
            fs.readFileSync(path.join(tasksDir, team, tf), 'utf-8')
          );
          if (task.status === 'pending' || task.status === 'in_progress') {
            hasPending = true;
            break;
          }
        } catch { /* skip malformed */ }
      }
      if (hasPending) break;
    }
  } catch { /* tasks dir issue */ }
}

if (hasPending) {
  console.error(`\n[里程碑看门狗] 仍有未完成任务！`);
  console.error(`  当前里程碑: ${activeMilestone.id} — ${activeMilestone.name}`);
  console.error(`  解决: 请继续完成分配的任务\n`);
  process.exit(2);
}

process.exit(0);
