const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../../hooks/scripts/config-protection.js');

/**
 * 通过子进程运行 config-protection.js
 * @param {string} filePath - 模拟的 FILE_PATH
 * @returns {{ exitCode: number, stderr: string, stdout: string }}
 */
function runConfigProtection(filePath) {
  try {
    const result = execSync(`node "${scriptPath}"`, {
      env: { ...process.env, FILE_PATH: filePath },
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

describe('config-protection.js - protected config files', () => {
  test('blocks eslint.config.js', () => {
    const result = runConfigProtection('eslint.config.js');
    assert.strictEqual(result.exitCode, 2);
    assert.ok(result.stderr.includes('[PROTECTED]'), `Expected [PROTECTED], got: ${result.stderr}`);
  });

  test('blocks eslint.config.ts', () => {
    const result = runConfigProtection('eslint.config.ts');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks .eslintrc.json', () => {
    const result = runConfigProtection('.eslintrc.json');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks .eslintrc.js', () => {
    const result = runConfigProtection('.eslintrc.js');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks .eslintrc.yml', () => {
    const result = runConfigProtection('.eslintrc.yml');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks tsconfig.json', () => {
    const result = runConfigProtection('tsconfig.json');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks tsconfig.node.json', () => {
    const result = runConfigProtection('tsconfig.node.json');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks vite.config.ts', () => {
    const result = runConfigProtection('vite.config.ts');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks vitest.config.ts', () => {
    const result = runConfigProtection('vitest.config.ts');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks package.json', () => {
    const result = runConfigProtection('package.json');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks biome.json', () => {
    const result = runConfigProtection('biome.json');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks prettier.config.js', () => {
    const result = runConfigProtection('prettier.config.js');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks .prettierrc', () => {
    const result = runConfigProtection('.prettierrc');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks .editorconfig', () => {
    const result = runConfigProtection('.editorconfig');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks babel.config.js', () => {
    const result = runConfigProtection('babel.config.js');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks next.config.js', () => {
    const result = runConfigProtection('next.config.js');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks jest.config.js', () => {
    const result = runConfigProtection('jest.config.js');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks pnpm-workspace.yaml', () => {
    const result = runConfigProtection('pnpm-workspace.yaml');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks config with full Windows path (backslash normalization)', () => {
    const result = runConfigProtection('C:\\projects\\myapp\\tsconfig.json');
    assert.strictEqual(result.exitCode, 2);
  });

  test('blocks config with full Unix path', () => {
    const result = runConfigProtection('/home/user/project/vite.config.js');
    assert.strictEqual(result.exitCode, 2);
  });
});

describe('config-protection.js - allowed files', () => {
  test('allows normal source file', () => {
    const result = runConfigProtection('src/index.ts');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows README.md', () => {
    const result = runConfigProtection('README.md');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows CLAUDE.md', () => {
    const result = runConfigProtection('CLAUDE.md');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows test file', () => {
    const result = runConfigProtection('test/hooks/config-protection.test.js');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows component file', () => {
    const result = runConfigProtection('src/components/Button.tsx');
    assert.strictEqual(result.exitCode, 0);
  });

  test('allows empty string', () => {
    const result = runConfigProtection('');
    assert.strictEqual(result.exitCode, 0);
  });

  test('error message mentions ADR process', () => {
    const result = runConfigProtection('tsconfig.json');
    assert.ok(
      result.stderr.includes('ADR'),
      `Expected ADR mention in stderr, got: ${result.stderr}`
    );
  });
});
