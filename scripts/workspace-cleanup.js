#!/usr/bin/env node
/**
 * Workspace Cleanup Script — 清理 workspace 以便重新执行
 *
 * 用法:
 *   node scripts/workspace-cleanup.js
 *   node scripts/workspace-cleanup.js --dry-run
 *
 * 清理范围:
 *   - workspace/docs/ 内容（保留目录结构）
 *   - workspace/src/ 内容
 *   - .claude/logs/ 阶段状态文件
 *   - 所有哨兵标记文件（.phase*-xxx）
 *   - 用户确认标记（.user-confirmed）
 *
 * 保留:
 *   - .gitignore
 *   - .mcp.json
 *   - workspace/ 目录结构
 *   - package.json
 *
 * Updated: 2026-04-27
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.join(PROJECT_ROOT, 'workspace');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const dirsToClean = [
  path.join(WORKSPACE_ROOT, 'docs', 'requirements'),
  path.join(WORKSPACE_ROOT, 'docs', 'design'),
  path.join(WORKSPACE_ROOT, 'docs', 'dev'),
  path.join(WORKSPACE_ROOT, 'docs', 'test'),
  path.join(WORKSPACE_ROOT, 'docs', 'brainstorms'),
  path.join(WORKSPACE_ROOT, 'docs', 'process-trace'),
  path.join(WORKSPACE_ROOT, 'docs', 'reviews'),
  path.join(WORKSPACE_ROOT, 'docs', 'solutions'),
  path.join(WORKSPACE_ROOT, 'docs', 'superpowers'),
  path.join(WORKSPACE_ROOT, 'src'),
  path.join(PROJECT_ROOT, '.claude', 'logs'),
];

const sentinelPatterns = [
  /^\.phase\d/,
  /^\.user-confirmed$/,
  /^\.frozen$/,
];

function removeDirContents(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let count = 0;
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (entry === 'node_modules') continue;
      fs.rmSync(fullPath, { recursive: true, force: true });
      count++;
    } else {
      fs.unlinkSync(fullPath);
      count++;
    }

    if (dryRun) {
      console.log(`  [DRY RUN] 删除: ${fullPath}`);
    }
  }

  return count;
}

function removeSentinelFiles(rootDir) {
  let count = 0;

  if (!fs.existsSync(rootDir)) return count;

  const entries = fs.readdirSync(rootDir);
  for (const entry of entries) {
    const matches = sentinelPatterns.some(pattern => pattern.test(entry));
    if (matches) {
      const fullPath = path.join(rootDir, entry);
      if (dryRun) {
        console.log(`  [DRY RUN] 删除哨兵文件: ${fullPath}`);
      } else {
        fs.unlinkSync(fullPath);
      }
      count++;
    }
  }

  return count;
}

function main() {
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Workspace Cleanup`);
  console.log(`项目根: ${PROJECT_ROOT}`);
  console.log(`工作区: ${WORKSPACE_ROOT}\n`);

  let totalFiles = 0;

  console.log('--- 清理目录内容 ---');
  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      const count = removeDirContents(dir);
      totalFiles += count;
      if (count > 0) {
        console.log(`  ${path.relative(PROJECT_ROOT, dir)}: ${count} 项`);
      }
    }
  }

  console.log('\n--- 清理哨兵文件 ---');
  const sentinelCount = removeSentinelFiles(PROJECT_ROOT);
  totalFiles += sentinelCount;
  if (sentinelCount > 0) {
    console.log(`  哨兵文件: ${sentinelCount} 项`);
  }

  console.log('\n--- 重建目录结构 ---');
  const dirsToEnsure = [
    path.join(WORKSPACE_ROOT, 'docs', 'requirements'),
    path.join(WORKSPACE_ROOT, 'docs', 'design'),
    path.join(WORKSPACE_ROOT, 'docs', 'dev'),
    path.join(WORKSPACE_ROOT, 'docs', 'test'),
    path.join(WORKSPACE_ROOT, 'docs', 'brainstorms'),
    path.join(WORKSPACE_ROOT, 'docs', 'process-trace'),
    path.join(WORKSPACE_ROOT, 'docs', 'reviews'),
    path.join(WORKSPACE_ROOT, 'docs', 'solutions'),
    path.join(WORKSPACE_ROOT, 'docs', 'superpowers', 'decisions'),
    path.join(WORKSPACE_ROOT, 'src'),
    path.join(PROJECT_ROOT, '.claude', 'logs'),
  ];

  for (const dir of dirsToEnsure) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      if (dryRun) {
        console.log(`  [DRY RUN] 创建: ${dir}`);
      }
    }
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}清理完成: ${totalFiles} 项已处理`);
}

main();
