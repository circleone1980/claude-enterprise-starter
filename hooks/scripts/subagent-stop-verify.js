#!/usr/bin/env node

/**
 * subagent-stop-verify.js — SubagentStop 产出物验证
 *
 * 检查 subagent 的输出是否包含预期产出物。
 * 未合规 → exit(2) 阻止结束。
 * 合规 → 记录到 trace-audit.jsonl。
 *
 * 触发: SubagentStop
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const AGENTS_DIR = path.join(PROJECT_ROOT, 'agents');
const AUDIT_FILE = path.join(PROJECT_ROOT, '.claude', 'logs', 'trace-audit.jsonl');

// Skip if disabled
if (process.env.CE_SKIP_STOP_VERIFY === '1') {
  process.exit(0);
}

// Read stdin
let toolInput = {};
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const subagentType = toolInput.subagent_type || toolInput.subagentType || '';
const prompt = toolInput.prompt || '';
const output = toolInput.output || toolInput.tool_output || '';

// Determine role name
let roleName = subagentType;

// If subagentType is not a known local agent, try to extract from prompt
const localMdPath = path.join(AGENTS_DIR, `${roleName}.md`);
if (!fs.existsSync(localMdPath)) {
  const match = prompt.match(/你是\s+(\S+)/);
  if (match) roleName = match[1];
}

// Unknown role — allow without checking
const agentMdPath = path.join(AGENTS_DIR, `${roleName}.md`);
if (!fs.existsSync(agentMdPath)) {
  process.exit(0);
}

// For known agents, check if output has meaningful content
// (at least 100 chars of non-whitespace output)
const trimmedOutput = (typeof output === 'string' ? output : JSON.stringify(output)).trim();
if (trimmedOutput.length < 100) {
  console.error(`\n[SubagentStop 验证] 角色 ${roleName} 输出不足`);
  console.error(`  输出长度: ${trimmedOutput.length} 字符（要求 >= 100）`);
  console.error(`  解决: 确保完成任务并输出结果\n`);
  process.exit(2);
}

// Record to audit log
try {
  const logsDir = path.join(PROJECT_ROOT, '.claude', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const entry = {
    timestamp: new Date().toISOString(),
    event: 'subagent-stop',
    role: roleName,
    subagentType,
    outputLength: trimmedOutput.length,
    passed: true,
  };

  fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + '\n');
} catch { /* audit logging is best-effort */ }

process.exit(0);
