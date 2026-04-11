#!/usr/bin/env node
/**
 * ac-gate-check.js — 功能点级门禁检查
 *
 * 用法:
 *   node hooks/scripts/ac-gate-check.js --feat-id=FEAT-001 [--require-all-passed]
 *   node hooks/scripts/ac-gate-check.js --all-features-passed
 *   node hooks/scripts/ac-gate-check.js --check-ac-tests
 *
 * 退出码:
 *   0 = 通过（所有检查满足）
 *   1 = 未通过
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TRACKER_PATH = path.join(PROJECT_ROOT, 'automation', 'ac-tracker.json');

/**
 * 加载 AC Tracker
 */
function loadTracker() {
  if (!fs.existsSync(TRACKER_PATH)) {
    console.error(JSON.stringify({ passed: false, error: 'ac-tracker.json not found' }));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));
}

/**
 * 检查单个 Feature 的所有 AC 是否通过
 */
function checkFeatureGate(featId, tracker) {
  const feature = tracker.features.find(f => f.featId === featId);
  if (!feature) {
    return { passed: false, featId, error: `FEAT ${featId} not found in tracker` };
  }

  const acs = feature.acceptanceCriteria || [];
  if (acs.length === 0) {
    return { passed: false, featId, error: `FEAT ${featId} has no acceptance criteria` };
  }

  const allPassed = acs.every(ac => ac.status === 'passed');
  const acStatuses = acs.map(ac => ({ acId: ac.acId, title: ac.title, status: ac.status }));

  return {
    passed: allPassed,
    featId,
    totalACs: acs.length,
    passedACs: acs.filter(ac => ac.status === 'passed').length,
    failedACs: acs.filter(ac => ac.status === 'failed').length,
    pendingACs: acs.filter(ac => !['passed', 'failed'].includes(ac.status)).length,
    acStatuses
  };
}

/**
 * 检查所有 Feature 的所有 AC 是否通过
 */
function checkAllFeaturesPassed(tracker) {
  if (!tracker.features || tracker.features.length === 0) {
    return { passed: false, error: 'No features in tracker' };
  }

  const results = tracker.features.map(f => checkFeatureGate(f.featId, tracker));
  return {
    passed: results.every(r => r.passed),
    totalFeatures: results.length,
    passedFeatures: results.filter(r => r.passed).length,
    features: results,
    summary: {
      totalACs: results.reduce((s, r) => s + (r.totalACs || 0), 0),
      passedACs: results.reduce((s, r) => s + (r.passedACs || 0), 0),
      failedACs: results.reduce((s, r) => s + (r.failedACs || 0), 0),
      pendingACs: results.reduce((s, r) => s + (r.pendingACs || 0), 0)
    }
  };
}

/**
 * 检查每个 AC 是否有测试文件且测试文件存在
 */
function checkACTests(tracker) {
  const results = [];
  let allHaveTests = true;

  for (const feat of (tracker.features || [])) {
    for (const ac of (feat.acceptanceCriteria || [])) {
      const hasTestFile = !!ac.testFile && ac.testFile.trim() !== '' && ac.testFile !== '-';
      const testFileExists = hasTestFile && fs.existsSync(path.join(PROJECT_ROOT, ac.testFile));

      if (!hasTestFile || !testFileExists) {
        allHaveTests = false;
      }

      results.push({
        acId: ac.acId,
        featId: feat.featId,
        testFile: ac.testFile || '(none)',
        hasTestFile,
        testFileExists
      });
    }
  }

  return {
    passed: allHaveTests,
    totalACs: results.length,
    withTests: results.filter(r => r.hasTestFile && r.testFileExists).length,
    withoutTests: results.filter(r => !r.hasTestFile).length,
    missingTests: results.filter(r => r.hasTestFile && !r.testFileExists).length,
    details: results
  };
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);

  const featId = args.find(a => a.startsWith('--feat-id='))?.split('=')[1];
  const allFeatures = args.includes('--all-features-passed');
  const checkTests = args.includes('--check-ac-tests');

  const tracker = loadTracker();

  if (featId) {
    const result = checkFeatureGate(featId, tracker);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.passed ? 0 : 1);
  }

  if (allFeatures) {
    const result = checkAllFeaturesPassed(tracker);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.passed ? 0 : 1);
  }

  if (checkTests) {
    const result = checkACTests(tracker);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.passed ? 0 : 1);
  }

  // 默认: 检查所有
  console.error('Usage: node ac-gate-check.js --feat-id=FEAT-001 | --all-features-passed | --check-ac-tests');
  process.exit(1);
}

main();
