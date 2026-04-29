#!/usr/bin/env node

/**
 * subagent-role-bind.js — SubagentStart 角色注入
 *
 * 非 Team 场景下，独立 subagent 通过此 hook 获得角色定义。
 * Team teammate 已通过 subagent_type 原生加载 .claude/agents/*.md，无需此 hook。
 *
 * 触发: SubagentStart（所有 subagent 类型）
 * 输出: additionalContext 注入角色定义 + SOP + Skill 列表
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const AGENTS_DIR = path.join(PROJECT_ROOT, 'agents');
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const PHASE_FILE = path.join(PHASE_LOG_DIR, 'current-phase.json');

// Skip if disabled
if (process.env.CE_SKIP_ROLE_BIND === '1') {
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

// If subagent_type is a local agent name (matches agents/*.md), skip — native loading handles it
const localMdPath = path.join(AGENTS_DIR, `${subagentType}.md`);
if (fs.existsSync(localMdPath)) {
  // Native loading already provides the role definition
  process.exit(0);
}

// Try to extract role name from prompt
const rolePatterns = [
  /你是\s+(\S+)/,
  /你的角色[是为]\s+(\S+)/,
  /role:\s*(\S+)/i,
];

let roleName = '';
for (const pattern of rolePatterns) {
  const match = prompt.match(pattern);
  if (match) {
    roleName = match[1];
    break;
  }
}

// If no role name found, inject a generic reminder
if (!roleName) {
  const output = {
    decision: 'allow',
    additionalContext: [
      '## Agent 角色提醒',
      '你是一个独立 subagent，执行一次性任务。',
      '完成后请确保产出物符合预期格式。',
      '',
      '如果任务涉及代码修改，请先读取 agents/ 目录下的对应角色定义文件。',
    ].join('\n'),
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

// Read agent .md for the matched role
const agentMdPath = path.join(AGENTS_DIR, `${roleName}.md`);
if (!fs.existsSync(agentMdPath)) {
  // Unknown role — just allow with generic reminder
  const output = {
    decision: 'allow',
    additionalContext: `## Agent 角色\n角色 "${roleName}" 未找到对应定义文件。按最佳实践执行任务。`,
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

// Parse agent .md — extract body (after frontmatter)
const content = fs.readFileSync(agentMdPath, 'utf-8');
const frontmatterEnd = content.indexOf('---', 4);
const body = frontmatterEnd >= 0 ? content.slice(frontmatterEnd + 3).trim() : content;

// Read current phase
let currentPhase = 'unknown';
if (fs.existsSync(PHASE_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(PHASE_FILE, 'utf-8'));
    currentPhase = data.currentPhase || 'unknown';
  } catch { /* fallback */ }
}

// Load SSOT for skill list
let skills = [];
const ssotPath = path.join(PROJECT_ROOT, 'automation', 'agent-orchestration.json');
if (fs.existsSync(ssotPath)) {
  try {
    const ssot = JSON.parse(fs.readFileSync(ssotPath, 'utf-8'));
    // Case-insensitive lookup: "backend-python" → "Backend-Python"
    const agentKey = Object.keys(ssot.agents).find(
      k => k.toLowerCase() === roleName.toLowerCase()
    );
    const agent = agentKey ? ssot.agents[agentKey] : null;
    if (agent && agent.requiredSkills) {
      skills = agent.requiredSkills;
    }
  } catch { /* fallback */ }
}

const additionalContext = [
  `## 你的角色定义（强制遵循）`,
  body,
  '',
  `## 当前阶段`,
  `Phase ${currentPhase}`,
  '',
  `## 必须调用的 Skills`,
  ...skills.map(s => `- 调用 Skill ${s}`),
].join('\n');

const output = {
  decision: 'allow',
  additionalContext,
};

console.log(JSON.stringify(output));
process.exit(0);
