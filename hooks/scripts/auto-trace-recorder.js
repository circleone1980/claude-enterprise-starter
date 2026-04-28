#!/usr/bin/env node

/**
 * @module hooks/scripts/auto-trace-recorder
 * @version 1.0.0
 * @since 2026-04-28
 * @description PostToolUse 自动记录 — Skill/Agent/TeamCreate 调用后追加审计日志
 *
 * 产出: .claude/logs/trace-audit.jsonl（只追加，不可修改）
 * 此文件是过程追踪真实性验证的唯一数据源
 *
 * Changelog:
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const LOGS_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const AUDIT_FILE = path.join(LOGS_DIR, 'trace-audit.jsonl');

// 确保目录存在
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// 从 stdin 读取工具输入和输出
let toolInput = {};
let toolOutput = '';
try {
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) {
    const parsed = JSON.parse(input);
    toolInput = parsed.tool_input || parsed.input || parsed;
    toolOutput = parsed.tool_output || parsed.output || '';
  }
} catch {
  process.exit(0);
}

// 从环境变量或上下文推断工具名
const toolName = process.env.CE_TOOL_NAME || 'unknown';

// 构建 audit 记录
const record = {
  timestamp: new Date().toISOString(),
  tool: toolName,
};

// 根据 tool 类型提取关键信息
if (toolInput.skill) {
  record.skill = toolInput.skill;
  record.args = toolInput.args || '';
}

if (toolInput.name) {
  record.agentName = toolInput.name;
  record.subagentType = toolInput.subagent_type || '';
}

if (toolInput.team_name) {
  record.teamName = toolInput.team_name;
}

if (toolInput.file_path || toolInput.path) {
  record.targetFile = path.relative(PROJECT_ROOT, toolInput.file_path || toolInput.path || '').replace(/\\/g, '/');
}

// 追加写入 JSONL（每行一条记录）
const line = JSON.stringify(record) + '\n';
fs.appendFileSync(AUDIT_FILE, line);

process.exit(0);
