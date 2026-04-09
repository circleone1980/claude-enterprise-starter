#!/usr/bin/env node
// session-evaluate.js — Stop hook: 评估会话可提取模式（持续学习）
// 配合 skills/continuous-learning 使用

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.claude', 'logs');
const ACCUMULATOR_FILE = path.join(LOG_DIR, 'edited-files.json');
const SESSION_FILE = path.join(LOG_DIR, 'session-summary.json');

// 读取本次编辑的文件列表
let editedFiles = [];
try {
  const data = JSON.parse(fs.readFileSync(ACCUMULATOR_FILE, 'utf8'));
  editedFiles = data.files || [];
} catch (e) {
  // no data
}

// 统计信息
const summary = {
  timestamp: new Date().toISOString(),
  editedFileCount: editedFiles.length,
  editedFiles: editedFiles,
  languageBreakdown: {},
};

// 语言分布
for (const f of editedFiles) {
  const ext = path.extname(f);
  const lang = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.java': 'Java',
    '.py': 'Python',
    '.vue': 'Vue',
    '.svelte': 'Svelte',
  }[ext] || 'Other';

  summary.languageBreakdown[lang] = (summary.languageBreakdown[lang] || 0) + 1;
}

// 保存会话摘要
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

try {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(summary, null, 2));
} catch (e) {
  // ignore write failures
}

// 输出摘要
if (editedFiles.length > 0) {
  console.log(`[SESSION] 本次会话编辑了 ${editedFiles.length} 个文件`);
  const langs = Object.entries(summary.languageBreakdown);
  if (langs.length > 0) {
    console.log(`[SESSION] 语言分布: ${langs.map(([l, c]) => `${l}(${c})`).join(', ')}`);
  }
  console.log('[SESSION] 会话摘要已保存到 ~/.claude/logs/session-summary.json');
}

process.exit(0);
