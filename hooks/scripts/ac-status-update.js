#!/usr/bin/env node
/**
 * ac-status-update.js — 任务完成时自动更新 AC 状态
 *
 * 触发时机: PostToolUse → TaskUpdate（当任务状态变更为 completed 时）
 *
 * 功能:
 *   1. 从环境变量 / stdin 读取 TaskUpdate 数据
 *   2. 检测任务是否完成（status === 'completed'）
 *   3. 从任务描述中提取 AC ID（AC-F{NNN}-{MM} 模式）
 *   4. 在 ac-tracker.json 中将对应 AC 状态更新为 verified
 *
 * 非阻塞: 更新失败不影响任务状态变更
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TRACKER_PATH = path.join(PROJECT_ROOT, 'automation', 'ac-tracker.json');

// AC ID 正则: AC-F001-01, AC-F012-03 等
const AC_ID_PATTERN = /AC-F\d{3}-\d{2}/g;

/**
 * 从 stdin 读取 TaskUpdate 数据
 */
function readInput() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

/**
 * 从任务数据中提取 AC ID
 * @param {object} taskData - TaskUpdate 的数据
 * @returns {string[]} 匹配到的 AC ID 列表
 */
function extractACIds(taskData) {
  const texts = [];

  // 从多个字段提取
  if (taskData.subject) texts.push(taskData.subject);
  if (taskData.description) texts.push(taskData.description);
  if (taskData.metadata) {
    // metadata 可能包含 acIds
    if (taskData.metadata.acIds) texts.push(taskData.metadata.acIds);
    if (taskData.metadata.ac_id) texts.push(taskData.metadata.ac_id);
    if (taskData.metadata.acId) texts.push(taskData.metadata.acId);
  }

  const combined = texts.join(' ');
  const matches = combined.match(AC_ID_PATTERN);
  return [...new Set(matches || [])]; // 去重
}

/**
 * 加载 AC Tracker
 */
function loadTracker() {
  if (!fs.existsSync(TRACKER_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * 更新 AC 状态
 * @param {object} tracker - ac-tracker 数据
 * @param {string[]} acIds - 要更新的 AC ID 列表
 * @returns {{ updated: string[], skipped: string[], notFound: string[] }}
 */
function updateACStatuses(tracker, acIds) {
  const result = { updated: [], skipped: [], notFound: [] };

  for (const acId of acIds) {
    let found = false;

    for (const feature of (tracker.features || [])) {
      for (const ac of (feature.acceptanceCriteria || [])) {
        if (ac.acId === acId) {
          found = true;
          // 只从 test_written 状态推进到 verified
          if (ac.status === 'test_written') {
            ac.status = 'verified';
            ac.verifiedAt = new Date().toISOString();
            result.updated.push(acId);
          } else if (ac.status === 'verified' || ac.status === 'passed' || ac.status === 'failed') {
            result.skipped.push(`${acId} (current: ${ac.status})`);
          } else {
            // draft / approved 状态 → 跳到 verified（任务完成说明已实现+测试）
            ac.status = 'verified';
            ac.verifiedAt = new Date().toISOString();
            result.updated.push(acId);
          }
        }
      }
    }

    if (!found) {
      result.notFound.push(acId);
    }
  }

  return result;
}

/**
 * 重算 statistics
 */
function recalcStatistics(tracker) {
  const stats = {
    total: 0, draft: 0, approved: 0,
    test_written: 0, verified: 0, passed: 0, failed: 0
  };

  for (const feature of (tracker.features || [])) {
    for (const ac of (feature.acceptanceCriteria || [])) {
      stats.total++;
      const s = ac.status || 'draft';
      if (stats[s] !== undefined) stats[s]++;
    }
  }

  tracker.statistics = stats;
}

/**
 * 保存 tracker
 */
function saveTracker(tracker) {
  tracker.lastSynced = new Date().toISOString();
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2) + '\n', 'utf-8');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 读取输入
    const input = await readInput();

    let taskData = {};
    if (input && input.trim()) {
      try {
        taskData = JSON.parse(input);
      } catch {
        // 非 JSON 输入，尝试从环境变量
        const envStatus = process.env.TASK_STATUS || '';
        const envDesc = process.env.TASK_DESCRIPTION || '';
        const envSubject = process.env.TASK_SUBJECT || '';

        if (envStatus !== 'completed') {
          // 非完成状态，静默退出
          process.exit(0);
        }

        taskData = { status: envStatus, description: envDesc, subject: envSubject };
      }
    }

    // 检查是否为 completed 状态
    if (taskData.status && taskData.status !== 'completed') {
      process.exit(0);
    }

    // 提取 AC ID
    const acIds = extractACIds(taskData);
    if (acIds.length === 0) {
      // 任务中无 AC ID，静默退出
      process.exit(0);
    }

    // 加载 tracker
    const tracker = loadTracker();
    if (!tracker) {
      console.log('[ac-status-update] ac-tracker.json not found, skipping');
      process.exit(0);
    }

    // 更新状态
    const result = updateACStatuses(tracker, acIds);

    if (result.updated.length > 0) {
      recalcStatistics(tracker);
      saveTracker(tracker);
      console.log(`[ac-status-update] Updated ACs: ${result.updated.join(', ')}`);
    }

    if (result.skipped.length > 0) {
      console.log(`[ac-status-update] Skipped ACs: ${result.skipped.join(', ')}`);
    }

    if (result.notFound.length > 0) {
      console.log(`[ac-status-update] Not found in tracker: ${result.notFound.join(', ')}`);
    }

    process.exit(0);
  } catch (err) {
    // 非阻塞: 错误只记录，不影响主流程
    console.error(`[ac-status-update] Error: ${err.message}`);
    process.exit(0);
  }
}

main();
