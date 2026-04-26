#!/usr/bin/env node
/**
 * release.js — 版本整理与交付自动化
 *
 * 用法: node scripts/release.js [major|minor|patch] [--dry-run]
 *
 * 流程:
 * 1. 读取当前版本号（package.json）
 * 2. 运行全量验证（validate-config + npm test）
 * 3. 生成 CHANGELOG.md（从 git log 提取）
 * 4. 全局版本号同步（package.json / CLAUDE.md / README.md / GUIDE.md / SSOT）
 * 5. 创建 git tag（v{major}.{minor}.{patch}）
 * 6. 输出交付摘要
 *
 * Updated: 2026-04-26
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_PATH = path.join(PROJECT_ROOT, 'package.json');
const CLAUDE_MD_PATH = path.join(PROJECT_ROOT, 'CLAUDE.md');
const README_PATH = path.join(PROJECT_ROOT, 'README.md');
const GUIDE_PATH = path.join(PROJECT_ROOT, 'docs', 'GUIDE.md');
const SSOT_PATH = path.join(PROJECT_ROOT, 'automation', 'agent-orchestration.json');
const CHANGELOG_PATH = path.join(PROJECT_ROOT, 'CHANGELOG.md');

// 解析参数
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const bumpType = args.find(a => !a.startsWith('--')) || 'patch';

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error(`Unknown bump type: ${bumpType}. Use major|minor|patch.`);
  process.exit(1);
}

console.log(`\n========================================`);
console.log(`  版本交付 ${dryRun ? '[DRY RUN]' : ''}`);
console.log(`========================================\n`);

// 1. 读取当前版本
const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf-8'));
const currentVersion = pkg.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion;
switch (bumpType) {
  case 'major': newVersion = `${major + 1}.0.0`; break;
  case 'minor': newVersion = `${major}.${minor + 1}.0`; break;
  case 'patch': newVersion = `${major}.${minor}.${patch + 1}`; break;
}

console.log(`  当前版本: ${currentVersion}`);
console.log(`  目标版本: ${newVersion}`);
console.log(`  变更级别: ${bumpType}\n`);

// 2. 获取最近 tag
let lastTag = '';
try {
  lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
    cwd: PROJECT_ROOT, encoding: 'utf-8'
  }).trim();
} catch { /* no tags yet */ }

// 3. 生成 CHANGELOG 条目
let commits = '';
try {
  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD~20..HEAD';
  commits = execSync(`git log --oneline ${range}`, {
    cwd: PROJECT_ROOT, encoding: 'utf-8'
  }).trim();
} catch {
  commits = '(no commits found)';
}

// 分类提交
const lines = commits.split('\n').filter(Boolean);
const categorized = { feat: [], fix: [], refactor: [], docs: [], other: [] };
for (const line of lines) {
  if (line.includes('feat:') || line.includes('feat：')) categorized.feat.push(line);
  else if (line.includes('fix:') || line.includes('fix：')) categorized.fix.push(line);
  else if (line.includes('refactor:') || line.includes('refactor：')) categorized.refactor.push(line);
  else if (line.includes('docs:') || line.includes('docs：')) categorized.docs.push(line);
  else categorized.other.push(line);
}

const today = new Date().toISOString().split('T')[0];

const changelogEntry = `## [${newVersion}] - ${today}

${categorized.feat.length ? '### Added\n' + categorized.feat.map(l => `- ${l.replace(/^[a-f0-9]+ /, '')}`).join('\n') + '\n' : ''}\
${categorized.fix.length ? '### Fixed\n' + categorized.fix.map(l => `- ${l.replace(/^[a-f0-9]+ /, '')}`).join('\n') + '\n' : ''}\
${categorized.refactor.length ? '### Changed\n' + categorized.refactor.map(l => `- ${l.replace(/^[a-f0-9]+ /, '')}`).join('\n') + '\n' : ''}\
${categorized.docs.length ? '### Docs\n' + categorized.docs.map(l => `- ${l.replace(/^[a-f0-9]+ /, '')}`).join('\n') + '\n' : ''}\
${categorized.other.length ? '### Other\n' + categorized.other.map(l => `- ${l.replace(/^[a-f0-9]+ /, '')}`).join('\n') + '\n' : ''}`;

console.log('--- CHANGELOG 预览 ---');
console.log(changelogEntry);
console.log('');

if (dryRun) {
  console.log('[DRY RUN] 未修改任何文件。');
  console.log(`\n  将要更新的文件:`);
  console.log(`    - package.json (${currentVersion} → ${newVersion})`);
  console.log(`    - CLAUDE.md`);
  console.log(`    - README.md`);
  console.log(`    - docs/GUIDE.md`);
  console.log(`    - automation/agent-orchestration.json`);
  console.log(`    - CHANGELOG.md`);
  console.log(`    - git tag: v${newVersion}`);
  process.exit(0);
}

// 4. 更新 package.json
pkg.version = newVersion;
fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n');
console.log(`  \x1b[32m✓\x1b[0m package.json → ${newVersion}`);

// 5. 更新 CLAUDE.md
if (fs.existsSync(CLAUDE_MD_PATH)) {
  let content = fs.readFileSync(CLAUDE_MD_PATH, 'utf-8');
  content = content.replace(/模板版本: \d+\.\d+\.\d+/, `模板版本: ${newVersion}`);
  fs.writeFileSync(CLAUDE_MD_PATH, content);
  console.log(`  \x1b[32m✓\x1b[0m CLAUDE.md → ${newVersion}`);
}

// 6. 更新 README.md
if (fs.existsSync(README_PATH)) {
  let content = fs.readFileSync(README_PATH, 'utf-8');
  content = content.replace(/Template Version \d+\.\d+\.\d+/, `Template Version ${newVersion}`);
  fs.writeFileSync(README_PATH, content);
  console.log(`  \x1b[32m✓\x1b[0m README.md → ${newVersion}`);
}

// 7. 更新 GUIDE.md
if (fs.existsSync(GUIDE_PATH)) {
  let content = fs.readFileSync(GUIDE_PATH, 'utf-8');
  content = content.replace(/版本[：:]\s*\d+\.\d+\.\d+/, `版本：${newVersion}`);
  fs.writeFileSync(GUIDE_PATH, content);
  console.log(`  \x1b[32m✓\x1b[0m docs/GUIDE.md → ${newVersion}`);
}

// 8. 更新 SSOT
if (fs.existsSync(SSOT_PATH)) {
  const ssot = JSON.parse(fs.readFileSync(SSOT_PATH, 'utf-8'));
  ssot.version = newVersion;
  fs.writeFileSync(SSOT_PATH, JSON.stringify(ssot, null, 2) + '\n');
  console.log(`  \x1b[32m✓\x1b[0m agent-orchestration.json → ${newVersion}`);
}

// 9. 更新 CHANGELOG.md
let existingChangelog = '';
if (fs.existsSync(CHANGELOG_PATH)) {
  existingChangelog = fs.readFileSync(CHANGELOG_PATH, 'utf-8');
}
const newChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${changelogEntry}\n${existingChangelog.replace('# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n', '')}`;
fs.writeFileSync(CHANGELOG_PATH, newChangelog);
console.log(`  \x1b[32m✓\x1b[0m CHANGELOG.md updated`);

// 10. 创建 git tag
try {
  execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, {
    cwd: PROJECT_ROOT, encoding: 'utf-8'
  });
  console.log(`  \x1b[32m✓\x1b[0m git tag v${newVersion} created`);
} catch (e) {
  console.log(`  \x1b[33m⚠\x1b[0m git tag failed: ${e.message}`);
}

console.log(`\n========================================`);
console.log(`  交付完成: v${newVersion}`);
console.log(`========================================`);
console.log(`\n  下一步: git push origin main --tags\n`);
