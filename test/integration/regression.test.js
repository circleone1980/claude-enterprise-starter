const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadJSON, listSkillDirs, listAgentFiles, listRuleFiles, ROOT } = require('../helpers/config-loader');
const { parseMD } = require('../helpers/frontmatter-parser');

describe('regression - SKILL.md name fields', () => {
  test('ui-style-selector SKILL.md name === "ui-style-selector"', () => {
    const { frontmatter } = parseMD(path.join(ROOT, 'skills/ui-style-selector/SKILL.md'));
    assert.ok(frontmatter, 'ui-style-selector SKILL.md missing frontmatter');
    assert.strictEqual(frontmatter.name, 'ui-style-selector');
  });

  test('user-onboarding SKILL.md name === "user-onboarding"', () => {
    const { frontmatter } = parseMD(path.join(ROOT, 'skills/user-onboarding/SKILL.md'));
    assert.ok(frontmatter, 'user-onboarding SKILL.md missing frontmatter');
    assert.strictEqual(frontmatter.name, 'user-onboarding');
  });

  test('using-ce-framework SKILL.md name === "using-ce-framework"', () => {
    const { frontmatter } = parseMD(path.join(ROOT, 'skills/using-ce-framework/SKILL.md'));
    assert.ok(frontmatter, 'using-ce-framework SKILL.md missing frontmatter');
    assert.strictEqual(frontmatter.name, 'using-ce-framework');
  });

  test('tdd and code-review have no local SKILL.md (plugin-provided)', () => {
    assert.ok(!fs.existsSync(path.join(ROOT, 'skills/tdd/SKILL.md')), 'tdd should not have local SKILL.md (superpowers plugin)');
    assert.ok(!fs.existsSync(path.join(ROOT, 'skills/code-review/SKILL.md')), 'code-review should not have local SKILL.md (provided by ecc plugin)');
  });
});

describe('regression - agent .md files forbidden references', () => {
  const agentFiles = listAgentFiles();

  test('no agent .md files reference "brainstorming" skill', () => {
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(ROOT, 'agents', file), 'utf8');
      // Check for "brainstorming" as a standalone skill reference (not "brainstorm")
      const hasForbidden = /\bbrainstorming\b/.test(content);
      assert.ok(!hasForbidden, `${file} references forbidden skill "brainstorming"`);
    }
  });

  test('no agent .md files reference "systematic-debugging"', () => {
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(ROOT, 'agents', file), 'utf8');
      assert.ok(
        !content.includes('systematic-debugging'),
        `${file} references forbidden skill "systematic-debugging"`
      );
    }
  });
});

describe('regression - SSOT agent configuration', () => {
  const ssot = loadJSON('automation/agent-orchestration.json');

  test('DevOps in SSOT has ce-compound in requiredSkills', () => {
    const devOps = ssot.agents.DevOps;
    assert.ok(devOps, 'DevOps agent not found in SSOT');
    assert.ok(
      devOps.requiredSkills.includes('ce-compound'),
      `DevOps requiredSkills missing ce-compound. Got: ${devOps.requiredSkills.join(', ')}`
    );
  });
});

describe('regression - directory structure counts', () => {
  test('rules/ directory has exactly 19 .md files', () => {
    const rules = listRuleFiles();
    assert.strictEqual(rules.length, 19, `Expected 19 rule files, got ${rules.length}: ${rules.join(', ')}`);
  });

  test('agents/ directory has exactly 18 .md files', () => {
    const agents = listAgentFiles();
    assert.strictEqual(agents.length, 18, `Expected 18 agent files, got ${agents.length}: ${agents.join(', ')}`);
  });

  test('skills/ has exactly 15 subdirectories (excluding _shared)', () => {
    const skills = listSkillDirs();
    assert.strictEqual(skills.length, 15, `Expected 15 skill directories, got ${skills.length}: ${skills.join(', ')}`);
  });
});

describe('regression - no stale references', () => {
  test('no gstack/bin/ references remain in skills/ directory', () => {
    const skillDirs = listSkillDirs();
    for (const skill of skillDirs) {
      const skillDir = path.join(ROOT, 'skills', skill);
      // Check all files in skill directory
      const files = fs.readdirSync(skillDir, { recursive: true });
      for (const file of files) {
        const fullPath = path.join(skillDir, file.toString());
        if (fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf8');
          assert.ok(
            !content.includes('gstack/bin/'),
            `${skill}/${file} contains stale gstack/bin/ reference`
          );
        }
      }
    }
  });
});

describe('regression - README.md content', () => {
  test('README.md contains "19 Rule files" (English)', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert.ok(
      readme.includes('19 Rule files'),
      'README.md missing "19 Rule files"'
    );
  });

  test('README.md contains "19 个规则文件" (Chinese)', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert.ok(
      readme.includes('19 个规则文件'),
      'README.md missing "19 个规则文件"'
    );
  });
});

describe('regression - CLAUDE.md references', () => {
  test('CLAUDE.md references rules/14_worktree.md', () => {
    const claudeMd = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
    assert.ok(
      claudeMd.includes('14_worktree.md'),
      'CLAUDE.md missing reference to rules/14_worktree.md'
    );
  });
});

describe('regression - ce-work integration', () => {
  const ssot = loadJSON('automation/agent-orchestration.json');

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
