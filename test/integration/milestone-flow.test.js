#!/usr/bin/env node
/**
 * milestone-flow.test.js — 里程碑流程集成测试
 *
 * 验证里程碑顺序执行的完整流程:
 * 1. M1 完成 → done 标记 → M2 Task 创建
 * 2. 跳跃阻止 → M1 未完成时写 M2 路径被阻止
 * 3. 迭代 → M2 gate 失败 → 修复后 gate 通过
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const {
  runHook, createTempProject, cleanupTemp, setPhase,
  markMilestoneDone, assertBlocked, assertAllowed,
} = require('../helpers/hook-tester');

describe('milestone integration flow', () => {
  const makeMilestones = () => ({
    milestones: [
      {
        id: 'M1', name: '接口定义与数据模型', dependsOn: [],
        agents: ['Architect'], deliverables: ['src/types/', 'src/api/'],
        gate: { check: 'node -e "console.log(\'M1 gate passed\')"', files: [] },
      },
      {
        id: 'M2', name: '前端组件开发', dependsOn: ['M1'],
        agents: ['Frontend-1'], deliverables: ['src/components/'],
        gate: { check: 'node -e "console.log(\'M2 gate passed\')"', files: [] },
      },
    ],
  });

  test('full flow: M1 done → M2 task created → M2 write allowed', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);

    // Create milestones.json
    const msDir = path.join(tmp, 'automation');
    fs.mkdirSync(msDir, { recursive: true });
    fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify(makeMilestones()));

    try {
      // Step 1: Write to M1 path — should allow (no deps)
      let r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/types/index.ts') }),
        { cwd: tmp });
      assertAllowed(r);

      // Step 2: milestone-controller advances M1 (gate passes → done marker)
      r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed' }),
        { cwd: tmp });
      assert.strictEqual(r.exitCode, 0);
      const parsed = JSON.parse(r.stdout);
      assert.strictEqual(parsed.status, 'advanced');
      assert.strictEqual(parsed.completed, 'M1');
      assert.ok(parsed.nextMilestone, 'Should have next milestone M2');
      assert.strictEqual(parsed.nextMilestone.id, 'M2');

      // Verify M1 done marker was created
      assert.ok(
        fs.existsSync(path.join(tmp, '.claude', 'logs', 'milestone-M1-done.marker')),
        'M1 done marker should exist'
      );

      // Step 4: Write to M2 path — should now allow (M1 done)
      r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/components/Button.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('skip prevention: M1 not done → write to M2 path blocked', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);

    const msDir = path.join(tmp, 'automation');
    fs.mkdirSync(msDir, { recursive: true });
    fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify(makeMilestones()));

    try {
      // M1 not done → M2 write should be blocked
      const r = runHook('hooks/scripts/milestone-guard.js',
        JSON.stringify({ file_path: path.join(tmp, 'src/components/Button.tsx') }),
        { cwd: tmp });
      assertBlocked(r, 'M1');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('iteration: M2 gate fails first, passes after fix', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);

    // Create milestones with gate that requires a file
    const msDir = path.join(tmp, 'automation');
    fs.mkdirSync(msDir, { recursive: true });
    fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
      milestones: [
        {
          id: 'M1', name: 'Types', dependsOn: [],
          agents: ['Architect'], deliverables: ['src/types/'],
          gate: { check: 'node -e "console.log(\'ok\')"', files: ['src/types/index.ts'] },
        },
      ],
    }));

    try {
      // Gate check without required file → pending
      let r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed' }),
        { cwd: tmp });
      assert.strictEqual(r.exitCode, 0);
      let parsed = JSON.parse(r.stdout);
      assert.strictEqual(parsed.status, 'pending');
      assert.ok(parsed.failedChecks.some(c => c.includes('文件缺失')));

      // Create the required file
      fs.mkdirSync(path.join(tmp, 'src', 'types'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'src', 'types', 'index.ts'), 'export {};');

      // Now gate should pass
      r = runHook('hooks/scripts/milestone-controller.js',
        JSON.stringify({ status: 'completed' }),
        { cwd: tmp });
      assert.strictEqual(r.exitCode, 0);
      parsed = JSON.parse(r.stdout);
      assert.strictEqual(parsed.status, 'advanced');
      assert.strictEqual(parsed.completed, 'M1');

      // Verify done marker
      assert.ok(
        fs.existsSync(path.join(tmp, '.claude', 'logs', 'milestone-M1-done.marker')),
        'Done marker should exist'
      );
    } finally {
      cleanupTemp(tmp);
    }
  });
});
