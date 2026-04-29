#!/usr/bin/env node
/**
 * role-adoption-flow.test.js — 角色采用流程集成测试
 *
 * 验证主会话角色采用的完整流程:
 * 1. 无角色 → 写 src/ 被阻止
 * 2. 采用角色 → 角色路径内写操作放行
 * 3. 角色越权 → 被阻止
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

// Create a temporary project for isolated testing
function createIsolatedProject() {
  const tmp = path.join(os.tmpdir(), `ce-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tmp, { recursive: true });
  const logsDir = path.join(tmp, '.claude', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  return tmp;
}

// Write milestones.json to tmp dir
function writeMilestones(tmp, milestones) {
  const filePath = path.join(tmp, 'automation', 'milestones.json');
  fs.mkdirSync(path.join(tmp, 'automation'), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(milestones, null, 2));
  return filePath;
}

describe('milestone-guard.js - milestone-based path protection', () => {
  test('no milestones.json: does not block', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    try {
      const r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('M1 with no dependsOn: always allows', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [{
        id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
        deliverables: ['src/types/'],
        gate: { check: 'echo ok', files: ['src/types/index.ts'] }
      }]
    });
    try {
      const r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/types/index.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('M2 dependsOn M1 + M1 not done: blocks write to M2 paths', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [
        { id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
          deliverables: ['src/types/'], gate: { check: 'echo ok', files: ['src/types/index.ts'] } },
        { id: 'M2', name: 'Components', dependsOn: ['M1'], agents: ['Frontend-1'],
          deliverables: ['src/components/'], gate: { check: 'echo ok', files: [] } }
      ]
    });
    try {
      const r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/components/Button.tsx') }),
        { cwd: tmp });
      assertBlocked(r, 'M1');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('M2 dependsOn M1 + M1 done: allows write to M2 paths', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [
        { id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
          deliverables: ['src/types/'], gate: { check: 'echo ok', files: ['src/types/index.ts'] } },
        { id: 'M2', name: 'Components', dependsOn: ['M1'], agents: ['Frontend-1'],
          deliverables: ['src/components/'], gate: { check: 'echo ok', files: [] } }
      ]
    });
    markMilestoneDone(tmp, 'M1');
    try {
      const r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/components/Button.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('write path not in any milestone: does not block', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [{
        id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
        deliverables: ['src/types/'], gate: { check: 'echo ok', files: [] }
      }]
    });
    try {
      const r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/utils/helper.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});

// ---------- milestone-controller.js tests ----------

describe('milestone-controller.js - milestone completion check', () => {
  test('gate check passes + gate files exist: creates done marker', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [{
        id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
        deliverables: ['src/types/'],
        gate: { check: 'echo ok', files: [] }
      }]
    });
    // Create a fake current-milestone marker
    fs.writeFileSync(path.join(tmp, '.claude', 'logs', 'current-milestone.json'),
      JSON.stringify({ id: 'M1', name: 'Types' }));
    try {
      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed', taskId: '1' }),
        { cwd: tmp });
      // Should create milestone-M1-done marker
      const doneFile = path.join(tmp, '.claude', 'logs', 'milestone-M1-done.json');
      assert.ok(fs.existsSync(doneFile), 'Milestone done marker should exist');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('gate check fails: exit(2) with error details', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [{
        id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
        deliverables: ['src/types/'],
        gate: { check: 'exit 1', files: [] }
      }]
    });
    fs.writeFileSync(path.join(tmp, '.claude', 'logs', 'current-milestone.json'),
      JSON.stringify({ id: 'M1', name: 'Types' }));
    try {
      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed', taskId: '1' }),
        { cwd: tmp });
      assertBlocked(r, '验证失败');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('gate files missing: exit(2) with missing file list', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [{
        id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
        deliverables: ['src/types/'],
        gate: { check: 'echo ok', files: ['src/types/index.ts'] }
      }]
    });
    fs.writeFileSync(path.join(tmp, '.claude', 'logs', 'current-milestone.json'),
      JSON.stringify({ id: 'M1', name: 'Types' }));
    try {
      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed', taskId: '1' }),
        { cwd: tmp });
      assertBlocked(r, '缺失');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('completed milestone outputs next milestone task', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    writeMilestones(tmp, {
      milestones: [
        { id: 'M1', name: 'Types', dependsOn: [], agents: ['Architect'],
          deliverables: ['src/types/'], gate: { check: 'echo ok', files: [] } },
        { id: 'M2', name: 'Components', dependsOn: ['M1'], agents: ['Frontend-1'],
          deliverables: ['src/components/'], gate: { check: 'echo ok', files: [] } }
      ]
    });
    markMilestoneDone(tmp, 'M1');
    fs.writeFileSync(path.join(tmp, '.claude', 'logs', 'current-milestone.json'),
      JSON.stringify({ id: 'M1', name: 'Types' }));
    try {
      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed', taskId: '1' }),
        { cwd: tmp });
      // Should output next milestone info
      assert.ok(r.stdout.includes('M2') || r.stderr.includes('M2'), 'Should mention next milestone M2');
    } finally {
      cleanupTemp(tmp);
    }
  });
});

// ---------- teammate-milestone-watch.js tests ----------

describe('teammate-milestone-watch.js - prevent idle with pending tasks', () => {
  test('has pending tasks: exit(2)', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    // Create task list with pending tasks
    const taskDir = path.join(tmp, '.claude', 'tasks');
    fs.mkdirSync(taskDir, { recursive: true });
    fs.writeFileSync(path.join(taskDir, 'tasks.json'), JSON.stringify([
      { id: '1', subject: 'Do thing', status: 'pending', owner: '' },
    ]));
    try {
      const r = runHook('hooks/scripts/teammate-milestone-watch.js',
        JSON.stringify({}),
        { cwd: tmp });
      assertBlocked(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('no pending tasks: allows', () => {
    const tmp = createIsolatedProject();
    setPhase(tmp, 2);
    const taskDir = path.join(tmp, '.claude', 'tasks');
    fs.mkdirSync(taskDir, { recursive: true });
    fs.writeFileSync(path.join(taskDir, 'tasks.json'), JSON.stringify([
      { id: '1', subject: 'Done', status: 'completed', owner: 'me' },
    ]));
    try {
      const r = runHook('hooks/scripts/teammate-milestone-watch.js',
        JSON.stringify({}),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});