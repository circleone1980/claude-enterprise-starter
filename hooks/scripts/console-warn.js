#!/usr/bin/env node
// console-warn.js — PostToolUse 检测编辑文件中的 console.log
// 来源: ECC post:edit:console-warn

const fs = require('fs');
const filePath = process.env.FILE_PATH || process.env.TOOL_INPUT || '';

if (!filePath || !fs.existsSync(filePath)) {
  process.exit(0);
}

// 只检查 JS/TS 文件
if (!/\.(ts|tsx|js|jsx|vue|svelte)$/.test(filePath)) {
  process.exit(0);
}

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const consoleLines = [];

  lines.forEach((line, idx) => {
    if (/console\.(log|debug|info)\(/.test(line)) {
      consoleLines.push({ line: idx + 1, content: line.trim() });
    }
  });

  if (consoleLines.length > 0) {
    console.log(`[CONSOLE.WARN] ${filePath} 包含 ${consoleLines.length} 处 console.log/debug/info:`);
    consoleLines.forEach(({ line, content }) => {
      console.log(`  L${line}: ${content}`);
    });
    console.log('[CONSOLE.WARN] 生产代码不应包含调试日志，建议移除或替换为 logger');
  }
} catch (e) {
  // read error, skip
}

process.exit(0);
