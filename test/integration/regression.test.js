const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadJSON, listSkillDirs, listAgentFiles, listRuleFiles, ROOT } = require('../helpers/config-loader');
const { parseMD } = require('../helpers/frontmatter-parser');

describe('regression - SKILL.md name fields', () => {
  test('tdd SKILL.md name === "tdd"', () => {
    const { frontmatter } = parseMD(path.join(ROOT, 'skills/tdd/SKILL.md'));
    assert.ok(frontmatter, 'tdd SKILL.md missing frontmatter');
    assert.strictEqual(frontmatter.name, 'tdd');
  });

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

  test('code-review SKILL.md has name field', () => {
    const { frontmatter } = parseMD(path.join(ROOT, 'skills/code-review/SKILL.md'));
    assert.ok(frontmatter, 'code-review SKILL.md missing frontmatter');
    assert.ok(frontmatter.name, 'code-review SKILL.md missing name field');
    assert.strictEqual(frontmatter.name, 'code-review');
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
  test('rules/ directory has exactly 17 .md files', () => {
    const rules = listRuleFiles();
    assert.strictEqual(rules.length, 17, `Expected 17 rule files, got ${rules.length}: ${rules.join(', ')}`);
  });

  test('agents/ directory has exactly 16 .md files', () => {
    const agents = listAgentFiles();
    assert.strictEqual(agents.length, 16, `Expected 16 agent files, got ${agents.length}: ${agents.join(', ')}`);
  });

  test('skills/ has exactly 38 subdirectories (excluding _shared)', () => {
    const skills = listSkillDirs();
    assert.strictEqual(skills.length, 38, `Expected 38 skill directories, got ${skills.length}: ${skills.join(', ')}`);
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
  test('README.md contains "17 Rule files" (English)', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert.ok(
      readme.includes('17 Rule files'),
      'README.md missing "17 Rule files"'
    );
  });

  test('README.md contains "17 个规则文件" (Chinese)', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert.ok(
      readme.includes('17 个规则文件'),
      'README.md missing "17 个规则文件"'
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
