const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
  runHook, createTempProject, cleanupTemp, setPhase, createMockInput,
  assertBlocked, assertAllowed, setActiveRole,
} = require('../helpers/hook-tester');

describe('agent-role-guard.js - role-based write protection', () => {
  test('blocks writing src/ without active role (Phase 2)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertBlocked(r, 'assume-role');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('allows writing src/components/ with Frontend role (Phase 2)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'Frontend', ['src/components/', 'src/styles/', 'src/hooks/', 'src/utils/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('blocks writing src/api/ with Frontend role (Phase 2)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'Frontend', ['src/components/', 'src/styles/', 'src/hooks/', 'src/utils/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/api/routes.py') }),
        { cwd: tmp });
      assertBlocked(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('allows writing src/api/ with Backend-Python role (Phase 2)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'Backend-Python', ['src/api/', 'src/services/', 'src/models/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/api/routes.py') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('exempt paths (docs/) always allowed regardless of role', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    // No active role set, but docs/ is exempt
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'docs/dev/notes.md') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Phase 0/1: no role check (always allows)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 1);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/app.ts') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('expired role (>30min) triggers re-prompt', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    // Set role with old timestamp (31 minutes ago)
    const oldTimestamp = Date.now() - 31 * 60 * 1000;
    const logsDir = path.join(tmp, '.claude', 'logs');
    const fs = require('fs');
    fs.writeFileSync(
      path.join(logsDir, 'active-role.json'),
      JSON.stringify({ role: 'Frontend', allowedPaths: ['src/components/'], timestamp: oldTimestamp })
    );
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertBlocked(r, '过期');
    } finally {
      cleanupTemp(tmp);
    }
  });
});
