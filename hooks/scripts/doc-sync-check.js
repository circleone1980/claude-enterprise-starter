#!/usr/bin/env node
// doc-sync-check.js — Stop hook: 提醒同步文档（对应规则 00_global.md）
// 在响应结束时检查是否有未同步的文档变更

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const LOG_DIR = path.join(os.homedir(), '.claude', 'logs');
const ACCUMULATOR_FILE = path.join(LOG_DIR, 'edited-files.json');

// 读取本次编辑的文件列表
let editedFiles = [];
try {
  const data = JSON.parse(fs.readFileSync(ACCUMULATOR_FILE, 'utf8'));
  editedFiles = data.files || [];
} catch (e) {
  process.exit(0);
}

// 需要触发文档同步检查的文件模式
const docTriggerPatterns = [
  /^skills\/.*\/SKILL\.md$/,
  /^agents\/.*\.md$/,
  /^automation\/.*\.json$/,
  /^hooks\/.*$/,
  /^commands\/.*\.md$/,
  /^rules\/.*\.md$/,
  /^CLAUDE\.md$/,
];

const needsSync = editedFiles.filter(f =>
  docTriggerPatterns.some(p => p.test(f.replace(/\\/g, '/')))
);

if (needsSync.length > 0) {
  console.log('[DOC-SYNC] 检测到以下配置文件被修改:');
  needsSync.forEach(f => console.log(`  - ${f}`));
  console.log('');
  console.log('[DOC-SYNC] 根据规则 00_global.md，退出前必须同步:');
  console.log('  1. README.md — 目录结构、技能表、角色表');
  console.log('  2. docs/GUIDE.md — 配置说明、使用方法');
  console.log('  3. CLAUDE.md — 技能引用、角色引用');
  console.log('');
  console.log('[DOC-SYNC] 未完成同步前，不得退出 Claude Code');
}

process.exit(0);
