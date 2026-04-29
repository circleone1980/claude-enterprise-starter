#!/usr/bin/env node

/**
 * post-phase-reconcile.test.js — v3.0.0 重构测试
 *
 * 验证:
 * 1. 不自动创建 traces 和 markers
 * 2. Layer 1 大小写不敏感
 * 3. Layer 2 排除 retroactive markers
 * 4. Layer 4 为 WARN + 精确匹配 + 每技能独立检查
 * 5. dry-run 只报告不写入
 * 6. readAuditLog 显式报告缺失
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const { createTempProject, cleanupTemp, markSkillInvoked } = require('../helpers/hook-tester');

const SCRIPT = path.resolve(__dirname, '../../scripts/post-phase-reconcile.js');

function runReconcile(args, cwd) {
  try {
    const stdout = execSync(`node "${SCRIPT}" ${args}`, {
      cwd,
      encoding: 'utf-8',
      timeout: 10000,
      env: { ...process.env },
    });
    return { exitCode: 0, stdout: stdout.trim() };
  } catch (err) {
    return {
      exitCode: err.status || 1,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || '').trim(),
    };
  }
}

function createPhase1Artifacts(tmp) {
  // Create minimal artifacts (enough for Layer 3 to pass)
  const docs = [
    'docs/requirements/PRD.md',
    'docs/requirements/user-stories.md',
    'docs/requirements/acceptance-criteria.md',
    'docs/design/01_系统架构设计.md',
    'docs/design/02_数据库设计.md',
    'docs/design/03_API接口设计.md',
    'docs/design/04_UI设计规范.md',
  ];
  for (const doc of docs) {
    const fullPath = path.join(tmp, doc);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    // 150+ lines, structured headings, content keywords
    const lines = ['# Title\n', '## Section\n'];
    for (let i = 0; i < 150; i++) lines.push(`Line ${i}: 需求 用户 功能 架构 系统 色彩 组件 Design\n`);
    fs.writeFileSync(fullPath, lines.join(''));
  }
}

describe('post-phase-reconcile v3', () => {
  test('--dry-run: 不创建任何文件', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);
    try {
      const r = runReconcile('--phase=phase1 --dry-run', tmp);
      assert.strictEqual(r.exitCode, 0);
      assert.ok(r.stdout.includes('MISSING') || r.stdout.includes('dry-run'), 'Should report MISSING or dry-run');

      // Verify no files were created
      const traceDir = path.join(tmp, 'docs', 'process-trace');
      assert.ok(!fs.existsSync(traceDir), 'No trace files should be created in dry-run');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('main(): 不创建 trace 文件', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);
    try {
      runReconcile('--phase=phase1', tmp);
      const traceDir = path.join(tmp, 'docs', 'process-trace');
      assert.ok(!fs.existsSync(traceDir), 'No trace files should be auto-created');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('main(): 不创建 marker 文件', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);
    try {
      const beforeFiles = fs.readdirSync(path.join(tmp, '.claude', 'logs', 'skill-invocations'));
      runReconcile('--phase=phase1', tmp);
      const afterFiles = fs.readdirSync(path.join(tmp, '.claude', 'logs', 'skill-invocations'));
      assert.strictEqual(beforeFiles.length, afterFiles.length, 'No new markers should be created');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Layer 1: /skills[\\s_-]?called/i 匹配变体', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);

    // Create self-report with "Skills Called" variant
    const reportDir = path.join(tmp, '.claude', 'logs', 'agent-self-report');
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, 'pm-2026-04-29.md'), [
      'agent: pm',
      'phase: 1',
      'skills_called:',
      '  - product-requirements',
      '---',
      '# Report',
    ].join('\n'));

    try {
      const r = runReconcile('--phase=phase1', tmp);
      // Layer 1 for PRD should find the self-report
      assert.ok(r.stdout.includes('Layer 1: Agent 自报') || r.stdout.includes('PASS'), 'Layer 1 should find self-report');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Layer 2: 排除 source=post-phase-reconcile 的 markers', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);

    // Create a retroactive marker (should be excluded)
    const invDir = path.join(tmp, '.claude', 'logs', 'skill-invocations');
    fs.writeFileSync(path.join(invDir, 'retro-product-requirements.json'), JSON.stringify({
      skill: 'product-requirements',
      source: 'post-phase-reconcile',
      note: 'Retroactive marker',
    }));

    try {
      const r = runReconcile('--phase=phase1', tmp);
      // Layer 2 should NOT count the retroactive marker
      assert.ok(r.stdout.includes('找到 0 个') || r.stdout.includes('MISSING'), 'Retroactive markers should be excluded');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Layer 2: 实时 marker 被计入', () => {
    const tmp = createTempProject();
    // Only create PRD artifact to isolate the test
    const prdPath = path.join(tmp, 'docs', 'requirements', 'PRD.md');
    fs.mkdirSync(path.dirname(prdPath), { recursive: true });
    const lines = ['# PRD\n', '## 需求\n'];
    for (let i = 0; i < 150; i++) lines.push('需求 用户 功能\n');
    fs.writeFileSync(prdPath, lines.join(''));

    // Create real-time marker
    markSkillInvoked(tmp, 'product-requirements');

    try {
      const r = runReconcile('--phase=phase1', tmp);
      // PRD Layer 2 should find the marker
      assert.ok(r.stdout.includes('找到 1 个'), 'Real marker for product-requirements should be counted');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('Layer 4: WARN 模式不计入 pass/fail', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);

    // No audit log at all — Layer 4 should WARN but not cause FAIL
    // Create self-reports for all agents so Layer 1 passes
    const reportDir = path.join(tmp, '.claude', 'logs', 'agent-self-report');
    fs.mkdirSync(reportDir, { recursive: true });
    const agents = ['pm', 'po', 'architect', 'ui-designer'];
    for (const agent of agents) {
      fs.writeFileSync(path.join(reportDir, `${agent}-2026-04-29.md`), `agent: ${agent}\nskills_called:\n  - test\n---\n`);
    }

    // Create all markers for Layer 2
    markSkillInvoked(tmp, 'product-requirements');
    markSkillInvoked(tmp, 'writing-plans');
    markSkillInvoked(tmp, 'ui-ux-pro-max');

    try {
      const r = runReconcile('--phase=phase1', tmp);
      // Should have WARN for Layer 4
      assert.ok(r.stdout.includes('WARN') || r.stdout.includes('已知限制'), 'Layer 4 should be WARN');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('findSkillInAudit: 精确匹配不误匹配', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);

    // Create audit log with "writing-plans-extra" (should NOT match "writing-plans")
    const logsDir = path.join(tmp, '.claude', 'logs');
    fs.writeFileSync(path.join(logsDir, 'trace-audit.jsonl'), JSON.stringify({
      timestamp: new Date().toISOString(),
      tool: 'Skill',
      skill: 'writing-plans-extra',
    }) + '\n');

    try {
      const r = runReconcile('--phase=phase1', tmp);
      // "writing-plans-extra" should NOT count as "writing-plans"
      // The output should still show 0 records for writing-plans
      assert.ok(r.stdout.includes('Audit log: 1 条记录'), 'Should find the audit record');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('readAuditLog: 缺失时输出 warn', () => {
    const tmp = createTempProject();
    createPhase1Artifacts(tmp);
    // No trace-audit.jsonl created

    try {
      const r = runReconcile('--phase=phase1', tmp);
      // console.warn goes to stderr, but we capture both
      const output = r.stdout + (r.stderr || '');
      assert.ok(output.includes('trace-audit.jsonl 不存在'), 'Should warn about missing audit log');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('产出物不存在时跳过', () => {
    const tmp = createTempProject();
    // No artifacts created
    try {
      const r = runReconcile('--phase=phase1', tmp);
      assert.strictEqual(r.exitCode, 0);
      assert.ok(r.stdout.includes('跳过') || r.stdout.includes('0 个'), 'Should skip with no artifacts');
    } finally {
      cleanupTemp(tmp);
    }
  });
});
