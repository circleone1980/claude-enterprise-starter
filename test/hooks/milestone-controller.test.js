const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const {
  runHook, createTempProject, cleanupTemp,
} = require('../helpers/hook-tester');

describe('milestone-controller.js - milestone gate checking', () => {
  test('gate.check passes + gate.files exist: creates done marker', () => {
    const tmp = createTempProject();
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [{
          id: 'M1', name: 'Types', dependsOn: [],
          deliverables: ['src/types/'],
          gate: { check: 'node -e "console.log(1)"', files: [] },
        }],
      }));

      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed' }),
        { cwd: tmp });

      assert.strictEqual(r.exitCode, 0);
      const parsed = JSON.parse(r.stdout);
      assert.strictEqual(parsed.status, 'advanced');
      assert.strictEqual(parsed.completed, 'M1');

      // Verify marker file exists
      const markerPath = path.join(tmp, '.claude', 'logs', 'milestone-M1-done.marker');
      assert.ok(fs.existsSync(markerPath), 'Done marker should exist');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('gate.files missing: reports pending', () => {
    const tmp = createTempProject();
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [{
          id: 'M1', name: 'Types', dependsOn: [],
          deliverables: ['src/types/'],
          gate: { check: 'echo ok', files: ['src/types/index.ts'] },
        }],
      }));

      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed' }),
        { cwd: tmp });

      assert.strictEqual(r.exitCode, 0);
      const parsed = JSON.parse(r.stdout);
      assert.strictEqual(parsed.status, 'pending');
      assert.ok(parsed.failedChecks.some(c => c.includes('文件缺失')));
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('non-completed status: skips check', () => {
    const tmp = createTempProject();
    try {
      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'in_progress' }),
        { cwd: tmp });
      assert.strictEqual(r.exitCode, 0);
      // No output — just pass through
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('completed milestone outputs next milestone info', () => {
    const tmp = createTempProject();
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [
          {
            id: 'M1', name: 'Types', dependsOn: [],
            deliverables: ['src/types/'],
            gate: { check: 'node -e "console.log(1)"', files: [] },
          },
          {
            id: 'M2', name: 'Components', dependsOn: ['M1'],
            deliverables: ['src/components/'],
            gate: { check: 'echo ok', files: [] },
          },
        ],
      }));

      const r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed' }),
        { cwd: tmp });

      assert.strictEqual(r.exitCode, 0);
      const parsed = JSON.parse(r.stdout);
      assert.strictEqual(parsed.status, 'advanced');
      assert.strictEqual(parsed.completed, 'M1');
      assert.ok(parsed.nextMilestone, 'Should have next milestone');
      assert.strictEqual(parsed.nextMilestone.id, 'M2');
    } finally {
      cleanupTemp(tmp);
    }
  });
});
