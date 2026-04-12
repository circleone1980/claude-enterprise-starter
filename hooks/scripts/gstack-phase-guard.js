#!/usr/bin/env node

/**
 * GStack Phase Guard - Validates Phase 0.5 gate conditions
 * before allowing advance to Phase 1.
 *
 * Trigger: PostToolUse on TaskUpdate when phase transitions from 0.5 to 1.
 *
 * Exit codes:
 *   0 - Pass (conditions met or GStack disabled)
 *   1 - Fail with warning
 */

const fs = require('fs');
const path = require('path');

const TOOL_INPUT = process.env.TOOL_INPUT;
const ROOT_DIR = path.join(__dirname, '..', '..');

function checkGstackEnabled() {
  try {
    const orchPath = path.join(ROOT_DIR, 'automation', 'agent-orchestration.json');
    const orch = JSON.parse(fs.readFileSync(orchPath, 'utf8'));
    return orch.gstackConfig && orch.gstackConfig.enabled === true;
  } catch (e) {
    return false;
  }
}

function checkFileExists(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  return fs.existsSync(fullPath);
}

function checkFileNotEmpty(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) return false;
  try {
    const content = fs.readFileSync(fullPath, 'utf8').trim();
    return content.length > 0;
  } catch (e) {
    return false;
  }
}

function checkScore() {
  try {
    const scorePath = path.join(ROOT_DIR, 'workspace', 'docs', 'design', 'IMPLEMENTATION_PLAN.json');
    if (!fs.existsSync(scorePath)) return { pass: false, score: 0 };
    const data = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
    const score = data.overallScore || 0;
    return { pass: score >= 7.0, score };
  } catch (e) {
    return { pass: false, score: 0 };
  }
}

// Main
if (!checkGstackEnabled()) {
  // GStack disabled, pass through
  process.exit(0);
}

const checks = [
  { name: 'DESIGN.md', check: () => checkFileNotEmpty('workspace/docs/design/DESIGN.md') },
  { name: 'OFFICE_HOURS.md', check: () => checkFileNotEmpty('workspace/docs/design/OFFICE_HOURS.md') },
  { name: 'IMPLEMENTATION_PLAN.md', check: () => checkFileNotEmpty('workspace/docs/design/IMPLEMENTATION_PLAN.md') },
  { name: 'Score >= 7.0', check: () => checkScore().pass },
];

const failures = checks.filter(c => !c.check());

if (failures.length > 0) {
  console.log('[GStack Phase Guard] Phase 0.5 conditions not met:');
  failures.forEach(f => console.log(`  ✗ ${f.name}`));
  console.log('\n  Please complete Phase 0.5 before advancing to Phase 1.');
  process.exit(1);
}

const scoreResult = checkScore();
console.log(`[GStack Phase Guard] All conditions met. Overall score: ${scoreResult.score}/10`);
process.exit(0);
