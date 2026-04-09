#!/usr/bin/env node
// format-typecheck.js — Stop hook: 批量格式化 + 类型检查所有编辑过的文件
// 来源: ECC stop:format-typecheck（edit-accumulator 模式）

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const LOG_DIR = path.join(os.homedir(), '.claude', 'logs');
const ACCUMULATOR_FILE = path.join(LOG_DIR, 'edited-files.json');

// 读取累积的编辑文件列表
let editedFiles = [];
try {
  const data = JSON.parse(fs.readFileSync(ACCUMULATOR_FILE, 'utf8'));
  editedFiles = data.files || [];
} catch (e) {
  // no accumulated files
  process.exit(0);
}

if (editedFiles.length === 0) {
  process.exit(0);
}

// 过滤出存在的文件
const existingFiles = editedFiles.filter(f => {
  try { return fs.existsSync(f); } catch { return false; }
});

if (existingFiles.length === 0) {
  process.exit(0);
}

console.log(`[FORMAT-TYPECHECK] 处理 ${existingFiles.length} 个编辑过的文件...`);

let hasErrors = false;

// 1. 格式化（尝试 Prettier 或 Biome）
const tsJsFiles = existingFiles.filter(f => /\.(ts|tsx|js|jsx)$/.test(f));
if (tsJsFiles.length > 0) {
  try {
    // 尝试 npx prettier
    const filesArg = tsJsFiles.join(' ');
    execSync(`npx prettier --write ${filesArg}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000
    });
    console.log(`[FORMAT] ✓ Prettier 格式化完成 (${tsJsFiles.length} 文件)`);
  } catch (e) {
    // prettier not available, try biome
    try {
      execSync(`npx biome format --write ${tsJsFiles.join(' ')}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000
      });
      console.log(`[FORMAT] ✓ Biome 格式化完成 (${tsJsFiles.length} 文件)`);
    } catch (e2) {
      console.log('[FORMAT] ⚠ 无可用的格式化工具 (Prettier/Biome)');
    }
  }
}

// 2. 类型检查（TypeScript 文件）
const tsFiles = existingFiles.filter(f => /\.(ts|tsx)$/.test(f));
if (tsFiles.length > 0) {
  try {
    // 对单个文件进行类型检查
    for (const file of tsFiles) {
      try {
        execSync(`npx tsc --noEmit --pretty "${file}"`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000
        });
      } catch (e) {
        const output = e.stdout || e.stderr || '';
        if (output.includes('error TS')) {
          console.log(`[TYPECHECK] ✗ ${file}:`);
          console.log(output.split('\n').slice(0, 5).join('\n'));
          hasErrors = true;
        }
      }
    }
    if (!hasErrors) {
      console.log(`[TYPECHECK] ✓ 类型检查通过 (${tsFiles.length} 文件)`);
    }
  } catch (e) {
    console.log('[TYPECHECK] ⚠ TypeScript 编译器不可用');
  }
}

// 3. Java 文件格式化
const javaFiles = existingFiles.filter(f => /\.java$/.test(f));
if (javaFiles.length > 0) {
  console.log(`[JAVA] ${javaFiles.length} 个 Java 文件已编辑，建议手动运行 mvn spotless:apply`);
}

// 4. Python 文件格式化
const pyFiles = existingFiles.filter(f => /\.py$/.test(f));
if (pyFiles.length > 0) {
  try {
    execSync(`python -m ruff format ${pyFiles.join(' ')}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000
    });
    console.log(`[FORMAT] ✓ Ruff 格式化完成 (${pyFiles.length} 文件)`);
  } catch (e) {
    console.log('[FORMAT] ⚠ Ruff 不可用，跳过 Python 格式化');
  }
}

// 清空累积列表
try {
  fs.writeFileSync(ACCUMULATOR_FILE, JSON.stringify({ files: [], timestamp: Date.now() }, null, 2));
} catch (e) {
  // ignore
}

if (hasErrors) {
  console.log('[FORMAT-TYPECHECK] ⚠ 存在类型错误，请修复后再提交');
}

process.exit(0);
