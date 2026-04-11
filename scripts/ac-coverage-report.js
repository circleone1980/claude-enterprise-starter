#!/usr/bin/env node
/**
 * ac-coverage-report.js — AC 覆盖率报告生成
 *
 * 用法:
 *   node scripts/ac-coverage-report.js [--changed-files] [--feat-id=FEAT-001] [--format=markdown|json]
 *
 * 功能:
 *   1. 加载 ac-tracker.json
 *   2. 将变更文件映射到 Feature（通过 AC testFile 字段 + 源文件启发式匹配）
 *   3. 按 Feature 报告 AC 状态
 *   4. 输出 Markdown 或 JSON 覆盖率报告
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TRACKER_PATH = path.join(PROJECT_ROOT, 'automation', 'ac-tracker.json');

// ─── 工具函数 ──────────────────────────────────────

/**
 * 加载 AC Tracker
 */
function loadTracker() {
  if (!fs.existsSync(TRACKER_PATH)) {
    console.error('Error: ac-tracker.json not found. Run `node scripts/ac-tracker-sync.js` first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));
}

/**
 * 获取 git 变更文件列表
 */
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD~1 2>/dev/null || git diff --name-only --cached 2>/dev/null || git status --porcelain', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8'
    });
    return output.trim().split('\n').filter(f => f.trim() !== '').map(f => f.replace(/^.\s+/, ''));
  } catch {
    return [];
  }
}

/**
 * 启发式: 从测试文件路径推断源文件路径
 */
function inferSourceFiles(testFile) {
  if (!testFile) return [];
  const sources = [];

  // src/auth/auth.spec.ts → src/auth/auth.ts
  const srcMatch = testFile.replace(/\.spec\.(ts|tsx|js|jsx)$/, '.$1');
  sources.push(srcMatch);

  // tests/unit/auth.test.ts → src/auth.ts
  const testDirMatch = testFile
    .replace(/^tests\/unit\//, 'src/')
    .replace(/^tests\/integration\//, 'src/')
    .replace(/\.test\.(ts|tsx|js|jsx|py|java)$/, '.$1');
  sources.push(testDirMatch);

  // test/auth/auth_test.py → src/auth/auth.py
  const pyMatch = testFile
    .replace(/^test\//, 'src/')
    .replace(/_test\.py$/, '.py');
  sources.push(pyMatch);

  // src/test/java/...Test.java → src/main/java/....java
  const javaMatch = testFile.replace(/src\/test\/java\//, 'src/main/java/').replace(/Test\.java$/, '.java');
  sources.push(javaMatch);

  return [...new Set(sources)];
}

/**
 * 将变更文件映射到 Features
 */
function mapFilesToFeatures(tracker, changedFiles) {
  const featureMap = new Map(); // featId → { feature, acs: [{ac, matchedFiles}] }

  for (const feature of (tracker.features || [])) {
    const acs = [];

    for (const ac of (feature.acceptanceCriteria || [])) {
      const matchedFiles = [];

      // 通过 testFile 直接匹配
      if (ac.testFile && changedFiles.includes(ac.testFile)) {
        matchedFiles.push(ac.testFile);
      }

      // 通过推断的源文件匹配
      const inferredSources = inferSourceFiles(ac.testFile);
      for (const src of inferredSources) {
        if (changedFiles.includes(src)) {
          matchedFiles.push(src);
        }
      }

      // 通过 Feature 模块路径匹配（如果 ac 有 modulePath 字段）
      if (ac.modulePath) {
        for (const cf of changedFiles) {
          if (cf.startsWith(ac.modulePath)) {
            matchedFiles.push(cf);
          }
        }
      }

      if (matchedFiles.length > 0) {
        acs.push({ ac, matchedFiles: [...new Set(matchedFiles)] });
      }
    }

    if (acs.length > 0) {
      featureMap.set(feature.featId, { feature, acs });
    }
  }

  return featureMap;
}

/**
 * 按 Feature ID 生成报告
 */
function reportByFeature(tracker, featId) {
  const feature = tracker.features?.find(f => f.featId === featId);
  if (!feature) {
    console.error(`Error: Feature ${featId} not found in tracker`);
    process.exit(1);
  }
  return { [featId]: { feature, acs: (feature.acceptanceCriteria || []).map(ac => ({ ac, matchedFiles: [] })) } };
}

// ─── 输出格式 ──────────────────────────────────────

/**
 * Markdown 格式输出
 */
function outputMarkdown(featureMap, tracker) {
  const stats = tracker.statistics || {};
  const totalACs = stats.total || 0;
  const passedACs = stats.passed || 0;
  const verifiedACs = stats.verified || 0;
  const failedACs = stats.failed || 0;
  const passRate = totalACs > 0 ? ((passedACs / totalACs) * 100).toFixed(1) : '0.0';

  console.log('# AC Coverage Report\n');
  console.log(`**Generated**: ${new Date().toISOString()}`);
  console.log(`**Overall Pass Rate**: ${passRate}% (${passedACs}/${totalACs})\n`);

  if (featureMap.size === 0) {
    console.log('No matching features found for changed files.\n');
    console.log('## Global Statistics\n');
    console.log(`| Status | Count |`);
    console.log(`|--------|-------|`);
    console.log(`| draft | ${stats.draft || 0} |`);
    console.log(`| approved | ${stats.approved || 0} |`);
    console.log(`| test_written | ${stats.test_written || 0} |`);
    console.log(`| verified | ${stats.verified || 0} |`);
    console.log(`| passed | ${stats.passed || 0} |`);
    console.log(`| failed | ${stats.failed || 0} |`);
    return;
  }

  for (const [featId, { feature, acs }] of featureMap) {
    const acStatusIcon = (s) => {
      switch (s) {
        case 'passed': return '✅';
        case 'verified': return '✔️';
        case 'test_written': return '🧪';
        case 'approved': return '📋';
        case 'failed': return '❌';
        default: return '⬜';
      }
    };

    console.log(`## ${featId}: ${feature.name || '(unnamed)'}\n`);
    console.log(`| AC ID | Title | Status | Test File |`);
    console.log(`|-------|-------|--------|-----------|`);

    for (const { ac, matchedFiles } of acs) {
      const icon = acStatusIcon(ac.status);
      console.log(`| ${ac.acId} | ${ac.title || '-'} | ${icon} ${ac.status || 'draft'} | ${ac.testFile || '-'} |`);
    }

    console.log('');
  }

  // 未覆盖的变更文件
  const allMatched = new Set();
  for (const { acs } of featureMap.values()) {
    for (const { matchedFiles } of acs) {
      matchedFiles.forEach(f => allMatched.add(f));
    }
  }
}

/**
 * JSON 格式输出
 */
function outputJSON(featureMap, tracker) {
  const result = {
    generatedAt: new Date().toISOString(),
    statistics: tracker.statistics || {},
    features: {}
  };

  for (const [featId, { feature, acs }] of featureMap) {
    result.features[featId] = {
      name: feature.name,
      priority: feature.priority,
      acs: acs.map(({ ac, matchedFiles }) => ({
        acId: ac.acId,
        title: ac.title,
        status: ac.status,
        testFile: ac.testFile || null,
        matchedFiles
      }))
    };
  }

  console.log(JSON.stringify(result, null, 2));
}

// ─── 主函数 ────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  const useChangedFiles = args.includes('--changed-files');
  const featId = args.find(a => a.startsWith('--feat-id='))?.split('=')[1];
  const format = (args.find(a => a.startsWith('--format='))?.split('=')[1]) || 'markdown';

  const tracker = loadTracker();

  let featureMap;

  if (featId) {
    // 单 Feature 模式
    const report = reportByFeature(tracker, featId);
    featureMap = new Map();
    if (report[featId]) {
      featureMap.set(featId, report[featId]);
    }
  } else if (useChangedFiles) {
    // 变更文件映射模式
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      console.log('[ac-coverage-report] No changed files detected');
      process.exit(0);
    }
    featureMap = mapFilesToFeatures(tracker, changedFiles);
  } else {
    // 全量模式：所有 features
    featureMap = new Map();
    for (const feature of (tracker.features || [])) {
      featureMap.set(feature.featId, {
        feature,
        acs: (feature.acceptanceCriteria || []).map(ac => ({ ac, matchedFiles: [] }))
      });
    }
  }

  if (format === 'json') {
    outputJSON(featureMap, tracker);
  } else {
    outputMarkdown(featureMap, tracker);
  }
}

main();
