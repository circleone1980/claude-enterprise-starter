const { test, describe } = require('node:test');
const assert = require('node:assert');
const { listAgentFiles, loadJSON, ROOT } = require('../helpers/config-loader');
const { parseFrontmatter } = require('../helpers/frontmatter-parser');
const path = require('path');
const fs = require('fs');

const EXPECTED_AGENT_COUNT = 18;

/** 有效的 subagentType 前缀 */
const VALID_SUBAGENT_PREFIXES = [
  'general-purpose',
  'everything-claude-code:',
];

/** 已知不存在的幽灵 skill 引用 */
const GHOST_SKILLS = [
  'brainstorming',
  'systematic-debugging',
  'writing-skills',
  'verification-before-completion',
];

/** 有效的 phase 值 */
const VALID_PHASES = [
  '0', '0.5a', '0.5b', '1', '1-review', '2', '3', '4', '5', 'gan', 'compound',
];

/**
 * CRLF 安全的 MD 解析 — normalize 换行后再调用 parseFrontmatter
 */
function parseAgentMD(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  return { frontmatter: parseFrontmatter(raw), content: raw };
}

describe('Agent Frontmatter - 18 个 agent 验证', () => {
  const agentFiles = listAgentFiles();
  const ssot = loadJSON('automation/agent-orchestration.json');

  test(`agent 文件数量为 ${EXPECTED_AGENT_COUNT}`, () => {
    assert.strictEqual(agentFiles.length, EXPECTED_AGENT_COUNT,
      `实际 ${agentFiles.length} 个: ${agentFiles.join(', ')}`);
  });

  test(`SSOT agent 数量为 ${EXPECTED_AGENT_COUNT}`, () => {
    assert.strictEqual(Object.keys(ssot.agents).length, EXPECTED_AGENT_COUNT);
  });

  test('每个 .md 文件有合法的 frontmatter', () => {
    const invalid = [];
    for (const file of agentFiles) {
      const filePath = path.join(ROOT, 'agents', file);
      const { frontmatter } = parseAgentMD(filePath);
      if (!frontmatter) {
        invalid.push(file);
      }
    }
    assert.strictEqual(invalid.length, 0, `缺少 frontmatter: ${invalid.join(', ')}`);
  });

  test('subagentType 值合法', () => {
    const invalid = [];
    for (const file of agentFiles) {
      const filePath = path.join(ROOT, 'agents', file);
      const { frontmatter } = parseAgentMD(filePath);
      if (!frontmatter) continue;
      const type = frontmatter.subagentType;
      if (!type) {
        invalid.push(`${file}: 缺少 subagentType`);
        continue;
      }
      const valid = VALID_SUBAGENT_PREFIXES.some(prefix => type === prefix || type.startsWith(prefix));
      if (!valid) {
        invalid.push(`${file}: "${type}"`);
      }
    }
    assert.strictEqual(invalid.length, 0, `无效 subagentType:\n${invalid.join('\n')}`);
  });

  test('无幽灵 skill 引用', () => {
    const found = [];
    for (const agentName of Object.keys(ssot.agents)) {
      const skills = ssot.agents[agentName].requiredSkills || [];
      for (const skill of skills) {
        if (GHOST_SKILLS.includes(skill)) {
          found.push(`${agentName} → ${skill}`);
        }
      }
    }
    assert.strictEqual(found.length, 0, `发现幽灵 skill 引用:\n${found.join('\n')}`);
  });

  test('phase 字段值合法', () => {
    const invalid = [];
    for (const file of agentFiles) {
      const filePath = path.join(ROOT, 'agents', file);
      const { frontmatter } = parseAgentMD(filePath);
      if (!frontmatter) continue;
      const phase = String(frontmatter.phase);
      if (!VALID_PHASES.includes(phase)) {
        invalid.push(`${file}: phase="${phase}"`);
      }
    }
    assert.strictEqual(invalid.length, 0, `无效 phase 值:\n${invalid.join('\n')}`);
  });
});
