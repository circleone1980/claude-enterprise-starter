#!/usr/bin/env node
// suggest-compact.js — 在逻辑节点建议压缩上下文
// 来源: ECC pre:edit-write:suggest-compact
// 配合 skills/strategic-compact 使用

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.claude', 'logs');
const COUNT_FILE = path.join(LOG_DIR, 'tool-call-count.json');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 读取当前计数
let data = { count: 0, lastCompactAt: 0, lastReminderAt: 0 };
try {
  data = JSON.parse(fs.readFileSync(COUNT_FILE, 'utf8'));
} catch (e) {
  // first run
}

data.count++;

const THRESHOLD = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);
const REMIND_INTERVAL = parseInt(process.env.COMPACT_REMIND_INTERVAL || '25', 10);

// 检查是否需要建议压缩
if (data.count >= THRESHOLD && (data.count - data.lastReminderAt) >= REMIND_INTERVAL) {
  console.log(`[CONTEXT] 已执行 ${data.count} 次工具调用，建议使用 /compact 压缩上下文`);
  console.log(`[CONTEXT] 当前阈值: ${THRESHOLD} 次调用，提醒间隔: ${REMIND_INTERVAL} 次`);
  console.log('[CONTEXT] 最佳压缩时机: 阶段切换、研究→规划、调试→新功能');
  data.lastReminderAt = data.count;
}

// 保存计数
try {
  fs.writeFileSync(COUNT_FILE, JSON.stringify(data, null, 2));
} catch (e) {
  // ignore write failures
}

process.exit(0);
