const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON } = require('../helpers/config-loader');

describe('依赖图 - Agent 依赖关系验证', () => {
  const ssot = loadJSON('automation/agent-orchestration.json');
  const agentNames = Object.keys(ssot.agents);

  test('所有依赖名称在 SSOT 中存在', () => {
    const missing = [];
    for (const name of agentNames) {
      const deps = ssot.agents[name].dependencies || [];
      for (const dep of deps) {
        if (!agentNames.includes(dep)) {
          missing.push(`${name} → ${dep}`);
        }
      }
    }
    assert.strictEqual(missing.length, 0, `依赖指向不存在的 agent:\n${missing.join('\n')}`);
  });

  test('无循环依赖（拓扑排序成功）', () => {
    // Kahn's algorithm
    const inDegree = {};
    const adj = {};
    for (const name of agentNames) {
      inDegree[name] = 0;
      adj[name] = [];
    }
    for (const name of agentNames) {
      const deps = ssot.agents[name].dependencies || [];
      inDegree[name] = deps.length;
      for (const dep of deps) {
        adj[dep].push(name);
      }
    }

    const queue = agentNames.filter(n => inDegree[n] === 0);
    const sorted = [];
    while (queue.length > 0) {
      const node = queue.shift();
      sorted.push(node);
      for (const neighbor of adj[node]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    assert.strictEqual(sorted.length, agentNames.length,
      `存在循环依赖，拓扑排序仅完成 ${sorted.length}/${agentNames.length}`);
  });

  test('GAN 链存在: GAN-Planner → GAN-Generator → GAN-Evaluator', () => {
    const planner = ssot.agents['GAN-Planner'];
    const generator = ssot.agents['GAN-Generator'];
    const evaluator = ssot.agents['GAN-Evaluator'];

    assert.ok(planner, 'GAN-Planner 存在');
    assert.ok(generator, 'GAN-Generator 存在');
    assert.ok(evaluator, 'GAN-Evaluator 存在');

    // GAN-Planner 无前置依赖
    assert.deepStrictEqual(planner.dependencies, [],
      'GAN-Planner 应无前置依赖');

    // GAN-Generator 依赖 GAN-Planner
    assert.ok(generator.dependencies.includes('GAN-Planner'),
      'GAN-Generator 应依赖 GAN-Planner');

    // GAN-Evaluator 依赖 GAN-Generator
    assert.ok(evaluator.dependencies.includes('GAN-Generator'),
      'GAN-Evaluator 应依赖 GAN-Generator');
  });
});
