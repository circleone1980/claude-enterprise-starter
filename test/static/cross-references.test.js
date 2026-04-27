const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON, listSkillDirs, listAgentFiles, ROOT } = require('../helpers/config-loader');
const path = require('path');
const fs = require('fs');

describe('交叉引用 - 跨文件引用一致性', () => {
  const ssot = loadJSON('automation/agent-orchestration.json');
  const agentNames = Object.keys(ssot.agents);

  test('SSOT 每个 agent 的 agentMd 文件存在', () => {
    const missing = [];
    for (const name of agentNames) {
      const relPath = ssot.agents[name].agentMd;
      const fullPath = path.join(ROOT, relPath);
      if (!fs.existsSync(fullPath)) {
        missing.push(`${name} → ${relPath}`);
      }
    }
    assert.strictEqual(missing.length, 0, `缺少 agentMd 文件:\n${missing.join('\n')}`);
  });

  // v5.0.0: 插件提供的技能列表（不再有本地目录）
  const PLUGIN_SKILLS = new Set([
    // superpowers
    'test-driven-development', 'writing-plans', 'systematic-debugging',
    'requesting-code-review', 'receiving-code-review',
    // ECC
    'springboot-patterns', 'springboot-tdd', 'springboot-security',
    'jpa-patterns', 'java-coding-standards', 'verification-loop',
    'search-first', 'security-review', 'strategic-compact',
    'continuous-learning', 'gan-style-harness',
    // code-review (provided by ecc plugin)
    'code-review',
    // ui-ux-pro-max plugin
    'ui-ux-pro-max',
    // GStack local deployment
    'office-hours', 'design-consultation', 'design-html', 'design-shotgun',
    'autoplan', 'plan-ceo-review', 'plan-design-review', 'plan-eng-review', 'plan-devex-review',
  ]);

  test('每个非 ce-* requiredSkill 有本地目录或由插件提供', () => {
    const skillDirs = listSkillDirs();
    const missing = [];
    for (const name of agentNames) {
      const skills = ssot.agents[name].requiredSkills || [];
      for (const skill of skills) {
        if (skill.startsWith('ce-')) continue;
        if (PLUGIN_SKILLS.has(skill)) continue;
        if (!skillDirs.includes(skill)) {
          missing.push(`${name} → skills/${skill}`);
        }
      }
    }
    assert.strictEqual(missing.length, 0, `缺少 skill 目录（非插件提供）:\n${missing.join('\n')}`);
  });

  test('teams/dev 和 teams/full 每个 member 的 agentMd 文件存在', () => {
    const missing = [];
    for (const teamFile of ['teams/dev/config.json', 'teams/full/config.json']) {
      const team = loadJSON(teamFile);
      for (const member of team.members) {
        const fullPath = path.join(ROOT, member.agentMd);
        if (!fs.existsSync(fullPath)) {
          missing.push(`${teamFile} → ${member.name} → ${member.agentMd}`);
        }
      }
    }
    assert.strictEqual(missing.length, 0, `缺少 team member agentMd:\n${missing.join('\n')}`);
  });

  test('agents/ 下无孤立 .md 文件（均被 SSOT 引用）', () => {
    const referencedFiles = new Set(agentNames.map(n => ssot.agents[n].agentMd));
    const agentFiles = listAgentFiles();
    const orphans = agentFiles.filter(f => !referencedFiles.has(`agents/${f}`));
    assert.strictEqual(orphans.length, 0, `孤立 agent 文件（未被 SSOT 引用）:\n${orphans.join('\n')}`);
  });

  test('agent 引用的 MCP server 在 .mcp.json 中存在', () => {
    const mcp = loadJSON('.mcp.json');
    const mcpNames = new Set(Object.keys(mcp.mcpServers));
    const missing = [];
    for (const name of agentNames) {
      const servers = ssot.agents[name].mcpServers || [];
      for (const server of servers) {
        if (!mcpNames.has(server)) {
          missing.push(`${name} → ${server}`);
        }
      }
    }
    assert.strictEqual(missing.length, 0, `缺少 MCP server 定义:\n${missing.join('\n')}`);
  });
});
