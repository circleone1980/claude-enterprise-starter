#!/usr/bin/env node
/**
 * entry-management.test.js — 入口管理机制测试
 *
 * 验证 v5.1.0 插件优先架构 + 入口管理改造的完整性:
 * - SessionStart 注入配置
 * - using-ce-framework 元技能
 * - PreToolUse 门禁守卫
 * - 规则文件
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { listSkillDirs } = require('../helpers/config-loader');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function fileExists(relPath) {
  return fs.existsSync(path.join(PROJECT_ROOT, relPath));
}

function readFile(relPath) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf-8');
}

describe('entry-management — using-ce-framework meta skill', () => {
  test('SKILL.md exists', () => {
    assert.ok(fileExists('skills/using-ce-framework/SKILL.md'));
  });

  test('contains Iron Laws', () => {
    const content = readFile('skills/using-ce-framework/SKILL.md');
    assert.ok(content.includes('Iron Laws') || content.includes('Iron Law'));
  });

  test('contains Red Flags', () => {
    const content = readFile('skills/using-ce-framework/SKILL.md');
    assert.ok(content.includes('Red Flags') || content.includes('红旗'));
  });

  test('contains SUBAGENT-STOP', () => {
    const content = readFile('skills/using-ce-framework/SKILL.md');
    assert.ok(content.includes('SUBAGENT-STOP'));
  });

  test('contains 1% rule', () => {
    const content = readFile('skills/using-ce-framework/SKILL.md');
    assert.ok(content.includes('1%'));
  });

  test('contains Hard Gates', () => {
    const content = readFile('skills/using-ce-framework/SKILL.md');
    assert.ok(content.includes('Hard Gate'));
  });
});

describe('entry-management — SessionStart hook', () => {
  test('session-start directory exists', () => {
    assert.ok(fileExists('hooks/scripts/session-start'));
  });

  test('run-hook.cmd exists', () => {
    assert.ok(fileExists('hooks/scripts/run-hook.cmd'));
  });

  test('hooks.json has SessionStart section', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    assert.ok(hooks.hooks.SessionStart !== undefined);
  });

  test('SessionStart matcher is correct', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    assert.strictEqual(hooks.hooks.SessionStart[0].matcher, 'startup|clear|compact');
  });
});

describe('entry-management — PreToolUse gate guards', () => {
  test('phase-gate-guard.js exists', () => {
    assert.ok(fileExists('hooks/scripts/phase-gate-guard.js'));
  });

  test('PreToolUse Edit includes phase-gate-guard', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    const editHooks = hooks.hooks.PreToolUse.find(h => h.matcher === 'Edit');
    assert.ok(editHooks && editHooks.hooks.some(h => h.command.includes('phase-gate-guard')));
  });

  test('PreToolUse Write includes phase-gate-guard', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    const writeHooks = hooks.hooks.PreToolUse.find(h => h.matcher === 'Write');
    assert.ok(writeHooks && writeHooks.hooks.some(h => h.command.includes('phase-gate-guard')));
  });
});

describe('entry-management — plugin-provided skills', () => {
  const localSkills = listSkillDirs();

  test('systematic-debugging is plugin-provided (no local copy)', () => {
    assert.ok(!localSkills.includes('systematic-debugging'));
  });

  test('requesting-code-review is plugin-provided', () => {
    assert.ok(!localSkills.includes('requesting-code-review'));
  });

  test('receiving-code-review is plugin-provided', () => {
    assert.ok(!localSkills.includes('receiving-code-review'));
  });

  test('tdd is plugin-provided', () => {
    assert.ok(!localSkills.includes('tdd'));
  });
});

describe('entry-management — rule files', () => {
  test('rules/18_entry_management.md exists', () => {
    assert.ok(fileExists('rules/18_entry_management.md'));
  });

  test('Rule 18 contains SessionStart', () => {
    const content = readFile('rules/18_entry_management.md');
    assert.ok(content.includes('SessionStart') || content.includes('session-start'));
  });

  test('Rule 18 contains PreToolUse', () => {
    const content = readFile('rules/18_entry_management.md');
    assert.ok(content.includes('PreToolUse') || content.includes('phase-gate-guard'));
  });
});

describe('entry-management — CLAUDE.md references', () => {
  test('references using-ce-framework', () => {
    const claudeMd = readFile('CLAUDE.md');
    assert.ok(claudeMd.includes('using-ce-framework'));
  });

  test('has entry rules section', () => {
    const claudeMd = readFile('CLAUDE.md');
    assert.ok(claudeMd.includes('入口规则'));
  });

  test('version is 5.x', () => {
    const claudeMd = readFile('CLAUDE.md');
    assert.ok(/v?5\.\d/.test(claudeMd));
  });
});

describe('entry-management — version consistency', () => {
  test('agent-orchestration.json version is 5.x', () => {
    const ssot = JSON.parse(readFile('automation/agent-orchestration.json'));
    assert.ok(/^5\.\d/.test(ssot.version), `Expected 5.x, got ${ssot.version}`);
  });

  test('package.json version matches SSOT', () => {
    const ssot = JSON.parse(readFile('automation/agent-orchestration.json'));
    const pkg = JSON.parse(readFile('package.json'));
    assert.strictEqual(pkg.version, ssot.version);
  });
});

describe('entry-management — phase-gates.json paths', () => {
  test('contains .claude/logs/ path', () => {
    const gates = JSON.parse(readFile('automation/phase-gates.json'));
    const json = JSON.stringify(gates);
    assert.ok(json.includes('.claude/logs/.phase'));
  });

  test('retains legacy path compatibility', () => {
    const gates = JSON.parse(readFile('automation/phase-gates.json'));
    const json = JSON.stringify(gates);
    assert.ok(json.includes('.phase2-code-complete'));
  });
});

describe('entry-management — plugin-provided verification-loop', () => {
  test('verification-loop has no local copy (provided by ECC plugin)', () => {
    assert.ok(!fileExists('skills/verification-loop/SKILL.md'));
  });
});

describe('entry-management — v5.1.0 new hooks', () => {
  test('agent-role-guard.js exists', () => {
    assert.ok(fileExists('hooks/scripts/agent-role-guard.js'));
  });

  test('subagent-role-bind.js exists', () => {
    assert.ok(fileExists('hooks/scripts/subagent-role-bind.js'));
  });

  test('subagent-stop-verify.js exists', () => {
    assert.ok(fileExists('hooks/scripts/subagent-stop-verify.js'));
  });

  test('milestone-guard.js exists', () => {
    assert.ok(fileExists('hooks/scripts/milestone-guard.js'));
  });

  test('milestone-controller.js exists', () => {
    assert.ok(fileExists('hooks/scripts/milestone-controller.js'));
  });

  test('teammate-milestone-watch.js exists', () => {
    assert.ok(fileExists('hooks/scripts/teammate-milestone-watch.js'));
  });
});

describe('entry-management — v5.1.0 hooks.json new rules', () => {
  test('hooks.json has SubagentStart', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    assert.ok(hooks.hooks.SubagentStart !== undefined);
  });

  test('hooks.json has SubagentStop', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    assert.ok(hooks.hooks.SubagentStop !== undefined);
  });

  test('hooks.json has TeammateIdle', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    assert.ok(hooks.hooks.TeammateIdle !== undefined);
  });

  test('PreToolUse Edit includes agent-role-guard', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    const editHooks = hooks.hooks.PreToolUse.find(h => h.matcher === 'Edit');
    assert.ok(editHooks && editHooks.hooks.some(h => h.command.includes('agent-role-guard')));
  });

  test('PreToolUse Edit includes milestone-guard', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    const editHooks = hooks.hooks.PreToolUse.find(h => h.matcher === 'Edit');
    assert.ok(editHooks && editHooks.hooks.some(h => h.command.includes('milestone-guard')));
  });

  test('PostToolUse TaskUpdate includes milestone-controller', () => {
    const hooks = JSON.parse(readFile('hooks/hooks.json'));
    const taskUpdateHooks = hooks.hooks.PostToolUse.find(h => h.matcher === 'TaskUpdate');
    assert.ok(taskUpdateHooks && taskUpdateHooks.hooks.some(h => h.command.includes('milestone-controller')));
  });
});

describe('entry-management — v5.1.0 agent .md frontmatter', () => {
  test('agents/frontend.md has description field', () => {
    const content = readFile('agents/frontend.md');
    assert.ok(content.includes('description:'));
  });

  test('agents/frontend.md has tools field', () => {
    const content = readFile('agents/frontend.md');
    assert.ok(content.includes('tools:'));
  });

  test('agents/backend-python.md has description field', () => {
    const content = readFile('agents/backend-python.md');
    assert.ok(content.includes('description:'));
  });

  test('agents/backend-python.md has tools field', () => {
    const content = readFile('agents/backend-python.md');
    assert.ok(content.includes('tools:'));
  });
});

describe('entry-management — v5.1.0 milestones-template.json', () => {
  test('file exists', () => {
    assert.ok(fileExists('automation/milestones-template.json'));
  });

  test('has milestones array', () => {
    const ms = JSON.parse(readFile('automation/milestones-template.json'));
    assert.ok(Array.isArray(ms.milestones));
  });

  test('has at least 2 milestones', () => {
    const ms = JSON.parse(readFile('automation/milestones-template.json'));
    assert.ok(ms.milestones.length >= 2);
  });
});

describe('entry-management — post-phase-reconcile v3', () => {
  test('no generateSkillMarker function (removed in v3)', () => {
    const content = readFile('scripts/post-phase-reconcile.js');
    assert.ok(!content.includes('generateSkillMarker(') || content.includes('// 已删除'));
  });

  test('Layer 4 is WARN level', () => {
    const content = readFile('scripts/post-phase-reconcile.js');
    assert.ok(content.includes('Layer 4: Audit 交叉验证 (WARN)'));
  });

  test('findSkillInAudit uses exact match', () => {
    const content = readFile('scripts/post-phase-reconcile.js');
    assert.ok(content.includes("r.skill === skillName"));
  });

  test('warns when trace-audit.jsonl missing', () => {
    const content = readFile('scripts/post-phase-reconcile.js');
    assert.ok(content.includes('console.warn') && content.includes('trace-audit.jsonl 不存在'));
  });

  test('process-trace-check.js exists', () => {
    assert.ok(fileExists('hooks/scripts/process-trace-check.js'));
  });
});
