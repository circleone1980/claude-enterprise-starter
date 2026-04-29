const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const {
  runHook, createTempProject, cleanupTemp, setPhase, createMockInput,
  assertBlocked, assertAllowed, markMilestoneDone,
} = require('../helpers/hook-tester');

describe('milestone-guard.js - milestone dependency enforcement', () => {
  test('no milestones.json: allows all writes', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      // No milestones.json created — should skip
      const r = runHook('hooks/scripts/milestone-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('M1 with no dependsOn: always allows', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      // Create milestones.json with M1 (no deps)
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [{
          id: 'M1', name: 'Types', dependsOn: [],
          deliverables: ['src/types/'],
          gate: { check: 'echo ok', files: [] },
        }],
      }));

      const r = runHook('hooks/scripts/milestone-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/types/index.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('M2 with M1 unmet dependency: blocks write', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [
          { id: 'M1', name: 'Types', dependsOn: [], deliverables: ['src/types/'] },
          { id: 'M2', name: 'Components', dependsOn: ['M1'], deliverables: ['src/components/'] },
        ],
      }));

      const r = runHook('hooks/scripts/milestone-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertBlocked(r, '前置未完成');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('M2 with M1 done: allows write', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [
          { id: 'M1', name: 'Types', dependsOn: [], deliverables: ['src/types/'] },
          { id: 'M2', name: 'Components', dependsOn: ['M1'], deliverables: ['src/components/'] },
        ],
      }));

      markMilestoneDone(tmp, 'M1');

      const r = runHook('hooks/scripts/milestone-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('write path not in any milestone: allows', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const msDir = path.join(tmp, 'automation');
      fs.mkdirSync(msDir, { recursive: true });
      fs.writeFileSync(path.join(msDir, 'milestones.json'), JSON.stringify({
        milestones: [
          { id: 'M1', name: 'Types', dependsOn: [], deliverables: ['src/types/'] },
        ],
      }));

      // Writing to src/utils/ which is not in any milestone
      const r = runHook('hooks/scripts/milestone-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/utils/helper.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});
