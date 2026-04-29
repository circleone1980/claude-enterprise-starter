#!/usr/bin/env node

/**
 * process-trace-check.test.js — 过程追踪检查测试
 *
 * 验证:
 * 1. 产出物不存在 → 跳过
 * 2. trace 文件缺失 → FAIL
 * 3. trace 文件缺必填项 → FAIL
 * 4. crossVerifyAuditLog: 缺失 audit 文件 → FAIL
 * 5. 精确匹配 skill 名（不误匹配）
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanupTemp } = require('../helpers/hook-tester');

const SCRIPT = path.resolve(__dirname, '../../hooks/scripts/process-trace-check.js');

function runTraceCheck(args, cwd) {
  try {
    const stdout = require('child_process').execSync(`node "${SCRIPT}" ${args}`, {
      cwd,
      encoding: 'utf-8',
      timeout: 10000,
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

describe('process-trace-check', () => {
  test('产出物不存在 → 跳过', () => {
    const tmp = createTempProject();
    try {
      const r = runTraceCheck('--phase=phase1', tmp);
      assert.strictEqual(r.exitCode, 0);
      assert.ok(r.stdout.includes('SKIP'), 'Should skip when no artifacts exist');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('trace 文件缺失 → FAIL', () => {
    const tmp = createTempProject();

    // Create only the artifact, no trace file
    const prdPath = path.join(tmp, 'docs', 'requirements', 'PRD.md');
    fs.mkdirSync(path.dirname(prdPath), { recursive: true });
    fs.writeFileSync(prdPath, '# PRD\n');

    try {
      const r = runTraceCheck('--phase=phase1', tmp);
      assert.strictEqual(r.exitCode, 1);
      assert.ok(r.stdout.includes('FAIL') || r.stdout.includes('缺失'), 'Should fail when trace is missing');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('trace 文件缺必填项 → FAIL', () => {
    const tmp = createTempProject();

    // Create artifact
    const prdPath = path.join(tmp, 'docs', 'requirements', 'PRD.md');
    fs.mkdirSync(path.dirname(prdPath), { recursive: true });
    fs.writeFileSync(prdPath, '# PRD\n');

    // Create trace file but missing required fields
    const tracePath = path.join(tmp, 'docs', 'process-trace', 'phase1', '001-prd-generation.md');
    fs.mkdirSync(path.dirname(tracePath), { recursive: true });
    fs.writeFileSync(tracePath, '# Incomplete trace\n');

    try {
      const r = runTraceCheck('--phase=phase1', tmp);
      assert.strictEqual(r.exitCode, 1);
      assert.ok(r.stdout.includes('FAIL') || r.stdout.includes('缺少'), 'Should fail when trace lacks required fields');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('crossVerifyAuditLog: 缺失 audit 文件 → FAIL', () => {
    const tmp = createTempProject();

    // Create artifact
    const prdPath = path.join(tmp, 'docs', 'requirements', 'PRD.md');
    fs.mkdirSync(path.dirname(prdPath), { recursive: true });
    fs.writeFileSync(prdPath, '# PRD\n');

    // Create valid trace file
    const tracePath = path.join(tmp, 'docs', 'process-trace', 'phase1', '001-prd-generation.md');
    fs.mkdirSync(path.dirname(tracePath), { recursive: true });
    fs.writeFileSync(tracePath, [
      'agent: pm',
      'timestamp: 2026-04-29',
      'status: completed',
      '## 执行链路',
      '- pm agent',
      '- product-requirements',
    ].join('\n'));

    // No trace-audit.jsonl

    try {
      const r = runTraceCheck('--phase=phase1', tmp);
      assert.strictEqual(r.exitCode, 1);
      assert.ok(r.stdout.includes('audit') || r.stdout.includes('FAIL'), 'Should fail when audit log missing');
    } finally {
      cleanupTemp(tmp);
    }
  });

  test('crossVerifyAuditLog: 精确匹配不误匹配', () => {
    const tmp = createTempProject();

    // Create artifact
    const prdPath = path.join(tmp, 'docs', 'requirements', 'PRD.md');
    fs.mkdirSync(path.dirname(prdPath), { recursive: true });
    fs.writeFileSync(prdPath, '# PRD\n');

    // Create valid trace file
    const tracePath = path.join(tmp, 'docs', 'process-trace', 'phase1', '001-prd-generation.md');
    fs.mkdirSync(path.dirname(tracePath), { recursive: true });
    fs.writeFileSync(tracePath, [
      'agent: pm',
      'timestamp: 2026-04-29',
      'status: completed',
      '## 执行链路',
      '- pm agent',
      '- product-requirements',
    ].join('\n'));

    // Create audit log with WRONG skill (should not match "product-requirements")
    const auditPath = path.join(tmp, '.claude', 'logs', 'trace-audit.jsonl');
    fs.mkdirSync(path.dirname(auditPath), { recursive: true });
    fs.writeFileSync(auditPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      tool: 'Skill',
      skill: 'product-requirements-extra',
    }) + '\n');

    try {
      const r = runTraceCheck('--phase=phase1', tmp);
      // Should FAIL because "product-requirements-extra" != "product-requirements"
      assert.ok(r.stdout.includes('伪造') || r.stdout.includes('FAIL'), 'Should detect mismatched skill name');
    } finally {
      cleanupTemp(tmp);
    }
  });
});
