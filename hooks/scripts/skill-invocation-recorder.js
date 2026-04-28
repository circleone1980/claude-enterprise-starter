#!/usr/bin/env node

/**
 * @module hooks/scripts/skill-invocation-recorder
 * @version 1.0.0
 * @since 2026-04-28
 * @description PostToolUse 记录 — Skill 调用后自动创建 marker 文件
 *
 * Changelog:
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const INVOCATION_DIR = path.join(PROJECT_ROOT, '.claude', 'logs', 'skill-invocations');

// 确保目录存在
if (!fs.existsSync(INVOCATION_DIR)) {
  fs.mkdirSync(INVOCATION_DIR, { recursive: true });
}

// 从 stdin 读取工具输入
let toolInput = {};
try {
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const skillName = toolInput.skill || '';
if (!skillName) process.exit(0);

// 创建 marker 文件
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const markerFile = path.join(INVOCATION_DIR, `${timestamp}-${skillName}.json`);

const markerData = {
  skill: skillName,
  timestamp: new Date().toISOString(),
  args: toolInput.args || '',
};

fs.writeFileSync(markerFile, JSON.stringify(markerData, null, 2));

process.exit(0);
