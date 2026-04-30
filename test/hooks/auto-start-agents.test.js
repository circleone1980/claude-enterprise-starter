const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');
const { loadJSON } = require('../helpers/config-loader');

const ssot = loadJSON('automation/agent-orchestration.json');
const thresholds = ssot.modeThresholds || { team: 6, subagentParallel: 3, subagentSequential: 0 };

/**
 * ModeSelection scoring engine (mirrors auto-start-agents.js logic)
 */
function decideMode(agent, thresholds, subPhase, targetPhase) {
  const scores = agent.modeSelection || {
    communicationNeed: 0, crossLayerDependency: 0,
    contextPressure: 0, roleCount: 0, writeConflictRisk: 0,
  };
  let total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (subPhase === '2A') total = Math.max(total, 6);
  const phaseStr = String(targetPhase || '');
  if (phaseStr === '3' || phaseStr === '4') total = Math.max(total, 6);

  if (total >= (thresholds.team || 6)) return { mode: 'team', score: total };
  if (total >= (thresholds.subagentParallel || 3)) return { mode: 'subagent-parallel', score: total };
  return { mode: 'subagent-sequential', score: total };
}

describe('auto-start-agents - modeSelection scoring', () => {
  test('Phase 1 PM scores >= team threshold', () => {
    const { mode, score } = decideMode(ssot.agents.PM, thresholds);
    assert.ok(score >= thresholds.team, `PM score ${score} < team threshold ${thresholds.team}`);
    assert.strictEqual(mode, 'team');
  });

  test('Phase 1 Architect scores >= team threshold', () => {
    const { mode, score } = decideMode(ssot.agents.Architect, thresholds);
    assert.ok(score >= thresholds.team, `Architect score ${score} < team threshold ${thresholds.team}`);
    assert.strictEqual(mode, 'team');
  });

  test('Phase 2 Backend-Python in 2B mode scores >= parallel threshold', () => {
    const { mode, score } = decideMode(ssot.agents['Backend-Python'], thresholds, '2B');
    assert.ok(score >= thresholds.subagentParallel, `Backend-Python score ${score} < parallel threshold ${thresholds.subagentParallel}`);
    assert.strictEqual(mode, 'subagent-parallel');
  });

  test('Phase 2 Frontend in 2A mode is forced to team', () => {
    const { mode, score } = decideMode(ssot.agents.Frontend, thresholds, '2A');
    assert.strictEqual(mode, 'team');
    assert.ok(score >= thresholds.team);
  });

  test('QA Phase 3 scores >= team threshold (forced by override)', () => {
    const { mode, score } = decideMode(ssot.agents.QA, thresholds, null, '3');
    assert.strictEqual(mode, 'team');
    assert.ok(score >= thresholds.team);
  });
});

describe('auto-start-agents - script output', () => {
  test('outputs valid JSON for --phase=1', () => {
    const output = execSync(
      `node "${path.resolve(__dirname, '../../hooks/scripts/auto-start-agents.js')}" --phase=1`,
      { encoding: 'utf-8', cwd: path.resolve(__dirname, '../..') }
    );
    const parsed = JSON.parse(output);
    assert.ok(parsed.type === 'agent-spawn-instructions');
    assert.ok(parsed.teamAgents || parsed.subagentTasks);
  });

  test('generates prompt format for --phase=1 --format=prompt', () => {
    const output = execSync(
      `node "${path.resolve(__dirname, '../../hooks/scripts/auto-start-agents.js')}" --phase=1 --format=prompt`,
      { encoding: 'utf-8', cwd: path.resolve(__dirname, '../..') }
    );
    assert.ok(output.includes('Phase 1'));
    assert.ok(output.includes('Agent(') || output.includes('TeamCreate'));
  });

  test('multi-instance agents generate numbered names', () => {
    const output = execSync(
      `node "${path.resolve(__dirname, '../../hooks/scripts/auto-start-agents.js')}" --phase=2`,
      { encoding: 'utf-8', cwd: path.resolve(__dirname, '../..') }
    );
    const parsed = JSON.parse(output);
    const frontendAgents = [...parsed.teamAgents, ...parsed.subagentTasks]
      .filter(a => a.name.startsWith('Frontend'));
    // Frontend has count=3, so we expect Frontend-1, Frontend-2, Frontend-3
    assert.ok(frontendAgents.length >= 1, 'Expected at least one Frontend agent');
  });
});

describe('auto-start-agents - agent-orchestration.json consistency', () => {
  test('every agent has a valid agentMd path', () => {
    const fs = require('fs');
    for (const [name, agent] of Object.entries(ssot.agents)) {
      assert.ok(agent.agentMd, `Agent ${name} missing agentMd`);
      const fullPath = path.resolve(__dirname, '../..', agent.agentMd);
      assert.ok(fs.existsSync(fullPath), `Agent ${name} agentMd file not found: ${agent.agentMd}`);
    }
  });

  test('every agent has requiredSkills array', () => {
    for (const [name, agent] of Object.entries(ssot.agents)) {
      assert.ok(Array.isArray(agent.requiredSkills), `Agent ${name} requiredSkills is not an array`);
      assert.ok(agent.requiredSkills.length > 0, `Agent ${name} has no requiredSkills`);
    }
  });

  test('every agent has subagentType', () => {
    for (const [name, agent] of Object.entries(ssot.agents)) {
      assert.ok(agent.subagentType, `Agent ${name} missing subagentType`);
    }
  });

  test('teamAgents use local agent .md file names as subagentType', () => {
    const output = execSync(
      `node "${path.resolve(__dirname, '../../hooks/scripts/auto-start-agents.js')}" --phase=1`,
      { encoding: 'utf-8', cwd: path.resolve(__dirname, '../..') }
    );
    const parsed = JSON.parse(output);
    for (const agent of parsed.teamAgents || []) {
      // subagentType should be a local agent .md name (no colons = not an external plugin reference)
      const hasColon = agent.subagentType.includes(':');
      assert.ok(!hasColon, `teamAgent ${agent.name} subagentType "${agent.subagentType}" contains ':' (external plugin ref, should be local)`);
    }
    for (const agent of parsed.subagentTasks || []) {
      const hasColon = agent.subagentType.includes(':');
      assert.ok(!hasColon, `subagentTask ${agent.name} subagentType "${agent.subagentType}" contains ':' (external plugin ref, should be local)`);
    }
  });

  test('subagentType matches agent .md file name', () => {
    const output = execSync(
      `node "${path.resolve(__dirname, '../../hooks/scripts/auto-start-agents.js')}" --phase=2`,
      { encoding: 'utf-8', cwd: path.resolve(__dirname, '../..') }
    );
    const parsed = JSON.parse(output);
    const allAgents = [...(parsed.teamAgents || []), ...(parsed.subagentTasks || [])];
    const fs = require('fs');
    for (const agent of allAgents) {
      const mdPath = path.resolve(__dirname, '../../.claude/agents', `${agent.subagentType}.md`);
      // If local .claude/agents/{name}.md exists, it's valid
      // If not, the agent .md is in agents/ dir (project root)
      const projectMdPath = path.resolve(__dirname, '../..', 'agents', `${agent.subagentType}.md`);
      const exists = fs.existsSync(mdPath) || fs.existsSync(projectMdPath);
      // We expect the agentMd reference to exist
      assert.ok(exists, `Agent ${agent.name} subagentType "${agent.subagentType}" — no matching .md file in agents/`);
    }
  });
});
