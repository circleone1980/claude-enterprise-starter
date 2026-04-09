#!/usr/bin/env node
// edit-accumulator.js — PostToolUse 累积编辑的 JS/TS 文件路径
// 来源: ECC post:edit:accumulator
// 配合 stop:format-typecheck 使用，Stop 时批量处理

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.claude', 'logs');
const ACCUMULATOR_FILE = path.join(LOG_DIR, 'edited-files.json');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 读取当前累积列表
let data = { files: [], timestamp: Date.now() };
try {
  data = JSON.parse(fs.readFileSync(ACCUMULATOR_FILE, 'utf8'));
} catch (e) {
  // first run
}

// 从环境变量获取编辑的文件路径
const filePath = process.env.FILE_PATH || process.env.TOOL_INPUT || '';

if (filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');

  // 只累积 JS/TS/Java/Python 文件
  const trackableExtensions = /\.(ts|tsx|js|jsx|java|py|vue|svelte)$/;
  if (trackableExtensions.test(normalizedPath)) {
    // 避免重复
    if (!data.files.includes(normalizedPath)) {
      data.files.push(normalizedPath);
      data.timestamp = Date.now();
    }
  }
}

// 保存
try {
  fs.writeFileSync(ACCUMULATOR_FILE, JSON.stringify(data, null, 2));
} catch (e) {
  // ignore write failures
}

process.exit(0);
