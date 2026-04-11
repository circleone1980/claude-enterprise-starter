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
 *   6. AC Tracker 一致性
 *   7. GStack 配置一致性（仅在启用时验证）
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
const FEATURE_GATES_PATH = path.join(PROJECT_ROOT, 'automation', 'feature-gates.json');
const AGENTS_DIR = path.join(PROJECT_ROOT, 'agents');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');

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
let ssot, rageMode, phaseGates, featureGates;

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

try {
  featureGates = JSON.parse(fs.readFileSync(FEATURE_GATES_PATH, 'utf-8'));
  log_ok(`feature-gates.json loaded`);
} catch (e) {
  log_warn(`feature-gates.json 加载失败: ${e.message}`);
  featureGates = null;
}

console.log('');

// === 检查 1: agent 名称一致性 ===
console.log('--- 检查 1: Agent 名称一致性 ---');

const ssotAgents = Object.keys(ssot.agents);
const rageAgents = [];
const gstackEnabled = ssot.gstackConfig && ssot.gstackConfig.enabled;

for (const phase of (rageMode.phases || [])) {
  // Skip gstack-only phases when gstack is disabled
  if (phase.gstackOnly && !gstackEnabled) continue;
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
  const agent = ssot.agents[name];
  // gstackOnly agents are only expected when gstack is enabled
  if (agent.gstackOnly && !gstackEnabled) continue;
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
  // Skip gstack gates when gstack is disabled
  if (gateKey.includes('phase0.5') && !gstackEnabled) {
    log_ok(`${gateKey}: 跳过（GStack 未启用）`);
    continue;
  }
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
  if (agent.gstackOnly && !gstackEnabled) {
    log_ok(`${name}: 跳过（GStack agent，未启用）`);
    continue;
  }
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

// === 检查 6: AC Tracker 一致性 ===
console.log('--- 检查 6: AC Tracker 一致性 ---');

const AC_TRACKER_PATH = path.join(PROJECT_ROOT, 'automation', 'ac-tracker.json');
const AC_MD_PATH_ACTUAL = path.join(PROJECT_ROOT, 'docs', 'requirements', 'acceptance-criteria.md');
const PRD_PATH = path.join(PROJECT_ROOT, 'docs', 'requirements', 'PRD.md');

const VALID_STATUSES = ['draft', 'approved', 'test_written', 'verified', 'passed', 'failed'];

if (fs.existsSync(AC_TRACKER_PATH)) {
  let acTracker;
  try {
    acTracker = JSON.parse(fs.readFileSync(AC_TRACKER_PATH, 'utf-8'));
    log_ok(`ac-tracker.json loaded: v${acTracker.version}`);
  } catch (e) {
    log_fail(`ac-tracker.json 解析失败: ${e.message}`);
    acTracker = null;
  }

  if (acTracker && acTracker.features) {
    const allACIds = new Set();
    const allFeatIds = new Set();

    for (const feat of acTracker.features) {
      // 检查 FEAT ID 格式
      if (/^FEAT-\d{3}$/.test(feat.featId)) {
        log_ok(`FEAT ID 格式正确: ${feat.featId}`);
      } else {
        log_fail(`FEAT ID 格式错误: ${feat.featId}（应为 FEAT-{NNN}）`);
      }
      allFeatIds.add(feat.featId);

      for (const ac of (feat.acceptanceCriteria || [])) {
        // 检查 AC ID 格式
        if (/^AC-F\d{3}-\d{2}$/.test(ac.acId)) {
          log_ok(`AC ID 格式正确: ${ac.acId}`);
        } else {
          log_fail(`AC ID 格式错误: ${ac.acId}（应为 AC-F{NNN}-{MM}）`);
        }

        // 检查重复
        if (allACIds.has(ac.acId)) {
          log_fail(`AC ID 重复: ${ac.acId}`);
        }
        allACIds.add(ac.acId);

        // 检查状态合法性
        if (VALID_STATUSES.includes(ac.status)) {
          log_ok(`${ac.acId} 状态合法: ${ac.status}`);
        } else {
          log_fail(`${ac.acId} 状态非法: ${ac.status}（应为 ${VALID_STATUSES.join('/')}）`);
        }
      }
    }

    // 检查 markdown 中引用的 AC 是否都在 tracker 中
    if (fs.existsSync(AC_MD_PATH_ACTUAL)) {
      const mdContent = fs.readFileSync(AC_MD_PATH_ACTUAL, 'utf-8');
      const mdACIds = [...mdContent.matchAll(/AC-F\d{3}-\d{2}/g)].map(m => m[0]);
      const uniqueMdACIds = [...new Set(mdACIds)];
      for (const acId of uniqueMdACIds) {
        if (allACIds.has(acId)) {
          log_ok(`markdown AC ${acId} 存在于 tracker`);
        } else {
          log_warn(`markdown AC ${acId} 不在 tracker 中（可能需要运行 ac-tracker-sync.js）`);
        }
      }
    }

    // 检查 PRD 中引用的 FEAT ID 是否都在 tracker 中
    if (fs.existsSync(PRD_PATH)) {
      const prdContent = fs.readFileSync(PRD_PATH, 'utf-8');
      const prdFeatIds = [...prdContent.matchAll(/FEAT-\d{3}/g)].map(m => m[0]);
      const uniquePrdFeatIds = [...new Set(prdFeatIds)];
      for (const featId of uniquePrdFeatIds) {
        if (allFeatIds.has(featId)) {
          log_ok(`PRD FEAT ${featId} 存在于 tracker`);
        } else {
          log_warn(`PRD FEAT ${featId} 不在 tracker 中（可能需要运行 ac-tracker-sync.js）`);
        }
      }
    }
  }
} else {
  log_warn('ac-tracker.json 不存在（运行 node scripts/ac-tracker-sync.js 创建）');
}

console.log('');

// === 检查 7: GStack 配置一致性 ===
console.log('--- 检查 7: GStack 配置一致性 ---');

const GSTACK_SKILLS = [
  'office-hours', 'design-consultation', 'design-shotgun', 'design-html',
  'autoplan', 'plan-ceo-review', 'plan-design-review', 'plan-eng-review',
  'plan-devex-review', 'gstack-bridge'
];

const GSTACK_AGENTS = ['Product-Designer', 'Design-Reviewer'];

// 检查 GStack agents 在 SSOT 中定义
for (const agentName of GSTACK_AGENTS) {
  if (ssot.agents[agentName]) {
    log_ok(`GStack agent "${agentName}" 存在于 SSOT`);
    if (ssot.agents[agentName].gstackOnly) {
      log_ok(`  ${agentName} 标记为 gstackOnly: true`);
    } else {
      log_warn(`  ${agentName} 未标记 gstackOnly（建议标记以避免 GStack 禁用时被调用）`);
    }
  } else {
    log_fail(`GStack agent "${agentName}" 不在 SSOT 中`);
  }
}

// 检查 GStack skills 目录存在
for (const skillName of GSTACK_SKILLS) {
  const skillDir = path.join(SKILLS_DIR, skillName);
  const skillMd = path.join(skillDir, 'SKILL.md');
  if (fs.existsSync(skillMd)) {
    log_ok(`GStack skill "${skillName}" 存在`);
  } else {
    log_fail(`GStack skill "${skillName}" 不存在: ${skillMd}`);
  }
}

// 检查 GStack toggle 脚本
const toggleScript = path.join(PROJECT_ROOT, 'scripts', 'gstack-toggle.js');
if (fs.existsSync(toggleScript)) {
  log_ok('gstack-toggle.js 存在');
} else {
  log_warn('gstack-toggle.js 不存在');
}

// 检查 feature-gates.json 中 gstack 开关
if (featureGates && featureGates.features && featureGates.features.gstack) {
  log_ok(`feature-gates.json 中 gstack 开关存在: enabled=${featureGates.features.gstack.enabled}`);
  // 一致性：agent-orchestration.json 和 feature-gates.json 应该同步
  if (gstackEnabled !== featureGates.features.gstack.enabled) {
    log_fail(`gstackConfig.enabled (${gstackEnabled}) 与 feature-gates.gstack.enabled (${featureGates.features.gstack.enabled}) 不一致`);
  } else {
    log_ok('agent-orchestration.json 和 feature-gates.json 的 gstack 状态一致');
  }
} else {
  log_warn('feature-gates.json 中未找到 gstack 特性开关');
}

// 检查 phase-gates.json 中 Phase 0.5 门禁
const phase05Gates = ['phase0_to_phase0.5', 'phase0.5_to_phase1'];
for (const gateKey of phase05Gates) {
  if (phaseGates.gates && phaseGates.gates[gateKey]) {
    log_ok(`phase-gates.json 中 ${gateKey} 门禁存在`);
  } else {
    log_fail(`phase-gates.json 中缺少 ${gateKey} 门禁`);
  }
}

// 仅在 GStack 启用时验证 GStack 输出目录
if (gstackEnabled) {
  const designDir = path.join(PROJECT_ROOT, 'workspace', 'docs', 'design');
  if (fs.existsSync(designDir)) {
    log_ok('GStack 输出目录 workspace/docs/design/ 存在');
  } else {
    log_warn('GStack 输出目录 workspace/docs/design/ 不存在（将在首次运行时创建）');
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
