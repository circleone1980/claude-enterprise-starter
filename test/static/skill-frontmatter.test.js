const { test, describe } = require('node:test');
const assert = require('node:assert');
const { listSkillDirs, ROOT } = require('../helpers/config-loader');
const { parseFrontmatter } = require('../helpers/frontmatter-parser');
const path = require('path');
const fs = require('fs');

const EXPECTED_SKILL_COUNT = 15;

/**
 * CRLF 安全的 MD 解析 — normalize 换行后再调用 parseFrontmatter
 */
function parseSkillMD(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  return { frontmatter: parseFrontmatter(raw), content: raw };
}

describe('Skill Frontmatter - 15 个 skill 目录验证', () => {
  const skillDirs = listSkillDirs();

  test(`skill 目录数量为 ${EXPECTED_SKILL_COUNT}`, () => {
    assert.strictEqual(skillDirs.length, EXPECTED_SKILL_COUNT,
      `实际 ${skillDirs.length} 个: ${skillDirs.join(', ')}`);
  });

  test('每个 skill 目录有 SKILL.md', () => {
    const missing = [];
    for (const dir of skillDirs) {
      const skillPath = path.join(ROOT, 'skills', dir, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        missing.push(dir);
      }
    }
    assert.strictEqual(missing.length, 0, `缺少 SKILL.md: ${missing.join(', ')}`);
  });

  test('每个 SKILL.md 有 name 字段（非空）', () => {
    const empty = [];
    for (const dir of skillDirs) {
      const skillPath = path.join(ROOT, 'skills', dir, 'SKILL.md');
      const { frontmatter } = parseSkillMD(skillPath);
      if (!frontmatter || !frontmatter.name || frontmatter.name.trim() === '') {
        empty.push(dir);
      }
    }
    assert.strictEqual(empty.length, 0, `缺少 name 字段: ${empty.join(', ')}`);
  });

  test('每个 SKILL.md 有 description 字段', () => {
    const missing = [];
    for (const dir of skillDirs) {
      const skillPath = path.join(ROOT, 'skills', dir, 'SKILL.md');
      const { frontmatter } = parseSkillMD(skillPath);
      if (!frontmatter || !frontmatter.description || frontmatter.description.trim() === '') {
        missing.push(dir);
      }
    }
    assert.strictEqual(missing.length, 0, `缺少 description 字段: ${missing.join(', ')}`);
  });

  test('name 字段与目录名匹配', () => {
    /** 已知 name 与目录名不一致的映射（name → dirname） */
    const KNOWN_MISMATCHES = { 'gan-style-harness': 'gan-harness' };
    const mismatch = [];
    for (const dir of skillDirs) {
      const skillPath = path.join(ROOT, 'skills', dir, 'SKILL.md');
      const { frontmatter } = parseSkillMD(skillPath);
      const name = frontmatter ? frontmatter.name : null;
      if (name === dir) continue;
      // 允许已知的映射差异
      if (KNOWN_MISMATCHES[name] === dir) continue;
      mismatch.push(`${dir} → name="${name}"`);
    }
    assert.strictEqual(mismatch.length, 0, `name 与目录名不匹配:\n${mismatch.join('\n')}`);
  });

  test('无重复 name', () => {
    const names = [];
    for (const dir of skillDirs) {
      const skillPath = path.join(ROOT, 'skills', dir, 'SKILL.md');
      const { frontmatter } = parseSkillMD(skillPath);
      if (frontmatter && frontmatter.name) {
        names.push(frontmatter.name);
      }
    }
    const seen = new Set();
    const dupes = [];
    for (const n of names) {
      if (seen.has(n)) dupes.push(n);
      seen.add(n);
    }
    assert.strictEqual(dupes.length, 0, `重复 name: ${dupes.join(', ')}`);
  });
});
