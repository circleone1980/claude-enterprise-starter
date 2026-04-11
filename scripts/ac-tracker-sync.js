#!/usr/bin/env node
/**
 * ac-tracker-sync.js — 从 acceptance-criteria.md 同步 AC 数据到 ac-tracker.json
 *
 * 功能:
 *   1. 解析 docs/requirements/acceptance-criteria.md 提取 FEAT ID 和 AC ID
 *   2. 读取当前 automation/ac-tracker.json
 *   3. 合并：新增 AC 添加，已有 AC 保留状态
 *   4. 重算 statistics
 *   5. 写回 ac-tracker.json
 *
 * 用法:
 *   node scripts/ac-tracker-sync.js
 *   node scripts/ac-tracker-sync.js --dry-run    # 仅输出，不写文件
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AC_MD_PATH = path.join(PROJECT_ROOT, 'docs', 'requirements', 'acceptance-criteria.md');
const TRACKER_PATH = path.join(PROJECT_ROOT, 'automation', 'ac-tracker.json');

// CLI 参数
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

/**
 * 解析 acceptance-criteria.md 提取 Feature 和 AC 结构
 * @param {string} markdownPath
 * @returns {{ features: Array }}
 */
function parseAcceptanceCriteria(markdownPath) {
  if (!fs.existsSync(markdownPath)) {
    console.error('[ac-sync] acceptance-criteria.md 不存在:', markdownPath);
    return { features: [] };
  }

  const content = fs.readFileSync(markdownPath, 'utf-8');
  const features = [];

  // 匹配 FEAT 标题: ### FEAT-001: xxx
  const featRegex = /^### (FEAT-\d{3}):\s*(.+)$/gm;
  // 匹配 AC 标题: #### AC-F001-01: xxx
  const acRegex = /^#### (AC-F\d{3}-\d{2}):\s*(.+)$/gm;
  // 匹配所属 Feature
  const belongRegex = /^\*\*所属 Feature\*\*:\s*(FEAT-\d{3})/m;
  // 匹配优先级
  const priorityRegex = /^\*\*优先级\*\*:\s*(P\d)/m;
  // 匹配状态
  const statusRegex = /^\*\*状态\*\*:\s*(\w+)/m;
  // 匹配测试文件
  const testFileRegex = /^-\s*测试文件:\s*(.+)/m;

  // 提取所有 FEAT
  const featMatches = [];
  let match;
  while ((match = featRegex.exec(content)) !== null) {
    featMatches.push({ id: match[1], name: match[2].trim(), index: match.index });
  }

  // 提取所有 AC
  const acMatches = [];
  while ((match = acRegex.exec(content)) !== null) {
    acMatches.push({ id: match[1], title: match[2].trim(), index: match.index });
  }

  // 为每个 AC 查找其所属 FEAT（通过在文档中的位置）
  for (const ac of acMatches) {
    // 查找 AC 前面最近的 FEAT
    let parentFeat = null;
    for (const feat of featMatches) {
      if (feat.index < ac.index) {
        parentFeat = feat;
      }
    }

    // 提取 AC 块内容（从 AC 标题到下一个 AC 或 FEAT 标题）
    const nextHeading = content.indexOf('\n#### ', ac.index + 1);
    const nextFeat = content.indexOf('\n### ', ac.index + 1);
    let blockEnd = content.length;
    if (nextHeading > 0) blockEnd = Math.min(blockEnd, nextHeading);
    if (nextFeat > 0) blockEnd = Math.min(blockEnd, nextFeat);

    const block = content.substring(ac.index, blockEnd);

    // 提取字段
    const belongMatch = block.match(belongRegex);
    const priorityMatch = block.match(priorityRegex);
    const statusMatch = block.match(statusRegex);
    const testFileMatch = block.match(testFileRegex);

    const featId = belongMatch ? belongMatch[1] : (parentFeat ? parentFeat.id : 'FEAT-000');
    const acData = {
      acId: ac.id,
      title: ac.title,
      status: statusMatch ? statusMatch[1] : 'draft',
      priority: priorityMatch ? priorityMatch[1] : 'P1',
      testFile: testFileMatch ? testFileMatch[1].trim() : '',
      verifiedAt: null,
      verifiedBy: null
    };

    // 找到或创建 feature
    let feature = features.find(f => f.featId === featId);
    if (!feature) {
      const parentFeatData = featMatches.find(f => f.id === featId);
      feature = {
        featId,
        name: parentFeatData ? parentFeatData.name : '[未知功能]',
        priority: 'P0',
        acceptanceCriteria: []
      };
      features.push(feature);
    }

    feature.acceptanceCriteria.push(acData);
  }

  return { features };
}

/**
 * 合并解析结果与已有 tracker
 * @param {object} parsed
 * @param {object} existing
 * @returns {object}
 */
function mergeWithExisting(parsed, existing) {
  const existingMap = new Map();
  if (existing && existing.features) {
    for (const feat of existing.features) {
      for (const ac of (feat.acceptanceCriteria || [])) {
        existingMap.set(ac.acId, ac);
      }
    }
  }

  for (const feat of parsed.features) {
    for (const ac of feat.acceptanceCriteria) {
      const existingAC = existingMap.get(ac.acId);
      if (existingAC) {
        // 保留已有状态，只更新可从 markdown 读取的字段
        ac.status = existingAC.status;
        ac.verifiedAt = existingAC.verifiedAt;
        ac.verifiedBy = existingAC.verifiedBy;
        // 如果 markdown 中指定了测试文件，更新
        if (ac.testFile) {
          ac.testFile = ac.testFile;
        } else if (existingAC.testFile) {
          ac.testFile = existingAC.testFile;
        }
      }
      // 新 AC 保持 parsed 中的默认值
    }
  }

  return {
    name: 'ac-tracker',
    version: '1.0.0',
    enabled: true,
    projectName: (existing && existing.projectName) || '',
    lastSynced: new Date().toISOString(),
    features: parsed.features,
    statistics: {}
  };
}

/**
 * 重算 statistics
 * @param {object} tracker
 */
function updateStatistics(tracker) {
  const stats = {
    total: 0, draft: 0, approved: 0,
    test_written: 0, verified: 0, passed: 0, failed: 0
  };

  for (const feat of tracker.features) {
    for (const ac of feat.acceptanceCriteria) {
      stats.total++;
      const status = ac.status || 'draft';
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    }
  }

  tracker.statistics = stats;
}

/**
 * 主函数
 */
function main() {
  console.log('[ac-sync] 解析 acceptance-criteria.md...');

  // 解析 markdown
  const parsed = parseAcceptanceCriteria(AC_MD_PATH);
  console.log(`[ac-sync] 提取到 ${parsed.features.length} 个 Feature, ` +
    `${parsed.features.reduce((sum, f) => sum + f.acceptanceCriteria.length, 0)} 个 AC`);

  // 读取已有 tracker
  let existing = null;
  if (fs.existsSync(TRACKER_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));
      console.log(`[ac-sync] 已有 tracker: ${existing.features ? existing.features.length : 0} 个 Feature`);
    } catch (e) {
      console.warn('[ac-sync] 已有 tracker 解析失败，将重建:', e.message);
    }
  }

  // 合并
  const merged = mergeWithExisting(parsed, existing);

  // 重算 statistics
  updateStatistics(merged);

  // 输出统计
  console.log('\n[ac-sync] 统计:');
  for (const [key, value] of Object.entries(merged.statistics)) {
    if (value > 0) console.log(`  ${key}: ${value}`);
  }

  // 写入或 dry-run
  if (dryRun) {
    console.log('\n[ac-sync] DRY RUN — 不写入文件');
    console.log(JSON.stringify(merged, null, 2));
  } else {
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(merged, null, 2));
    console.log(`\n[ac-sync] 已写入: ${TRACKER_PATH}`);
  }
}

main();
