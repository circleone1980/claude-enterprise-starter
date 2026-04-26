const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadJSON, ROOT } = require('../helpers/config-loader');

const hooksConfig = loadJSON('hooks/hooks.json');

/**
 * 从 hooks.json 中提取所有 .js 脚本引用
 */
function extractScriptPaths(hooksObj) {
  const scripts = new Set();

  for (const event of Object.keys(hooksObj)) {
    const entries = hooksObj[event];
    if (!Array.isArray(entries)) continue;

    for (const entry of entries) {
      // Handle entries with "hooks" sub-array (PreToolUse, PostToolUse, Stop)
      if (entry.hooks && Array.isArray(entry.hooks)) {
        for (const hook of entry.hooks) {
          if (hook.command && hook.command.includes('.js')) {
            // Extract the node script path from commands like "node hooks/scripts/foo.js"
            const match = hook.command.match(/(hooks\/scripts\/\S+\.js)/);
            if (match) scripts.add(match[1]);
          }
        }
      }

      // Handle Scheduled entries with direct "command"
      if (entry.command && entry.command.includes('.js')) {
        const match = entry.command.match(/(hooks\/scripts\/\S+\.js)/);
        if (match) scripts.add(match[1]);
      }
    }
  }

  return [...scripts];
}

const scriptPaths = extractScriptPaths(hooksConfig.hooks);

describe('hook-event-flow - script existence', () => {
  test('hooks.json references at least one .js script', () => {
    assert.ok(scriptPaths.length > 0, 'No .js scripts found in hooks.json');
  });

  test('all scripts referenced in hooks.json exist on disk', () => {
    for (const relPath of scriptPaths) {
      const fullPath = path.join(ROOT, relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Script referenced in hooks.json not found: ${relPath} (resolved: ${fullPath})`
      );
    }
  });

  test('hooks.json has required event types', () => {
    assert.ok(hooksConfig.hooks.PreToolUse, 'Missing PreToolUse');
    assert.ok(hooksConfig.hooks.PostToolUse, 'Missing PostToolUse');
    assert.ok(hooksConfig.hooks.Stop, 'Missing Stop');
    assert.ok(hooksConfig.hooks.Scheduled, 'Missing Scheduled');
  });
});

describe('hook-event-flow - syntax checks', () => {
  test('each .js hook file passes node --check syntax check', () => {
    for (const relPath of scriptPaths) {
      const fullPath = path.join(ROOT, relPath);
      try {
        execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
      } catch (e) {
        assert.fail(`Syntax error in ${relPath}: ${e.stderr ? e.stderr.toString() : e.message}`);
      }
    }
  });
});

describe('hook-event-flow - hook structure', () => {
  test('PreToolUse hooks have correct matchers', () => {
    const matchers = hooksConfig.hooks.PreToolUse.map(e => e.matcher);
    assert.ok(matchers.includes('Bash'), 'Missing Bash matcher in PreToolUse');
    assert.ok(matchers.includes('Edit'), 'Missing Edit matcher in PreToolUse');
    assert.ok(matchers.includes('Write'), 'Missing Write matcher in PreToolUse');
    assert.ok(matchers.includes('Delete'), 'Missing Delete matcher in PreToolUse');
  });

  test('all hook entries have required fields', () => {
    function validateHooks(entries, context) {
      for (const entry of entries) {
        if (entry.hooks) {
          for (const hook of entry.hooks) {
            assert.ok(hook.type, `${context}: hook missing "type" field`);
            assert.ok(hook.command, `${context}: hook missing "command" field`);
            assert.ok(hook.description, `${context}: hook missing "description" field`);
          }
        }
      }
    }

    for (const [event, entries] of Object.entries(hooksConfig.hooks)) {
      if (Array.isArray(entries)) {
        validateHooks(entries, event);
      }
    }
  });

  test('Scheduled hooks have interval field', () => {
    const scheduled = hooksConfig.hooks.Scheduled;
    for (const entry of scheduled) {
      assert.ok(entry.interval !== undefined, `Scheduled hook "${entry.id}" missing interval`);
      assert.ok(entry.command, `Scheduled hook "${entry.id}" missing command`);
    }
  });

  test('known critical scripts are referenced', () => {
    const allCommands = [];
    for (const entries of Object.values(hooksConfig.hooks)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (entry.hooks) {
          entry.hooks.forEach(h => allCommands.push(h.command));
        }
        if (entry.command) allCommands.push(entry.command);
      }
    }

    const commandList = allCommands.join(' ');
    assert.ok(commandList.includes('safety-guard.js'), 'safety-guard.js not referenced');
    assert.ok(commandList.includes('block-no-verify.js'), 'block-no-verify.js not referenced');
    assert.ok(commandList.includes('commit-quality.js'), 'commit-quality.js not referenced');
    assert.ok(commandList.includes('config-protection.js'), 'config-protection.js not referenced');
  });
});
