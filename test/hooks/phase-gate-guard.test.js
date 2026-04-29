const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
  runHook, createTempProject, cleanupTemp, setPhase, createMockInput,
  assertBlocked, assertAllowed,
} = require('../helpers/hook-tester');

function withPhase(phase, fn) {
  return () => {
    const tmp = createTempProject();
    setPhase(tmp, phase);
    try {
      fn(tmp);
    } finally {
      cleanupTemp(tmp);
    }
  };
}

describe('phase-gate-guard.js - Phase 0', () => {
  test('allows writing to docs/brainstorms/', withPhase(0, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/brainstorms/idea.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('blocks writing to docs/requirements/', withPhase(0, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/requirements/PRD.md') }),
      { cwd: tmp });
    assertBlocked(r);
  }));

  test('blocks writing to src/', withPhase(0, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
      { cwd: tmp });
    assertBlocked(r);
  }));

  test('allows whitelisted paths (rules/)', withPhase(0, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'rules/test.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows whitelisted paths (automation/)', withPhase(0, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'automation/test.json') }),
      { cwd: tmp });
    assertAllowed(r);
  }));
});

describe('phase-gate-guard.js - Phase 1', () => {
  test('allows writing to docs/requirements/', withPhase(1, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/requirements/PRD.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows writing to docs/design/', withPhase(1, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/design/arch.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows writing to docs/reviews/', withPhase(1, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/reviews/review.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('blocks writing to src/', withPhase(1, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
      { cwd: tmp });
    assertBlocked(r);
  }));
});

describe('phase-gate-guard.js - Phase 2+', () => {
  test('allows writing to src/ at Phase 2', withPhase(2, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows writing to src/ at Phase 3', withPhase(3, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
      { cwd: tmp });
    assertAllowed(r);
  }));
});

describe('phase-gate-guard.js - special cases', () => {
  test('CE_SKIP_GATE=1 bypasses all checks', withPhase(0, (tmp) => {
    const r = runHook('hooks/scripts/phase-gate-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
      { cwd: tmp, env: { CE_SKIP_GATE: '1' } });
    assertAllowed(r);
  }));

  test('no current-phase.json defaults to allowed (Phase 2+)', () => {
    const tmp = createTempProject();
    try {
      const r = runHook('hooks/scripts/phase-gate-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});
