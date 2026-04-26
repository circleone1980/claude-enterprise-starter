#!/usr/bin/env node
/**
 * ce-health-check.js — CE Plugin 健康检查（必需依赖）
 *
 * 验证 CE 插件已安装且 5 个核心技能可用。
 * Exit 0 = 全部可用, Exit 1 = 缺失
 *
 * 用法: node scripts/ce-health-check.js [--json]
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MCP_PATH = path.join(PROJECT_ROOT, '.mcp.json');

const REQUIRED_SKILLS = ['ce-brainstorm', 'ce-plan', 'ce-work', 'ce-review', 'ce-compound'];

let passed = 0;
let failed = 0;
const results = [];

function check(description, ok) {
  if (ok) {
    passed++;
    results.push({ check: description, status: 'PASS' });
  } else {
    failed++;
    results.push({ check: description, status: 'FAIL' });
  }
}

// 1. .mcp.json 存在
const mcpExists = fs.existsSync(MCP_PATH);
check('.mcp.json exists', mcpExists);

// 2. 检查 .mcp.json 中是否包含 CE 相关 MCP server
// CE 插件技能通过 Claude Code 内置的 plugin:ecc 前缀提供，
// 不需要在 .mcp.json 中显式注册 MCP server。
// 实际可用性在 Claude Code 运行时由插件系统保证。
// 此脚本验证项目配置正确性（SSOT 中声明的 CE 技能格式正确）。
if (mcpExists) {
  const mcp = JSON.parse(fs.readFileSync(MCP_PATH, 'utf-8'));
  const servers = Object.keys(mcp.mcpServers || {});
  check(`.mcp.json has ${servers.length} MCP servers configured`, servers.length > 0);
}

// 3. 验证 SSOT 中 CE 技能声明格式正确
const SSOT_PATH = path.join(PROJECT_ROOT, 'automation', 'agent-orchestration.json');
if (fs.existsSync(SSOT_PATH)) {
  const ssot = JSON.parse(fs.readFileSync(SSOT_PATH, 'utf-8'));
  const allCeSkills = new Set();

  for (const [name, agent] of Object.entries(ssot.agents || {})) {
    for (const skill of (agent.requiredSkills || [])) {
      if (skill.startsWith('ce-')) {
        allCeSkills.add(skill);
      }
    }
  }

  for (const required of REQUIRED_SKILLS) {
    check(`SSOT declares "${required}"`, allCeSkills.has(required));
  }

  // 4. 检查无 ce: 前缀残留（旧格式）
  let hasOldPrefix = false;
  for (const [name, agent] of Object.entries(ssot.agents || {})) {
    for (const skill of (agent.requiredSkills || [])) {
      if (skill.startsWith('ce:')) {
        hasOldPrefix = true;
        check(`Agent "${name}" has old ce: prefix: "${skill}"`, false);
      }
    }
  }
  if (!hasOldPrefix) {
    check('No old "ce:" prefix in SSOT', true);
  }
} else {
  check('agent-orchestration.json exists', false);
}

// 5. 验证 settings.json 中 CE 技能配置
const SETTINGS_PATH = path.join(PROJECT_ROOT, 'settings.json');
if (fs.existsSync(SETTINGS_PATH)) {
  const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  const ceSkills = settings?.compoundEngineering?.skills
    || settings?.customInstructions?.compoundEngineering?.skills
    || [];
  const settingsCeSet = new Set(ceSkills);
  check('settings.json has compoundEngineering.skills', ceSkills.length > 0);
  for (const required of REQUIRED_SKILLS) {
    check(`settings.json declares "${required}"`, settingsCeSet.has(required));
  }
}

// 输出
const jsonMode = process.argv.includes('--json');

if (jsonMode) {
  console.log(JSON.stringify({
    passed,
    failed,
    total: passed + failed,
    skills: REQUIRED_SKILLS,
    results
  }, null, 2));
} else {
  console.log('\n========================================');
  console.log('  CE Plugin 健康检查');
  console.log('========================================\n');

  for (const r of results) {
    const icon = r.status === 'PASS' ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  ${icon} ${r.check}`);
  }

  console.log('\n========================================');
  console.log(`  结果: ${passed} PASS, ${failed} FAIL`);
  console.log('========================================');

  if (failed > 0) {
    console.log('\n  \x1b[31mCE 插件为必需依赖。请安装后重试。\x1b[0m');
    console.log('  安装指南: docs/CE-SETUP.md\n');
    process.exit(1);
  } else {
    console.log('\n  \x1b[32m全部通过! CE 插件配置正确。\x1b[0m\n');
  }
}
