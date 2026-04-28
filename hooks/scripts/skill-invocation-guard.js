#!/usr/bin/env node

/**
 * @module hooks/scripts/skill-invocation-guard
 * @version 1.0.0
 * @since 2026-04-28
 * @description PreToolUse 守卫 — 写冻结层文档前验证对应 Skill 已被调用
 *
 * Changelog:
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const INVOCATION_DIR = path.join(PROJECT_ROOT, '.claude', 'logs', 'skill-invocations');

// 冻结层文档 → 必须 Skill 映射
const FROZEN_DOC_SKILL_MAP = [
  { pattern: /^docs\/design\/01_系统架构设计\.md$/, requiredSkill: 'writing-plans', requiredAgent: 'architect' },
  { pattern: /^docs\/design\/02_数据库设计\.md$/, requiredSkill: 'writing-plans', requiredAgent: 'architect' },
  { pattern: /^docs\/design\/03_API接口设计\.md$/, requiredSkill: 'writing-plans', requiredAgent: 'architect' },
  { pattern: /^docs\/design\/04_UI设计规范\.md$/, requiredSkill: 'ui-ux-pro-max', requiredAgent: 'ui-designer' },
  { pattern: /^docs\/requirements\/PRD\.md$/, requiredSkill: 'product-requirements', requiredAgent: 'pm' },
  { pattern: /^docs\/requirements\/user-stories\.md$/, requiredSkill: 'product-requirements', requiredAgent: 'po' },
  { pattern: /^docs\/requirements\/acceptance-criteria\.md$/, requiredSkill: 'product-requirements', requiredAgent: 'po' },
];

// 从 stdin 读取工具输入
let toolInput = {};
try {
  const input = require('fs').readFileSync(0, 'utf-8');
  if (input.trim()) toolInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';
if (!filePath) process.exit(0);

const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

// 查找匹配的映射
let matchedRule = null;
for (const rule of FROZEN_DOC_SKILL_MAP) {
  if (rule.pattern.test(relPath)) {
    matchedRule = rule;
    break;
  }
}

// 非冻结层文档，放行
if (!matchedRule) process.exit(0);

// 检查 skill invocation marker 目录是否存在
if (!fs.existsSync(INVOCATION_DIR)) {
  console.error(`\n[Skill Guard] 冻结层文档写入被拦截！`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  必须 Skill: ${matchedRule.requiredSkill}`);
  console.error(`  必须 Agent: ${matchedRule.requiredAgent}`);
  console.error(`  原因: 未检测到任何 Skill 调用记录`);
  console.error(`  解决: 先调用 Skill ${matchedRule.requiredSkill}，再写此文档\n`);
  process.exit(1);
}

// 检查是否有对应 Skill 的 marker 文件
const markerFiles = fs.readdirSync(INVOCATION_DIR).filter(f => f.endsWith('.json'));
let skillInvoked = false;

for (const markerFile of markerFiles) {
  try {
    const marker = JSON.parse(fs.readFileSync(path.join(INVOCATION_DIR, markerFile), 'utf-8'));
    if (marker.skill && (
      marker.skill === matchedRule.requiredSkill ||
      marker.skill.includes(matchedRule.requiredSkill) ||
      matchedRule.requiredSkill.includes(marker.skill)
    )) {
      skillInvoked = true;
      break;
    }
  } catch {
    // 跳过损坏的 marker 文件
  }
}

if (!skillInvoked) {
  console.error(`\n[Skill Guard] 冻结层文档写入被拦截！`);
  console.error(`  目标文件: ${relPath}`);
  console.error(`  必须 Skill: ${matchedRule.requiredSkill}`);
  console.error(`  必须 Agent: ${matchedRule.requiredAgent}`);
  console.error(`  原因: 未检测到 Skill "${matchedRule.requiredSkill}" 的调用记录`);
  console.error(`  解决: 先调用 Skill ${matchedRule.requiredSkill}，再写此文档`);
  console.error(`  已记录的 Skill 调用: ${markerFiles.length > 0 ? markerFiles.map(f => f.replace(/\.json$/, '')).join(', ') : '无'}\n`);
  process.exit(1);
}

process.exit(0);
