const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');

function loadJSON(relPath) {
  const fp = path.join(ROOT, relPath);
  const raw = fs.readFileSync(fp, 'utf8');
  return JSON.parse(raw);
}

function listDir(relPath) {
  const fp = path.join(ROOT, relPath);
  return fs.readdirSync(fp);
}

function listSkillDirs() {
  const skillsDir = path.join(ROOT, 'skills');
  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== '_shared')
    .map(d => d.name);
}

function listAgentFiles() {
  const agentsDir = path.join(ROOT, 'agents');
  return fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
}

function listRuleFiles() {
  const rulesDir = path.join(ROOT, 'rules');
  return fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
}

module.exports = { loadJSON, listDir, listSkillDirs, listAgentFiles, listRuleFiles, ROOT };
