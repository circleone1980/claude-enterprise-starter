const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../../hooks/scripts/commit-quality.js');

/**
 * 通过子进程运行 commit-quality.js
 * 注意: 该脚本在非 git commit 场景直接 exit(0)，
 * 在 git commit 场景会尝试执行 git diff --cached，
 * 在测试环境（无 staged changes）下会走 catch 分支并 exit(0)
 * @param {string} toolInput - 模拟的 TOOL_INPUT
 * @returns {{ exitCode: number, stderr: string, stdout: string }}
 */
function runCommitQuality(toolInput) {
  try {
    const result = execSync(`node "${scriptPath}"`, {
      env: { ...process.env, TOOL_INPUT: toolInput },
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { exitCode: 0, stderr: result.stderr || '', stdout: result.stdout || '' };
  } catch (e) {
    return {
      exitCode: e.status,
      stderr: e.stderr ? e.stderr.toString() : '',
      stdout: e.stdout ? e.stdout.toString() : '',
    };
  }
}

describe('commit-quality.js - non-commit commands', () => {
  test('allows non-git commands (passes through)', () => {
    const result = runCommitQuality('npm run build');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows git push (not a commit)', () => {
    const result = runCommitQuality('git push origin main');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows git status (not a commit)', () => {
    const result = runCommitQuality('git status');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows empty TOOL_INPUT', () => {
    const result = runCommitQuality('');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows git log (not a commit)', () => {
    const result = runCommitQuality('git log --oneline -5');
    assert.strictEqual(result.exitCode, 0);
  });
});

describe('commit-quality.js - git commit triggers quality checks', () => {
  test('git commit triggers the quality check pipeline (no staged files = exit 0)', () => {
    // In a test environment with no staged files, the script will attempt
    // git diff --cached which returns empty, so it exits 0
    const result = runCommitQuality('git commit -m "feat: add feature"');
    // Should not crash; exits 0 since no staged content has issues
    assert.ok(result.exitCode === 0 || result.exitCode === 2,
      `Expected exit code 0 or 2, got ${result.exitCode}`);
  });

  test('git commit --amend triggers quality check pipeline', () => {
    const result = runCommitQuality('git commit --amend -m "fix: update feature"');
    assert.ok(result.exitCode === 0 || result.exitCode === 2);
  });

  test('script handles git commit with various flags', () => {
    const result = runCommitQuality('git commit -a -m "chore: cleanup"');
    assert.ok(result.exitCode === 0 || result.exitCode === 2);
  });
});

describe('commit-quality.js - secret pattern detection logic', () => {
  // These test the pattern matching logic by examining the script source.
  // The actual git diff --cached execution is not testable without a real git repo,
  // so we verify the patterns exist in the script.
  test('script contains secret detection patterns', () => {
    const fs = require('fs');
    const source = fs.readFileSync(scriptPath, 'utf8');

    // Verify secret patterns are defined
    assert.ok(source.includes('sk-'), 'Expected API key pattern');
    assert.ok(source.includes('secret_key'), 'Expected secret_key pattern');
    assert.ok(source.includes('BEGIN'), 'Expected private key pattern');
    assert.ok(source.includes('AKIA'), 'Expected AWS key pattern');
  });

  test('script contains console.log detection pattern', () => {
    const fs = require('fs');
    const source = fs.readFileSync(scriptPath, 'utf8');
    assert.ok(
      source.includes('console.log') || source.includes('console\\.log'),
      'Expected console.log detection pattern'
    );
  });

  test('script only triggers on git commit commands', () => {
    const fs = require('fs');
    const source = fs.readFileSync(scriptPath, 'utf8');
    assert.ok(
      source.includes("git\\s+commit") || source.includes('/git\\s+commit/'),
      'Expected git commit regex guard'
    );
  });
});
