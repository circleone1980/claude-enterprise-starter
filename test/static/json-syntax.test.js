const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON } = require('../helpers/config-loader');

describe('JSON 语法 - 所有配置文件可正确解析', () => {
  test('settings.json 解析正确', () => {
    assert.doesNotThrow(() => loadJSON('settings.json'));
  });

  test('automation/agent-orchestration.json 解析正确', () => {
    assert.doesNotThrow(() => loadJSON('automation/agent-orchestration.json'));
  });

  test('teams/dev/config.json 解析正确', () => {
    assert.doesNotThrow(() => loadJSON('teams/dev/config.json'));
  });

  test('teams/full/config.json 解析正确', () => {
    assert.doesNotThrow(() => loadJSON('teams/full/config.json'));
  });

  test('.mcp.json 解析正确', () => {
    assert.doesNotThrow(() => loadJSON('.mcp.json'));
  });

  test('hooks/hooks.json 解析正确', () => {
    assert.doesNotThrow(() => loadJSON('hooks/hooks.json'));
  });
});
