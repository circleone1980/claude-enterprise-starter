const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
  runHook, createTempProject, cleanupTemp, createMockInput,
  assertAllowed,
} = require('../helpers/hook-tester');

describe('subagent-role-bind.js - standalone subagent role injection', () => {
  test('local subagent_type skips injection (native loading handles it)', () => {
    // "frontend" is a local agent name — native loading provides the role
    const r = runHook('hooks/scripts/subagent-role-bind.js',
      JSON.stringify({ subagent_type: 'frontend', prompt: '你是 Frontend' }));
    assertAllowed(r);
    // No additionalContext output for local types
    assert.ok(!r.stdout.includes('additionalContext'), 'Should not inject for local agent');
  });

  test('external subagent_type + prompt with role name injects agent .md', () => {
    const r = runHook('hooks/scripts/subagent-role-bind.js',
      JSON.stringify({
        subagent_type: 'everything-claude-code:typescript-reviewer',
        prompt: '你是 frontend 开发',
      }));
    assertAllowed(r);
    const parsed = JSON.parse(r.stdout);
    assert.ok(parsed.additionalContext, 'Should inject additionalContext');
    assert.ok(parsed.additionalContext.includes('Frontend'), 'Should contain role definition');
  });

  test('unknown subagent_type + no role in prompt injects generic reminder', () => {
    const r = runHook('hooks/scripts/subagent-role-bind.js',
      JSON.stringify({ subagent_type: 'some-external-type', prompt: 'Do some task' }));
    assertAllowed(r);
    const parsed = JSON.parse(r.stdout);
    assert.ok(parsed.additionalContext, 'Should inject generic reminder');
    assert.ok(parsed.additionalContext.includes('subagent'), 'Should mention subagent');
  });

  test('injected content includes SOP section', () => {
    const r = runHook('hooks/scripts/subagent-role-bind.js',
      JSON.stringify({
        subagent_type: 'external-plugin:some-agent',
        prompt: '你是 qa',
      }));
    assertAllowed(r);
    const parsed = JSON.parse(r.stdout);
    assert.ok(parsed.additionalContext, 'Should have additionalContext');
    // Should contain body from agents/qa.md (SOP content)
    assert.ok(
      parsed.additionalContext.includes('职责') || parsed.additionalContext.includes('Skill'),
      'Should contain SOP or skill content from agent .md'
    );
  });

  test('injected content includes Skill list', () => {
    const r = runHook('hooks/scripts/subagent-role-bind.js',
      JSON.stringify({
        subagent_type: 'external-plugin:some-agent',
        prompt: '你是 backend-python',
      }));
    assertAllowed(r);
    const parsed = JSON.parse(r.stdout);
    assert.ok(parsed.additionalContext, 'Should have additionalContext');
    assert.ok(
      parsed.additionalContext.includes('调用 Skill'),
      'Should contain skill invocation instructions'
    );
  });
});
