const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
  runHook, createTempProject, cleanupTemp, setPhase, createMockInput,
  assertBlocked, assertAllowed, markTeamCreated,
} = require('../helpers/hook-tester');

describe('team-mode-guard.js - team mode enforcement', () => {
  test('Phase 1 + no team marker: blocks writing docs/design/', () => {
    const tmp = createTempProject();
    setPhase(tmp, 1);
    try {
      const r = runHook('hooks/scripts/team-mode-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'docs/design/arch.md') }),
        { cwd: tmp });
      assertBlocked(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Phase 1 + team marker: allows writing docs/design/', () => {
    const tmp = createTempProject();
    setPhase(tmp, 1);
    markTeamCreated(tmp);
    try {
      const r = runHook('hooks/scripts/team-mode-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'docs/design/arch.md') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Phase 2 + no team marker: allows (no check needed)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const r = runHook('hooks/scripts/team-mode-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Phase 0: always allows', () => {
    const tmp = createTempProject();
    setPhase(tmp, 0);
    try {
      const r = runHook('hooks/scripts/team-mode-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'docs/brainstorms/idea.md') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});
