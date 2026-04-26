const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON, listSkillDirs, listAgentFiles, listRuleFiles, ROOT } = require('../helpers/config-loader');

const EXPECTED_AGENT_COUNT = 16;
const EXPECTED_SKILL_COUNT = 38;
const EXPECTED_RULE_COUNT = 17;

describe('数量一致性 - 文件/配置计数校验', () => {
  test(`agent 文件数量 = ${EXPECTED_AGENT_COUNT}`, () => {
    const files = listAgentFiles();
    assert.strictEqual(files.length, EXPECTED_AGENT_COUNT,
      `实际 ${files.length}: ${files.join(', ')}`);
  });

  test(`SSOT agents 数量 = ${EXPECTED_AGENT_COUNT}`, () => {
    const ssot = loadJSON('automation/agent-orchestration.json');
    const count = Object.keys(ssot.agents).length;
    assert.strictEqual(count, EXPECTED_AGENT_COUNT,
      `实际 ${count}: ${Object.keys(ssot.agents).join(', ')}`);
  });

  test(`skill 目录数量 = ${EXPECTED_SKILL_COUNT}`, () => {
    const dirs = listSkillDirs();
    assert.strictEqual(dirs.length, EXPECTED_SKILL_COUNT,
      `实际 ${dirs.length}: ${dirs.join(', ')}`);
  });

  test(`rule 文件数量 = ${EXPECTED_RULE_COUNT}`, () => {
    const rules = listRuleFiles();
    assert.strictEqual(rules.length, EXPECTED_RULE_COUNT,
      `实际 ${rules.length}: ${rules.join(', ')}`);
  });
});
