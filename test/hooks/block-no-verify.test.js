const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../../hooks/scripts/block-no-verify.js');

/**
 * 通过子进程运行 block-no-verify.js，传入 TOOL_INPUT 环境变量
 * @param {string} command - 模拟的 bash 命令
 * @returns {{ exitCode: number, stderr: string, stdout: string }}
 */
function runBlock(command) {
  try {
    const result = execSync(`node "${scriptPath}"`, {
      env: { ...process.env, TOOL_INPUT: command },
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

describe('block-no-verify.js', () => {
  test('blocks git push --no-verify', () => {
    const result = runBlock('git push --no-verify');
    assert.strictEqual(result.exitCode, 2);
    assert.ok(result.stderr.includes('[BLOCKED]'), `Expected [BLOCKED] in stderr, got: ${result.stderr}`);
  });

  test('blocks git push --no-verify-sign', () => {
    const result = runBlock('git push --no-verify-sign');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks git push --force', () => {
    const result = runBlock('git push --force');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks git push -f origin main', () => {
    const result = runBlock('git push -f origin main');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks git commit --no-verify', () => {
    const result = runBlock('git commit --no-verify -m "test"');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks git commit --no-gpg-sign', () => {
    const result = runBlock('git commit --no-gpg-sign -m "test"');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks git commit -n with trailing space', () => {
    const result = runBlock('git commit -n -m "test"');
    assert.strictEqual(result.exitCode, 2);
  });

  test('allows normal git push', () => {
    const result = runBlock('git push origin main');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows normal git commit', () => {
    const result = runBlock('git commit -m "feat: add feature"');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows empty string', () => {
    const result = runBlock('');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows unrelated commands', () => {
    const result = runBlock('npm install');
    assert.strictEqual(result.exitCode, 0);
  });

  test('error message mentions quality checks', () => {
    const result = runBlock('git push --no-verify');
    assert.ok(
      result.stderr.includes('质量检查') || result.stderr.includes('hooks'),
      `Expected quality/hooks mention in stderr, got: ${result.stderr}`
    );
  });
});
