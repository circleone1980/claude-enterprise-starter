const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  runHook, createTempProject, cleanupTemp, assertBlocked, assertAllowed,
} = require('../helpers/hook-tester');

describe('subagent-stop-verify.js - subagent output verification', () => {
  test('sufficient output passes verification', () => {
    const longOutput = 'x'.repeat(200);
    const r = runHook('hooks/scripts/subagent-stop-verify.js',
      JSON.stringify({ subagent_type: 'frontend', output: longOutput }));
    assertAllowed(r);
  });

  test('insufficient output triggers exit(2)', () => {
    const r = runHook('hooks/scripts/subagent-stop-verify.js',
      JSON.stringify({ subagent_type: 'frontend', output: 'short' }));
    assertBlocked(r, '输出不足');
  });

  test('unknown role passes without checking', () => {
    const r = runHook('hooks/scripts/subagent-stop-verify.js',
      JSON.stringify({ subagent_type: 'unknown-agent-type', output: 'anything' }));
    assertAllowed(r);
  });
});
