#!/usr/bin/env node
// commit-quality.js — 提交前质量检查: lint、console.log 检测、密钥检测
// 来源: ECC pre:bash:commit-quality

const toolInput = process.env.TOOL_INPUT || '';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 只在 git commit 命令时触发
if (!/git\s+commit/.test(toolInput)) {
  process.exit(0);
}

let issues = [];

// 1. 检查暂存文件中是否有 console.log
try {
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim().split('\n').filter(Boolean);

  const jsTsFiles = stagedFiles.filter(f =>
    /\.(ts|tsx|js|jsx|vue|svelte)$/.test(f)
  );

  for (const file of jsTsFiles) {
    try {
      const content = execSync(`git diff --cached -- "${file}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      if (/console\.(log|debug|info|warn|error)\(/.test(content)) {
        issues.push(`[WARN] ${file}: 包含 console.log/debug/info/warn/error 语句`);
      }
    } catch (e) {
      // binary file or no diff, skip
    }
  }
} catch (e) {
  // git not available or no staged files
}

// 2. 检查密钥泄露模式
try {
  const stagedDiff = execSync('git diff --cached', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024
  });

  const secretPatterns = [
    { pattern: /(?:sk-|api_key|apikey|secret_key|private_key)\s*[:=]\s*['"][^'"]{10,}/gi, name: 'API密钥' },
    { pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{6,}/gi, name: '密码' },
    { pattern: /(?:BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY)/gi, name: '私钥' },
    { pattern: /(?:AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[0-9A-Z]{16}/g, name: 'AWS密钥' },
  ];

  for (const { pattern, name } of secretPatterns) {
    if (pattern.test(stagedDiff)) {
      issues.push(`[CRITICAL] 检测到可能的${name}泄露！请检查暂存内容`);
    }
  }
} catch (e) {
  // skip
}

// 3. 输出结果
if (issues.length > 0) {
  console.error('[COMMIT QUALITY CHECK]');
  issues.forEach(i => console.error(i));
  const hasCritical = issues.some(i => i.includes('[CRITICAL]'));
  if (hasCritical) {
    console.error('\n提交被阻止: 检测到密钥泄露风险');
    process.exit(2);
  }
  console.error('\n警告: 请确认上述问题是否需要修复后再次提交');
}

process.exit(0);
