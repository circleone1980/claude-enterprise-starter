#!/usr/bin/env node
/**
 * role-adoption-flow.test.js — 角色采用流程集成测试
 *
 * 验证主会话角色采用的完整流程:
 * 1. 无角色 → 写 src/ 被阻止
 * 2. 采用角色 → 角色路径内写操作放行
 * 3. 角色越权 → 被阻止
 * 4. 豁免路径 → 任何角色可写
 * 5. 多角色切换 → 新角色覆盖旧角色权限
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
  runHook, createTempProject, cleanupTemp, setPhase, createMockInput,
  assertBlocked, assertAllowed, setActiveRole,
} = require('../helpers/hook-tester');

describe('role-adoption-flow — no role blocks src/ writes', () => {
  test('Phase 2: no active role → blocks writing to src/components/', () => {
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

  test('Phase 2: no active role → blocks writing to src/api/', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/api/routes.py') }),
        { cwd: tmp });
      assertBlocked(r, 'assume-role');
    } finally {
      cleanupTemp(tmp);
    }
  });
});

describe('role-adoption-flow — role allows writes within allowed paths', () => {
  test('Frontend role → allows src/components/', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'Frontend', ['src/components/', 'src/styles/', 'src/hooks/', 'src/utils/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/Button.tsx') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Backend-Python role → allows src/api/', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'Backend-Python', ['src/api/', 'src/services/', 'src/models/', 'src/core/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/api/routes.py') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('QA role → allows test/', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'QA', ['test/', 'tests/', 'e2e/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'test/unit/app.test.js') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});

describe('role-adoption-flow — role boundary enforcement', () => {
  test('Frontend role → blocks writing src/api/ (out of scope)', () => {
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

  test('Backend-Python role → blocks writing src/components/ (out of scope)', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    setActiveRole(tmp, 'Backend-Python', ['src/api/', 'src/services/', 'src/models/', 'src/core/']);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
        { cwd: tmp });
      assertBlocked(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});

describe('role-adoption-flow — exempt paths', () => {
  test('docs/ is always allowed regardless of role', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    // No active role set
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, 'docs/design/arch.md') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('.claude/ is always allowed', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);
    try {
      const r = runHook('hooks/scripts/agent-role-guard.js',
        createMockInput('Write', { file_path: path.join(tmp, '.claude/settings.json') }),
        { cwd: tmp });
      assertAllowed(r);
    } finally {
      cleanupTemp(tmp);
    }
  });
});

describe('role-adoption-flow — role switching', () => {
  test('switching from Frontend to Backend changes allowed paths', () => {
    const tmp = createTempProject();
    setPhase(tmp, 2);

    // First adopt Frontend role
    setActiveRole(tmp, 'Frontend', ['src/components/', 'src/styles/', 'src/hooks/', 'src/utils/']);
    let r = runHook('hooks/scripts/agent-role-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/components/App.tsx') }),
      { cwd: tmp });
    assertAllowed(r);

    // Switch to Backend-Python role
    setActiveRole(tmp, 'Backend-Python', ['src/api/', 'src/services/', 'src/models/', 'src/core/']);

    // Now src/components/ should be blocked
    r = runHook('hooks/scripts/agent-role-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/components/New.tsx') }),
      { cwd: tmp });
    assertBlocked(r);

    // And src/api/ should be allowed
    r = runHook('hooks/scripts/agent-role-guard.js',
      createMockInput('Write', { file_path: path.join(tmp, 'src/api/routes.py') }),
      { cwd: tmp });
    assertAllowed(r);

    cleanupTemp(tmp);
  });
});
