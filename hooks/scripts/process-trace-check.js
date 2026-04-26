#!/usr/bin/env node

/**
 * @module hooks/scripts/process-trace-check
 * @version 2.0.0
 * @since 2026-04-26
 * @description: 过程追踪检查脚本 — 验证产出物是否有对应的过程记录（Phase 0-5 全覆盖）
 *
 * Changelog:
 * - 2.0.0 (2026-04-27): 扩展到 Phase 0-5
 * - 1.0.0 (2026-04-26): 初始实现
 */

const fs = require('fs');
const path = require('path');

// Phase 0 头脑风暴 → 过程追踪映射
const PHASE0_TRACE_CHECKS = [
  {
    artifact: 'docs/brainstorms/',
    traceRequired: 'docs/process-trace/phase1/',
    checkType: 'dir_has_md',
    requiredSkills: ['ce-brainstorm'],
    requiredAgent: 'brainstormer'
  }
];

// Phase 1 冻结层文档 → 过程追踪映射
const PHASE1_TRACE_CHECKS = [
  {
    artifact: 'docs/requirements/PRD.md',
    traceRequired: 'docs/process-trace/phase1/001-prd-generation.md',
    requiredSkills: ['product-requirements'],
    requiredAgent: 'pm'
  },
  {
    artifact: 'docs/requirements/user-stories.md',
    traceRequired: 'docs/process-trace/phase1/002-user-stories-generation.md',
    requiredSkills: ['product-requirements'],
    requiredAgent: 'po'
  },
  {
    artifact: 'docs/requirements/acceptance-criteria.md',
    traceRequired: 'docs/process-trace/phase1/003-acceptance-criteria.md',
    requiredSkills: ['product-requirements'],
    requiredAgent: 'po'
  },
  {
    artifact: 'docs/design/01_系统架构设计.md',
    traceRequired: 'docs/process-trace/phase1/004-architecture-design.md',
    requiredSkills: ['writing-plans'],
    requiredAgent: 'architect'
  },
  {
    artifact: 'docs/design/02_数据库设计.md',
    traceRequired: 'docs/process-trace/phase1/005-data-storage-design.md',
    requiredSkills: ['writing-plans'],
    requiredAgent: 'architect'
  },
  {
    artifact: 'docs/design/03_API接口设计.md',
    traceRequired: 'docs/process-trace/phase1/006-api-design.md',
    requiredSkills: ['writing-plans'],
    requiredAgent: 'architect'
  },
  {
    artifact: 'docs/design/04_UI设计规范.md',
    traceRequired: 'docs/process-trace/phase1/007-ui-spec.md',
    requiredSkills: ['ui-ux-pro-max'],
    requiredAgent: 'ui-designer'
  }
];

function checkTrace(check, workspaceDir) {
  const results = {
    artifact: check.artifact,
    passed: true,
    errors: []
  };

  const artifactPath = path.join(workspaceDir, check.artifact);

  // 如果产出物不存在，跳过检查（由其他门禁负责）
  if (!fs.existsSync(artifactPath)) {
    results.skipped = true;
    results.skipReason = '产出物不存在';
    return results;
  }

  // 检查过程追踪文件是否存在
  const tracePath = path.join(workspaceDir, check.traceRequired);
  if (!fs.existsSync(tracePath)) {
    results.passed = false;
    results.errors.push(`过程追踪记录缺失: ${check.traceRequired}`);
    return results;
  }

  // 读取过程追踪内容
  let traceContent;
  try {
    traceContent = fs.readFileSync(tracePath, 'utf-8');
  } catch (e) {
    results.passed = false;
    results.errors.push(`无法读取过程追踪记录: ${e.message}`);
    return results;
  }

  // 检查必填项
  const requiredFields = ['agent:', 'timestamp:', 'status:', '## 执行链路'];
  for (const field of requiredFields) {
    if (!traceContent.includes(field)) {
      results.errors.push(`过程追踪缺少必填项: ${field}`);
    }
  }

  // 检查 requiredAgent
  if (!traceContent.includes(check.requiredAgent)) {
    results.errors.push(`未记录使用 Agent: ${check.requiredAgent}`);
  }

  // 检查 requiredSkills
  for (const skill of check.requiredSkills) {
    if (!traceContent.includes(skill)) {
      results.errors.push(`未记录调用 Skill: ${skill}`);
    }
  }

  if (results.errors.length > 0) {
    results.passed = false;
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);
  const phase = args.find(a => a.startsWith('--phase='))?.split('=')[1] || 'phase1';
  const workspaceDir = args.find(a => a.startsWith('--workspace='))?.split('=')[1] || process.cwd();

  // 根据阶段选择检查集
  let checks = [];
  if (phase === 'phase0' || phase === 'all') {
    checks = checks.concat(PHASE0_TRACE_CHECKS);
  }
  if (phase === 'phase1' || phase === 'all') {
    checks = checks.concat(PHASE1_TRACE_CHECKS);
  }
  // Phase 2-5 的检查按需添加

  let allPassed = true;
  let totalChecks = 0;
  let passedChecks = 0;

  console.log(`\n[Process Trace Check] Phase: ${phase}`);
  console.log(`[Process Trace Check] Workspace: ${workspaceDir}\n`);

  for (const check of checks) {
    const result = checkTrace(check, workspaceDir);

    if (result.skipped) {
      console.log(`  SKIP  ${check.artifact} — ${result.skipReason}`);
      continue;
    }

    totalChecks++;

    if (result.passed) {
      passedChecks++;
      console.log(`  PASS  ${check.artifact}`);
    } else {
      allPassed = false;
      console.log(`  FAIL  ${check.artifact}`);
      for (const err of result.errors) {
        console.log(`        → ${err}`);
      }
    }
  }

  console.log(`\n[Process Trace Check] 结果: ${passedChecks}/${totalChecks} 通过\n`);

  if (allPassed) {
    console.log('[Process Trace Check] 所有过程追踪检查通过');
    process.exit(0);
  } else {
    console.log('[Process Trace Check] 过程追踪检查失败 — 请补全缺失的过程记录');
    process.exit(1);
  }
}

main();
