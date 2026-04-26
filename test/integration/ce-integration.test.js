const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON, ROOT } = require('../helpers/config-loader');
const path = require('path');
const fs = require('fs');

const ssot = loadJSON('automation/agent-orchestration.json');

describe('CE Integration - Knowledge Compounder', () => {
  test('Knowledge-Compounder exists in SSOT', () => {
    assert.ok(ssot.agents['Knowledge-Compounder'], 'Knowledge-Compounder not in SSOT');
  });

  test('Knowledge-Compounder has ce-compound in requiredSkills', () => {
    const kc = ssot.agents['Knowledge-Compounder'];
    assert.ok(kc, 'Knowledge-Compounder not found');
    assert.ok(kc.requiredSkills.includes('ce-compound'),
      `Missing ce-compound. Got: ${kc.requiredSkills.join(', ')}`);
  });

  test('Knowledge-Compounder has no dependencies', () => {
    const kc = ssot.agents['Knowledge-Compounder'];
    assert.ok(kc, 'Knowledge-Compounder not found');
    assert.deepStrictEqual(kc.dependencies || [], []);
  });

  test('Knowledge-Compounder agentMd file exists', () => {
    const kc = ssot.agents['Knowledge-Compounder'];
    assert.ok(kc, 'Knowledge-Compounder not found');
    const fullPath = path.join(ROOT, kc.agentMd);
    assert.ok(fs.existsSync(fullPath), `File not found: ${kc.agentMd}`);
  });

  test('Knowledge-Compounder has compoundConfig', () => {
    const kc = ssot.agents['Knowledge-Compounder'];
    assert.ok(kc.compoundConfig, 'Missing compoundConfig');
    assert.ok(Array.isArray(kc.compoundConfig.triggerPhases));
    assert.ok(kc.compoundConfig.outputDir);
  });
});

describe('CE Integration - Review-Champion CE skills', () => {
  test('Review-Champion has ce-review in requiredSkills', () => {
    const rc = ssot.agents['Review-Champion'];
    assert.ok(rc.requiredSkills.includes('ce-review'),
      `Missing ce-review. Got: ${rc.requiredSkills.join(', ')}`);
  });

  test('Review-Champion has ce-brainstorm in requiredSkills', () => {
    const rc = ssot.agents['Review-Champion'];
    assert.ok(rc.requiredSkills.includes('ce-brainstorm'),
      `Missing ce-brainstorm. Got: ${rc.requiredSkills.join(', ')}`);
  });
});

describe('CE Integration - QA', () => {
  test('QA has ce-review in requiredSkills', () => {
    const qa = ssot.agents['QA'];
    assert.ok(qa.requiredSkills.includes('ce-review'),
      `Missing ce-review. Got: ${qa.requiredSkills.join(', ')}`);
  });
});

describe('CE Integration - DevOps', () => {
  test('DevOps has ce-review in requiredSkills', () => {
    const devops = ssot.agents['DevOps'];
    assert.ok(devops.requiredSkills.includes('ce-review'),
      `Missing ce-review. Got: ${devops.requiredSkills.join(', ')}`);
  });

  test('DevOps has ce-compound in requiredSkills', () => {
    const devops = ssot.agents['DevOps'];
    assert.ok(devops.requiredSkills.includes('ce-compound'),
      `Missing ce-compound. Got: ${devops.requiredSkills.join(', ')}`);
  });
});

describe('CE Integration - Dev agents ce-work', () => {
  test('Frontend has ce-work in requiredSkills', () => {
    assert.ok(ssot.agents.Frontend.requiredSkills.includes('ce-work'),
      'Frontend missing ce-work');
  });

  test('Backend-Java has ce-work in requiredSkills', () => {
    assert.ok(ssot.agents['Backend-Java'].requiredSkills.includes('ce-work'),
      'Backend-Java missing ce-work');
  });

  test('Backend-Python has ce-work in requiredSkills', () => {
    assert.ok(ssot.agents['Backend-Python'].requiredSkills.includes('ce-work'),
      'Backend-Python missing ce-work');
  });

  test('GAN-Generator has ce-work in requiredSkills', () => {
    assert.ok(ssot.agents['GAN-Generator'].requiredSkills.includes('ce-work'),
      'GAN-Generator missing ce-work');
  });
});

describe('CE Integration - GAN config', () => {
  test('ganConfig has multiReview configuration', () => {
    const gc = ssot.ganConfig;
    assert.ok(gc.multiReview, 'Missing multiReview');
    assert.strictEqual(gc.multiReview.enabled, true);
    assert.ok(Array.isArray(gc.multiReview.reviewers));
    assert.ok(gc.multiReview.mergeStrategy);
  });
});

describe('CE Integration - Skill format consistency', () => {
  test('all ce-* requiredSkills use ce- prefix (not ce:)', () => {
    const violations = [];
    for (const [name, agent] of Object.entries(ssot.agents)) {
      for (const skill of (agent.requiredSkills || [])) {
        if (skill.startsWith('ce:')) {
          violations.push(`${name} → ${skill}`);
        }
      }
    }
    assert.strictEqual(violations.length, 0,
      `Old ce: prefix found:\n${violations.join('\n')}`);
  });

  test('ce-compound appears in at least 2 agents', () => {
    const count = Object.values(ssot.agents).filter(a =>
      (a.requiredSkills || []).includes('ce-compound')
    ).length;
    assert.ok(count >= 2, `ce-compound only in ${count} agents (expected >= 2)`);
  });

  test('ce-review appears in at least 3 agents', () => {
    const count = Object.values(ssot.agents).filter(a =>
      (a.requiredSkills || []).includes('ce-review')
    ).length;
    assert.ok(count >= 3, `ce-review only in ${count} agents (expected >= 3)`);
  });

  test('ce-work appears in at least 3 agents', () => {
    const count = Object.values(ssot.agents).filter(a =>
      (a.requiredSkills || []).includes('ce-work')
    ).length;
    assert.ok(count >= 3, `ce-work only in ${count} agents (expected >= 3)`);
  });
});
