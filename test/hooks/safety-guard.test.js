const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../../hooks/scripts/safety-guard.js');

/**
 * 通过子进程运行 safety-guard.js
 * @param {object} env - 额外环境变量
 * @returns {{ exitCode: number, stderr: string, stdout: string }}
 */
function runGuard(env = {}) {
  try {
    const stdout = execSync(`node "${scriptPath}"`, {
      env: { ...process.env, ...env },
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { exitCode: 0, stdout: stdout || '', stderr: '' };
  } catch (e) {
    return {
      exitCode: e.status,
      stdout: e.stdout ? e.stdout.toString() : '',
      stderr: e.stderr ? e.stderr.toString() : '',
    };
  }
}

describe('safety-guard.js - file path checks', () => {
  test('allows project-internal file path', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const internalPath = path.join(projectRoot, 'src', 'index.ts');
    const result = runGuard({
      FILE_PATH: internalPath,
      PROJECT_ROOT: projectRoot,
    });
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.stdout.includes('ALLOWED'), `Expected ALLOWED in stdout, got: ${result.stdout}`);
  });

  test('blocks file path outside project directory', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const outsidePath = path.resolve('/tmp/outside-project/file.txt');
    const result = runGuard({
      FILE_PATH: outsidePath,
      PROJECT_ROOT: projectRoot,
    });
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.stderr.includes('BLOCKED'), `Expected BLOCKED in stderr, got: ${result.stderr}`);
  });

  test('blocks protected path - ~/.ssh', () => {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) return; // skip on unusual platforms
    const projectRoot = path.resolve(__dirname, '../..');
    const result = runGuard({
      FILE_PATH: path.join(homeDir, '.ssh', 'id_rsa'),
      PROJECT_ROOT: projectRoot,
    });
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.stderr.includes('Protected path') || result.stderr.includes('BLOCKED'),
      `Expected protected path error in stderr, got: ${result.stderr}`);
  });

  test('blocks protected path - ~/.gnupg', () => {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) return;
    const projectRoot = path.resolve(__dirname, '../..');
    const result = runGuard({
      FILE_PATH: path.join(homeDir, '.gnupg', 'secring.gpg'),
      PROJECT_ROOT: projectRoot,
    });
    assert.strictEqual(result.exitCode, 1);
  });

  test('allows empty FILE_PATH', () => {
    const result = runGuard({ FILE_PATH: '' });
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows when no env vars set', () => {
    const result = runGuard({});
    assert.strictEqual(result.exitCode, 0);
  });
});

describe('safety-guard.js - dangerous command checks', () => {
  test('blocks rm -rf /', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'rm -rf /' });
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.stderr.includes('Dangerous command'),
      `Expected "Dangerous command" in stderr, got: ${result.stderr}`);
  });

  test('blocks rm -rf ~', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'rm -rf ~' });
    assert.strictEqual(result.exitCode, 1);
  });

  test('blocks sudo command', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'sudo apt install something' });
    assert.strictEqual(result.exitCode, 1);
  });

  test('blocks chmod 777', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'chmod 777 /var/www' });
    assert.strictEqual(result.exitCode, 1);
  });

  test('blocks dd command', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'dd if=/dev/zero of=/dev/sda' });
    assert.strictEqual(result.exitCode, 1);
  });

  test('allows safe npm command', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'npm install lodash' });
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows safe git command', () => {
    const result = runGuard({ TOOL_NAME: 'Bash', TOOL_INPUT: 'git status' });
    assert.strictEqual(result.exitCode, 0);
  });

  test('does not block dangerous command when TOOL_NAME is not Bash', () => {
    const result = runGuard({ TOOL_NAME: 'Edit', TOOL_INPUT: 'rm -rf /' });
    assert.strictEqual(result.exitCode, 0);
  });
});
