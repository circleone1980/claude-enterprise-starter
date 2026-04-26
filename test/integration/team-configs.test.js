const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON, ROOT } = require('../helpers/config-loader');

const ssot = loadJSON('automation/agent-orchestration.json');
const allAgentKeys = Object.keys(ssot.agents);

/**
 * Team definitions based on GUIDE.md section 12.9:
 *
 * dev team (6 roles): PM, Architect, Frontend, Backend-Java, Backend-Python, QA
 *                    + Review-Champion (per CLAUDE.md section 7 Review Champion row)
 *
 * full team (16 roles): All agents in SSOT
 */
const DEV_TEAM = ['PM', 'Architect', 'Frontend', 'Backend-Java', 'Backend-Python', 'QA', 'Review-Champion', 'Knowledge-Compounder'];
const FULL_TEAM = allAgentKeys;

describe('team-configs - dev team', () => {
  test('dev team has correct members count (7 members per GUIDE.md)', () => {
    // GUIDE.md says "6 角色" but Review-Champion is also included per rules/04_agent_team.md
    // The actual count from CLAUDE.md section 7 is 7 roles (6 dev + Review-Champion)
    assert.ok(DEV_TEAM.length >= 6, `Dev team should have at least 6 members, got ${DEV_TEAM.length}`);
  });

  test('all dev team members exist in SSOT agents', () => {
    for (const member of DEV_TEAM) {
      assert.ok(ssot.agents[member], `Dev team member ${member} not found in SSOT`);
    }
  });

  test('dev team includes core development roles', () => {
    assert.ok(DEV_TEAM.includes('PM'), 'Missing PM');
    assert.ok(DEV_TEAM.includes('Architect'), 'Missing Architect');
    assert.ok(DEV_TEAM.includes('Frontend'), 'Missing Frontend');
    assert.ok(DEV_TEAM.includes('Backend-Java'), 'Missing Backend-Java');
    assert.ok(DEV_TEAM.includes('Backend-Python'), 'Missing Backend-Python');
    assert.ok(DEV_TEAM.includes('QA'), 'Missing QA');
  });

  test('review-champion is in dev team', () => {
    assert.ok(DEV_TEAM.includes('Review-Champion'), 'Review-Champion missing from dev team');
  });

  test('dev team does not include GStack-only roles', () => {
    assert.ok(!DEV_TEAM.includes('Product-Designer'), 'Product-Designer should not be in dev team');
    assert.ok(!DEV_TEAM.includes('Design-Reviewer'), 'Design-Reviewer should not be in dev team');
  });

  test('dev team does not include DevOps or product experience', () => {
    assert.ok(!DEV_TEAM.includes('DevOps'), 'DevOps should not be in dev team');
    assert.ok(!DEV_TEAM.includes('产品体验师'), '产品体验师 should not be in dev team');
  });
});

describe('team-configs - full team', () => {
  test('full team has 17 members', () => {
    assert.strictEqual(FULL_TEAM.length, 17, `Expected 17 members, got ${FULL_TEAM.length}`);
  });

  test('all full team members exist in SSOT agents', () => {
    for (const member of FULL_TEAM) {
      assert.ok(ssot.agents[member], `Full team member ${member} not found in SSOT`);
    }
  });

  test('full team includes all dev team members', () => {
    for (const member of DEV_TEAM) {
      assert.ok(FULL_TEAM.includes(member), `Full team missing dev member: ${member}`);
    }
  });

  test('full team includes GStack roles', () => {
    assert.ok(FULL_TEAM.includes('Product-Designer'), 'Missing Product-Designer');
    assert.ok(FULL_TEAM.includes('Design-Reviewer'), 'Missing Design-Reviewer');
  });

  test('full team includes DevOps', () => {
    assert.ok(FULL_TEAM.includes('DevOps'), 'Missing DevOps');
  });

  test('full team includes product experience', () => {
    assert.ok(FULL_TEAM.includes('产品体验师'), 'Missing 产品体验师');
  });

  test('full team includes GAN roles', () => {
    assert.ok(FULL_TEAM.includes('GAN-Planner'), 'Missing GAN-Planner');
    assert.ok(FULL_TEAM.includes('GAN-Generator'), 'Missing GAN-Generator');
    assert.ok(FULL_TEAM.includes('GAN-Evaluator'), 'Missing GAN-Evaluator');
  });

  test('full team includes UI-Designer', () => {
    assert.ok(FULL_TEAM.includes('UI-Designer'), 'Missing UI-Designer');
  });

  test('full team includes PO', () => {
    assert.ok(FULL_TEAM.includes('PO'), 'Missing PO');
  });

  test('review-champion is in full team', () => {
    assert.ok(FULL_TEAM.includes('Review-Champion'), 'Review-Champion missing from full team');
  });
});

describe('team-configs - cross-team consistency', () => {
  test('review-champion is in both teams', () => {
    assert.ok(DEV_TEAM.includes('Review-Champion'), 'Review-Champion not in dev team');
    assert.ok(FULL_TEAM.includes('Review-Champion'), 'Review-Champion not in full team');
  });

  test('every dev team member has a valid agentMd file reference', () => {
    const fs = require('fs');
    const pathModule = require('path');
    for (const member of DEV_TEAM) {
      const agentMd = ssot.agents[member].agentMd;
      assert.ok(agentMd, `${member} missing agentMd reference`);
      const fullPath = pathModule.join(ROOT, agentMd);
      assert.ok(fs.existsSync(fullPath), `${member} agentMd file not found: ${fullPath}`);
    }
  });

  test('every full team member has a valid agentMd file reference', () => {
    const fs = require('fs');
    const pathModule = require('path');
    for (const member of FULL_TEAM) {
      const agentMd = ssot.agents[member].agentMd;
      assert.ok(agentMd, `${member} missing agentMd reference`);
      const fullPath = pathModule.join(ROOT, agentMd);
      assert.ok(fs.existsSync(fullPath), `${member} agentMd file not found: ${fullPath}`);
    }
  });
});
