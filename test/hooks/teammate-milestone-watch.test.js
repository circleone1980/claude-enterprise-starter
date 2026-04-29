const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const {
  runHook, createTempProject, cleanupTemp, assertBlocked, assertAllowed,
} = require('../helpers/hook-tester');

describe('teammate-milestone-watch.js - prevent idle with pending tasks', () => {
  test('no milestones.json: allows idle', () => {
    const tmp = createTempProject();
    try {
      const r = runHook('hooks/scripts/teammate-milestone-watch.js',
        JSON.stringify({}),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('no pending tasks: allows idle', () => {
    const tmp = createTempProject();
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [
          { id: 'M1', name: 'Types', dependsOn: [], deliverables: ['src/types/'] },
        ],
      }));

      // No tasks directory — no pending tasks
      const r = runHook('hooks/scripts/teammate-milestone-watch.js',
        JSON.stringify({}),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('pending tasks: blocks idle', () => {
    const tmp = createTempProject();
    try {
      // Create milestones
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [{
          id: 'M1', name: 'Types', dependsOn: [],
          deliverables: ['src/types/'],
        }],
      }));

      // Create pending task
      const tasksDir = path.join(tmp, '.claude', 'tasks', 'team1');
      fs.mkdirSync(tasksDir, { recursive: true });
      fs.writeFileSync(path.join(tasksDir, 'task-1.json'), JSON.stringify({
        status: 'pending',
        subject: 'Define types',
      }));

      const r = runHook('hooks/scripts/teammate-milestone-watch.js',
        JSON.stringify({}),
        { cwd: tmp });
      assertBlocked(r, '未完成任务');
    } finally {
      cleanupTemp(tmp);
    }
  });
});
