const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON, ROOT } = require('../helpers/config-loader');

const ssot = loadJSON('automation/agent-orchestration.json');

describe('orchestration-pipeline - SSOT structure', () => {
  test('SSOT has correct top-level keys', () => {
    assert.ok(ssot.agents, 'Missing agents key');
    assert.ok(ssot.modeThresholds, 'Missing modeThresholds key');
    assert.ok(ssot.gstackConfig, 'Missing gstackConfig key');
  });

  test('SSOT version is 3.2.0', () => {
    assert.strictEqual(ssot.version, '3.2.0');
  });

  test('SSOT is enabled', () => {
    assert.strictEqual(ssot.enabled, true);
  });
});

describe('orchestration-pipeline - phase coverage', () => {
  const agents = ssot.agents;
  const agentNames = Object.keys(agents);

  test('all phases have at least one agent', () => {
    const phases = new Set(agentNames.map(name => String(agents[name].phase)));

    // Verify expected phases exist
    const expectedPhases = ['0.5a', '0.5b', '1', '2', '3', '4', '5', '1-review', 'gan', 'compound'];
    for (const expectedPhase of expectedPhases) {
      assert.ok(phases.has(expectedPhase), `Missing phase: ${expectedPhase}`);
    }
  });

  test('every agent has a phase field', () => {
    for (const name of agentNames) {
      assert.ok(agents[name].phase !== undefined, `Agent ${name} missing phase`);
    }
  });

  test('every agent has at least one required skill', () => {
    for (const name of agentNames) {
      const skills = agents[name].requiredSkills;
      assert.ok(Array.isArray(skills), `Agent ${name} requiredSkills is not an array`);
      assert.ok(skills.length > 0, `Agent ${name} has no requiredSkills`);
    }
  });

  test('every agent has a subagentType', () => {
    for (const name of agentNames) {
      assert.ok(agents[name].subagentType, `Agent ${name} missing subagentType`);
    }
  });

  test('every agent has an agentMd', () => {
    for (const name of agentNames) {
      assert.ok(agents[name].agentMd, `Agent ${name} missing agentMd`);
    }
  });
});

describe('orchestration-pipeline - dependency graph', () => {
  const agents = ssot.agents;
  const agentNames = Object.keys(agents);

  test('dependency graph has no cycles', () => {
    // DFS-based cycle detection
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = {};
    for (const name of agentNames) color[name] = WHITE;

    function dfs(node) {
      color[node] = GRAY;
      const deps = agents[node].dependencies || [];
      for (const dep of deps) {
        if (color[dep] === GRAY) {
          throw new Error(`Cycle detected: ${node} -> ${dep}`);
        }
        if (color[dep] === WHITE) {
          dfs(dep);
        }
      }
      color[node] = BLACK;
    }

    for (const name of agentNames) {
      if (color[name] === WHITE) dfs(name);
    }
    // If we get here, no cycles
    assert.ok(true, 'No cycles detected in dependency graph');
  });

  test('all dependencies reference existing agents', () => {
    for (const name of agentNames) {
      const deps = agents[name].dependencies || [];
      for (const dep of deps) {
        assert.ok(agents[dep], `Agent ${name} depends on non-existent agent: ${dep}`);
      }
    }
  });

  test('agents with no dependencies can start immediately', () => {
    const independentAgents = agentNames.filter(
      name => !agents[name].dependencies || agents[name].dependencies.length === 0
    );
    assert.ok(independentAgents.length > 0, 'Expected at least one agent with no dependencies');
  });
});

describe('orchestration-pipeline - modeSelection', () => {
  const agents = ssot.agents;
  const agentNames = Object.keys(agents);

  test('all modeSelection scores are numbers', () => {
    for (const name of agentNames) {
      const ms = agents[name].modeSelection;
      assert.ok(ms, `Agent ${name} missing modeSelection`);

      const fields = ['communicationNeed', 'crossLayerDependency', 'contextPressure', 'roleCount', 'writeConflictRisk'];
      for (const field of fields) {
        assert.strictEqual(typeof ms[field], 'number',
          `Agent ${name} modeSelection.${field} is not a number: ${typeof ms[field]}`);
      }
    }
  });

  test('modeSelection scores are within expected range (-1 to 3)', () => {
    for (const name of agentNames) {
      const ms = agents[name].modeSelection;
      const fields = ['communicationNeed', 'crossLayerDependency', 'contextPressure', 'roleCount', 'writeConflictRisk'];
      for (const field of fields) {
        assert.ok(
          ms[field] >= -1 && ms[field] <= 3,
          `Agent ${name} modeSelection.${field} = ${ms[field]} out of range [-1, 3]`
        );
      }
    }
  });
});

describe('orchestration-pipeline - gstackConfig', () => {
  test('gstackConfig exists in SSOT', () => {
    assert.ok(ssot.gstackConfig, 'Missing gstackConfig');
  });

  test('gstackConfig has required fields', () => {
    const gc = ssot.gstackConfig;
    assert.ok(gc.enabled !== undefined, 'Missing enabled');
    assert.ok(gc.version, 'Missing version');
    assert.ok(gc.phasePrefix, 'Missing phasePrefix');
    assert.ok(gc.threshold !== undefined, 'Missing threshold');
    assert.ok(Array.isArray(gc.requiredOutputs), 'Missing requiredOutputs array');
    assert.ok(gc.bridgeSkill, 'Missing bridgeSkill');
  });

  test('gstackConfig.enabled is a boolean', () => {
    assert.strictEqual(typeof ssot.gstackConfig.enabled, 'boolean');
  });

  test('gstackConfig.requiredOutputs has at least one entry', () => {
    assert.ok(ssot.gstackConfig.requiredOutputs.length > 0, 'requiredOutputs is empty');
  });
});

describe('orchestration-pipeline - ganConfig', () => {
  test('ganConfig exists', () => {
    assert.ok(ssot.ganConfig, 'Missing ganConfig');
  });

  test('ganConfig has required fields', () => {
    const gc = ssot.ganConfig;
    assert.strictEqual(typeof gc.enabled, 'boolean');
    assert.ok(gc.threshold !== undefined);
    assert.ok(gc.maxIterations !== undefined);
    assert.ok(gc.outputDir);
  });

  test('ganConfig has multiReview configuration', () => {
    const gc = ssot.ganConfig;
    assert.ok(gc.multiReview, 'Missing multiReview in ganConfig');
    assert.strictEqual(gc.multiReview.enabled, true);
    assert.ok(Array.isArray(gc.multiReview.reviewers));
  });
});

describe('orchestration-pipeline - workConfig', () => {
  test('workConfig exists and is valid', () => {
    assert.ok(ssot.workConfig, 'Missing workConfig');
    assert.strictEqual(ssot.workConfig.enabled, true);
    assert.strictEqual(ssot.workConfig.singleTaskMode, true);
    assert.ok(ssot.workConfig.progressFile);
    assert.ok(ssot.workConfig.tddIntegration);
  });
});
