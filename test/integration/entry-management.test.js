#!/usr/bin/env node
/**
 * entry-management.test.js — 入口管理机制测试
 *
 * 验证 v5.0.0 插件优先架构 + v4.1.0 入口管理改造的完整性:
 * - SessionStart 注入配置
 * - using-ce-framework 元技能
 * - PreToolUse 门禁守卫
 * - 3 个新 Skills
 * - 规则文件
 */

const fs = require('fs');
const path = require('path');
const { listSkillDirs } = require('../helpers/config-loader');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(PROJECT_ROOT, relPath));
}

function readFile(relPath) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf-8');
}

// ============================================
console.log('\n=== 入口管理机制测试 ===\n');
// ============================================

// 1. using-ce-framework 元技能
console.log('--- 1. using-ce-framework 元技能 ---');
assert(fileExists('skills/using-ce-framework/SKILL.md'),
  'skills/using-ce-framework/SKILL.md 存在');

const metaSkill = readFile('skills/using-ce-framework/SKILL.md');
assert(metaSkill.includes('Iron Laws') || metaSkill.includes('Iron Law'),
  '元技能包含 Iron Laws');
assert(metaSkill.includes('Red Flags') || metaSkill.includes('红旗'),
  '元技能包含 Red Flags');
assert(metaSkill.includes('SUBAGENT-STOP'),
  '元技能包含 SUBAGENT-STOP');
assert(metaSkill.includes('1%') || metaSkill.includes('1%'),
  '元技能包含 1% 规则');
assert(metaSkill.includes('Hard Gate'),
  '元技能包含 Hard Gates');

// 2. SessionStart Hook 配置
console.log('\n--- 2. SessionStart Hook ---');
assert(fileExists('hooks/scripts/session-start'),
  'hooks/scripts/session-start 存在');
assert(fileExists('hooks/scripts/run-hook.cmd'),
  'hooks/scripts/run-hook.cmd 存在');

const hooksJson = readFile('hooks/hooks.json');
const hooks = JSON.parse(hooksJson);
assert(hooks.hooks.SessionStart !== undefined,
  'hooks.json 有 SessionStart 段');
assert(hooks.hooks.SessionStart[0].matcher === 'startup|clear|compact',
  'SessionStart matcher 正确');

// 3. PreToolUse 门禁守卫
console.log('\n--- 3. PreToolUse 门禁守卫 ---');
assert(fileExists('hooks/scripts/phase-gate-guard.js'),
  'hooks/scripts/phase-gate-guard.js 存在');

const editHooks = hooks.hooks.PreToolUse.find(h => h.matcher === 'Edit');
const writeHooks = hooks.hooks.PreToolUse.find(h => h.matcher === 'Write');

assert(editHooks && editHooks.hooks.some(h => h.command.includes('phase-gate-guard')),
  'PreToolUse Edit 包含 phase-gate-guard');
assert(writeHooks && writeHooks.hooks.some(h => h.command.includes('phase-gate-guard')),
  'PreToolUse Write 包含 phase-gate-guard');

// 4. 插件提供的 Skills（v5.0.0: 由 superpowers 插件提供，无本地副本）
console.log('\n--- 4. Plugin-provided Skills ---');
const localSkills = listSkillDirs();
assert(!localSkills.includes('systematic-debugging'),
  'systematic-debugging 应由 superpowers 插件提供（无本地副本）');
assert(!localSkills.includes('requesting-code-review'),
  'requesting-code-review 应由 superpowers 插件提供（无本地副本）');
assert(!localSkills.includes('receiving-code-review'),
  'receiving-code-review 应由 superpowers 插件提供（无本地副本）');
assert(!localSkills.includes('tdd'),
  'tdd 应由 superpowers 插件提供（无本地副本，插件名 test-driven-development）');

// 5. 规则文件
console.log('\n--- 5. 规则文件 ---');
assert(fileExists('rules/18_entry_management.md'),
  'rules/18_entry_management.md 存在');

const rule18 = readFile('rules/18_entry_management.md');
assert(rule18.includes('SessionStart') || rule18.includes('session-start'),
  'Rule 18 包含 SessionStart 说明');
assert(rule18.includes('PreToolUse') || rule18.includes('phase-gate-guard'),
  'Rule 18 包含 PreToolUse 说明');

// 6. CLAUDE.md 更新
console.log('\n--- 6. CLAUDE.md 更新 ---');
const claudeMd = readFile('CLAUDE.md');
assert(claudeMd.includes('using-ce-framework'),
  'CLAUDE.md 引用 using-ce-framework');
assert(claudeMd.includes('入口规则'),
  'CLAUDE.md 有入口规则段落');
assert(claudeMd.includes('5.0.0') || claudeMd.includes('v5.0'),
  'CLAUDE.md 版本号 5.0.0');

// 7. SSOT 版本
console.log('\n--- 7. 版本号一致性 ---');
const ssot = JSON.parse(readFile('automation/agent-orchestration.json'));
assert(ssot.version === '5.0.0',
  'agent-orchestration.json version = 5.0.0');

const pkg = JSON.parse(readFile('package.json'));
assert(pkg.version === '5.0.0',
  'package.json version = 5.0.0');

// 8. phase-gates.json 标记文件路径迁移
console.log('\n--- 8. 标记文件路径迁移 ---');
const gates = JSON.parse(readFile('automation/phase-gates.json'));
const gatesJson2 = JSON.stringify(gates);
assert(gatesJson2.includes('.claude/logs/.phase'),
  'phase-gates.json 包含 .claude/logs/ 路径');
// 双路径兼容
assert(gatesJson2.includes('.phase2-code-complete'),
  'phase-gates.json 保留旧路径兼容');

// 9. verification-loop 由 ECC 插件提供（v5.0.0 移除本地副本）
console.log('\n--- 9. Plugin-provided verification-loop ---');
assert(!fileExists('skills/verification-loop/SKILL.md'),
  'verification-loop 应由 ECC 插件提供（无本地副本）');

// ============================================
console.log('\n========================================');
console.log(`  结果: ${passed} PASS, ${failed} FAIL`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
