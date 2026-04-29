const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
  runHook, createTempProject, cleanupTemp, setPhase, createMockInput,
  assertBlocked, assertAllowed, markSkillInvoked,
} = require('../helpers/hook-tester');

function withPhase1(fn) {
  return () => {
    const tmp = createTempProject();
    setPhase(tmp, 1);
    try {
      fn(tmp);
    } finally {
      cleanupTemp(tmp);
    }
  };
}

describe('skill-invocation-guard.js - frozen document protection', () => {
  test('blocks writing docs/design/01 without skill marker', withPhase1((tmp) => {
    const r = runHook('hooks/scripts/skill-invocation-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/design/01_系统架构设计.md') }),
      { cwd: tmp });
    assertBlocked(r, 'writing-plans');
  }));

  test('allows writing docs/design/01 with writing-plans marker', withPhase1((tmp) => {
    markSkillInvoked(tmp, 'writing-plans');
    const r = runHook('hooks/scripts/skill-invocation-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/design/01_系统架构设计.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows writing docs/requirements/PRD.md with product-requirements marker', withPhase1((tmp) => {
    markSkillInvoked(tmp, 'product-requirements');
    const r = runHook('hooks/scripts/skill-invocation-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/requirements/PRD.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows writing non-frozen documents', withPhase1((tmp) => {
    const r = runHook('hooks/scripts/skill-invocation-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'docs/dev/notes.md') }),
      { cwd: tmp });
    assertAllowed(r);
  }));

  test('allows writing normal source files', withPhase1((tmp) => {
    const r = runHook('hooks/scripts/skill-invocation-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
      { cwd: tmp });
    assertAllowed(r);
  }));
});
