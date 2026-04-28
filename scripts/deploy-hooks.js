#!/usr/bin/env node

/**
 * @module scripts/deploy-hooks
 * @version 1.0.0
 * @since 2026-04-28
 * @description 将 hooks/hooks.json 合并到 .claude/settings.json 的 hooks 字段
 *              并修正脚本路径：hooks/scripts/ → .claude/hooks/scripts/
 *
 * 用法:
 *   node scripts/deploy-hooks.js [target-dir]
 *   target-dir 默认为当前目录
 *
 * Changelog:
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || process.cwd();
const claudeDir = path.join(targetDir, '.claude');

const settingsPath = path.join(claudeDir, 'settings.json');
const hooksJsonPath = path.join(claudeDir, 'hooks', 'hooks.json');

console.log(`[deploy-hooks] 目标目录: ${targetDir}`);
console.log(`[deploy-hooks] .claude 目录: ${claudeDir}`);

// 检查文件存在
if (!fs.existsSync(hooksJsonPath)) {
  console.error(`[deploy-hooks] 错误: hooks.json 不存在: ${hooksJsonPath}`);
  console.error('  请先运行 init.ps1 部署框架文件');
  process.exit(1);
}

if (!fs.existsSync(settingsPath)) {
  console.error(`[deploy-hooks] 错误: settings.json 不存在: ${settingsPath}`);
  console.error('  请先运行 init.ps1 部署框架文件');
  process.exit(1);
}

// 读取 hooks.json
let hooksConfig;
try {
  const raw = fs.readFileSync(hooksJsonPath, 'utf-8');
  hooksConfig = JSON.parse(raw);
} catch (e) {
  console.error(`[deploy-hooks] 错误: 无法解析 hooks.json: ${e.message}`);
  process.exit(1);
}

if (!hooksConfig.hooks) {
  console.error('[deploy-hooks] 错误: hooks.json 中没有 hooks 字段');
  process.exit(1);
}

// 读取 settings.json
let settings;
try {
  const raw = fs.readFileSync(settingsPath, 'utf-8');
  settings = JSON.parse(raw);
} catch (e) {
  console.error(`[deploy-hooks] 错误: 无法解析 settings.json: ${e.message}`);
  process.exit(1);
}

// 修正命令路径: hooks/scripts/ → .claude/hooks/scripts/
// 递归处理所有 hook 条目
function fixCommandPaths(hooksObj) {
  const PATH_REPLACEMENTS = [
    { from: 'bash hooks/scripts/', to: 'bash .claude/hooks/scripts/' },
    { from: 'node hooks/scripts/', to: 'node .claude/hooks/scripts/' },
    { from: 'echo ', to: 'echo ' },  // echo 命令不需要改
  ];

  for (const key of Object.keys(hooksObj)) {
    const entries = hooksObj[key];
    if (!Array.isArray(entries)) continue;

    for (const entry of entries) {
      if (!entry.hooks || !Array.isArray(entry.hooks)) continue;

      for (const hook of entry.hooks) {
        if (hook.command) {
          for (const { from, to } of PATH_REPLACEMENTS) {
            if (hook.command.includes(from) && from !== 'echo ') {
              hook.command = hook.command.replace(from, to);
            }
          }
        }
      }
    }
  }
}

// 深拷贝 hooks 配置并修正路径
const mergedHooks = JSON.parse(JSON.stringify(hooksConfig.hooks));
fixCommandPaths(mergedHooks);

// 移除 Scheduled 段（Claude Code settings.json 不支持）
delete mergedHooks.Scheduled;

// 合并到 settings.json
settings.hooks = mergedHooks;

// 写回 settings.json
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

// 统计
let hookCount = 0;
for (const key of Object.keys(mergedHooks)) {
  const entries = mergedHooks[key];
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (entry.hooks) hookCount += entry.hooks.length;
    }
  }
}

console.log(`[deploy-hooks] 完成: ${hookCount} 个 hooks 已注册到 .claude/settings.json`);
console.log('[deploy-hooks] 路径已修正: hooks/scripts/ → .claude/hooks/scripts/');

// 同时处理 Scheduled 段 → 输出为独立的 cron 配置提示
if (hooksConfig.hooks.Scheduled) {
  console.log('');
  console.log('[deploy-hooks] 注意: Scheduled hooks 不支持在 settings.json 中配置:');
  for (const sched of hooksConfig.hooks.Scheduled) {
    if (sched.hooks) {
      for (const h of sched.hooks) {
        console.log(`  - ${sched.id || 'unnamed'}: ${h.command} (interval: ${sched.interval || 'N/A'}ms)`);
      }
    }
  }
  console.log('  请通过系统级 cron 或 Claude Code /loop 命令替代');
}

process.exit(0);
