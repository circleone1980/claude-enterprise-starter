#!/usr/bin/env node

/**
 * @module hooks/scripts/team-creation-recorder
 * @version 1.0.0
 * @since 2026-04-28
 * @description PostToolUse 记录 — TeamCreate 后自动创建 marker 文件
 *
 * Changelog:
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const LOGS_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const TEAM_MARKER = path.join(LOGS_DIR, 'team-created.marker');

// 确保目录存在
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// 从 stdin 读取工具输入
let toolInput = {};
try {
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const teamName = toolInput.team_name || 'unknown';

const markerData = {
  teamName,
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(TEAM_MARKER, JSON.stringify(markerData, null, 2));

process.exit(0);
