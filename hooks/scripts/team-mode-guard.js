#!/usr/bin/env node

/**
 * @module hooks/scripts/team-mode-guard
 * @version 1.0.0
 * @since 2026-04-28
 * @description PreToolUse 守卫 — Phase 1 写冻结层文档前验证 Team 已创建
 *
 * Changelog:
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const PHASE_FILE = path.join(PROJECT_ROOT, '.claude', 'logs', 'current-phase.json');
const TEAM_MARKER = path.join(PROJECT_ROOT, '.claude', 'logs', 'team-created.marker');

// 冻结层文档路径前缀
const FROZEN_PREFIXES = [
  'docs/design/',
  'docs/requirements/',
];

// 如果没有阶段文件，放行
if (!fs.existsSync(PHASE_FILE)) process.exit(0);

let currentPhase;
try {
  const data = JSON.parse(fs.readFileSync(PHASE_FILE, 'utf-8'));
  currentPhase = parseInt(data.currentPhase, 10);
  if (isNaN(currentPhase)) currentPhase = 0;
} catch {
  currentPhase = 0;
}

// 仅 Phase 1 生效
if (currentPhase !== 1) process.exit(0);

// 从 stdin 读取工具输入
let toolInput = {};
try {
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';
if (!filePath) process.exit(0);

const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

// 检查是否是冻结层文档
const isFrozenDoc = FROZEN_PREFIXES.some(prefix => relPath.startsWith(prefix));
if (!isFrozenDoc) process.exit(0);

// 检查 Team marker 是否存在
if (!fs.existsSync(TEAM_MARKER)) {
  console.error(`\n[Team Guard] Phase 1 冻结层文档写入被拦截！`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  当前阶段: Phase 1（需求分析）`);
  console.error(`  原因: Phase 1 必须通过 TeamCreate 创建团队后再写冻结层文档`);
  console.error(`  解决: 先执行 TeamCreate 创建团队，再写文档`);
  console.error(`  参考: Rule 10 mode_selection.md — Phase 1 总分 7，应使用 Team 模式\n`);
  process.exit(1);
}

process.exit(0);
