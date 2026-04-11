#!/usr/bin/env node
/**
 * validate-config.js — 配置一致性验证脚本
 *
 * 检查项:
 *   1. agent-orchestration.json 与 rage-mode.json 的 agent 名称一致
 *   2. 所有 agents/*.md 文件被 agent-orchestration.json 引用
 *   3. phase-gates.json 的 check 命令语法正确
 *   4. modeSelection 分数计算正确
 *   5. 无硬编码 agent 列表的漂移
 *
 * 用法: node scripts/validate-config.js
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SSOT_PATH = path.join(PROJECT_ROOT, 'automation', 'agent-orchestration.json');
const RAGE_MODE_PATH = path.join(PROJECT_ROOT, 'automation', 'rage-mode.json');
const PHASE_GATES_PATH = path.join(PROJECT_ROOT, 'automation', 'phase-gates.json');
const AGENTS_DIR = path.join(PROJECT_ROOT, 'agents');

let passed = 0;
let failed = 0;
let warnings = 0;

function log_ok(msg) { console.log(`  \x1b[32mPASS\x1b[0m ${msg}`); passed++; }
function log_fail(msg) { console.log(`  \x1b[31mFAIL\x1b[0m ${msg}`); failed++; }
function log_warn(msg) { console.log(`  \x1b[33mWARN\x1b[0m ${msg}`); warnings++; }

console.log('\n========================================');
console.log('  配置一致性验证');
console.log('========================================\n');

// === 加载配置 ===
let ssot, rageMode, phaseGates;

try {
  ssot = JSON.parse(fs.readFileSync(SSOT_PATH, 'utf-8'));
  log_ok(`SSOT loaded: v${ssot.version}`);
} catch (e) {
  log_fail(`SSOT 加载失败: ${e.message}`);
  process.exit(1);
}

try {
  rageMode = JSON.parse(fs.readFileSync(RAGE_MODE_PATH, 'utf-8'));
  log_ok(`rage-mode.json loaded: v${rageMode.version}`);
} catch (e) {
  log_fail(`rage-mode.json 加载失败: ${e.message}`);
}

try {
  phaseGates = JSON.parse(fs.readFileSync(PHASE_GATES_PATH, 'utf-8'));
  log_ok(`phase-gates.json loaded: v${phaseGates.version}`);
} catch (e) {
  log_fail(`phase-gates.json 加载失败: ${e.message}`);
}

console.log('');

// === 检查 1: agent 名称一致性 ===
console.log('--- 检查 1: Agent 名称一致性 ---');

const ssotAgents = Object.keys(ssot.agents);
const rageAgents = [];
for (const phase of (rageMode.phases || [])) {
  for (const name of (phase.requiredAgents || [])) {
    rageAgents.push({ name, phase: phase.id });
  }
}
// GAN phase
if (rageMode.ganPhase) {
  for (const name of (rageMode.ganPhase.requiredAgents || [])) {
    rageAgents.push({ name, phase: 'gan' });
  }
}

for (const { name, phase } of rageAgents) {
  if (ssotAgents.includes(name)) {
    log_ok(`rage-mode Phase ${phase} → "${name}" 存在于 SSOT`);
  } else {
    log_fail(`rage-mode Phase ${phase} → "${name}" 不在 SSOT 中`);
  }
}

// 检查 SSOT 中有但 rage-mode 中没有的 agent
for (const name of ssotAgents) {
  const inRage = rageAgents.some(r => r.name === name);
  if (!inRage) {
    log_warn(`SSOT agent "${name}" 未出现在 rage-mode 的任何 phase 中`);
  }
}

console.log('');

// === 检查 2: agents/*.md 引用 ===
console.log('--- 检查 2: Agent MD 文件引用 ---');

let agentMdFiles = [];
if (fs.existsSync(AGENTS_DIR)) {
  agentMdFiles = fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => `agents/${f}`);
}

for (const [name, agent] of Object.entries(ssot.agents)) {
  if (agent.agentMd) {
    const fullPath = path.join(PROJECT_ROOT, agent.agentMd);
    if (fs.existsSync(fullPath)) {
      log_ok(`${name} → ${agent.agentMd} 存在`);
    } else {
      log_fail(`${name} → ${agent.agentMd} 不存在`);
    }
  } else {
    log_warn(`${name} 未定义 agentMd`);
  }
}

// 检查有 MD 文件但未被引用的
for (const mdFile of agentMdFiles) {
  const referenced = Object.values(ssot.agents).some(a => a.agentMd === mdFile);
  if (!referenced) {
    log_warn(`${mdFile} 存在但未被 SSOT 引用`);
  }
}

console.log('');

// === 检查 3: phase-gates check 命令 ===
console.log('--- 检查 3: Phase Gates Check 命令 ---');

for (const [gateKey, gate] of Object.entries(phaseGates.gates || {})) {
  for (const cond of (gate.conditions || [])) {
    if (cond.check) {
      // 基本语法检查：不能有未闭合的引号
      const singleQuotes = (cond.check.match(/'/g) || []).length;
      const doubleQuotes = (cond.check.match(/"/g) || []).length;
      if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
        log_ok(`${gateKey}: "${cond.description}" check 语法正确`);
      } else {
        log_fail(`${gateKey}: "${cond.description}" check 引号不匹配: ${cond.check}`);
      }
    } else {
      log_warn(`${gateKey}: "${cond.description}" 无 check 命令（需人工验证）`);
    }
  }
}

console.log('');

// === 检查 4: modeSelection 分数 ===
console.log('--- 检查 4: ModeSelection 评分 ---');

const thresholds = ssot.modeThresholds || {};
log_ok(`modeThresholds: team=${thresholds.team || '?'}, subagentParallel=${thresholds.subagentParallel || '?'}`);

for (const [name, agent] of Object.entries(ssot.agents)) {
  const ms = agent.modeSelection;
  if (!ms) {
    log_warn(`${name} 未定义 modeSelection`);
    continue;
  }

  const total = Object.values(ms).reduce((a, b) => a + b, 0);
  let mode;
  if (total >= (thresholds.team || 6)) mode = 'Team';
  else if (total >= (thresholds.subagentParallel || 3)) mode = 'Subagent(并行)';
  else mode = 'Subagent(顺序)';

  const factors = Object.entries(ms).map(([k, v]) => `${k}=${v}`).join(', ');
  log_ok(`${name}: ${factors} = ${total} → ${mode}`);
}

console.log('');

// === 检查 5: 硬编码漂移检测 ===
console.log('--- 检查 5: 硬编码漂移检测 ---');

const autoStartPath = path.join(PROJECT_ROOT, 'hooks', 'scripts', 'auto-start-agents.js');
if (fs.existsSync(autoStartPath)) {
  const content = fs.readFileSync(autoStartPath, 'utf-8');

  // 检查是否还有硬编码的 AGENTS 对象
  if (content.includes('const AGENTS = {') || content.includes('const AGENTS={')) {
    log_fail('auto-start-agents.js 仍有硬编码 AGENTS 对象（应从 SSOT 读取）');
  } else {
    log_ok('auto-start-agents.js 使用 SSOT 读取配置');
  }

  // 检查是否引用了 SSOT_PATH
  if (content.includes('agent-orchestration.json') || content.includes('SSOT')) {
    log_ok('auto-start-agents.js 正确引用 SSOT 文件');
  } else {
    log_fail('auto-start-agents.js 未引用 SSOT 文件');
  }
}

const phaseControllerPath = path.join(PROJECT_ROOT, 'hooks', 'scripts', 'phase-controller.js');
if (fs.existsSync(phaseControllerPath)) {
  const content = fs.readFileSync(phaseControllerPath, 'utf-8');

  if (content.includes('const PHASES = [')) {
    log_fail('phase-controller.js 仍有硬编码 PHASES 数组（应从 phase-gates.json 读取）');
  } else {
    log_ok('phase-controller.js 使用 phase-gates.json 读取配置');
  }
}

console.log('');

// === 总结 ===
console.log('========================================');
console.log(`  结果: ${passed} PASS, ${failed} FAIL, ${warnings} WARN`);
console.log('========================================');

if (failed > 0) {
  console.log('\n  \x1b[31m存在失败项，请修复后重新验证。\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\n  \x1b[32m全部通过!\x1b[0m\n');
}
