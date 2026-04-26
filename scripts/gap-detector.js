#!/usr/bin/env node
/**
 * Gap Detector — 阶段执行后的缺口检测
 *
 * 用法:
 *   node scripts/gap-detector.js --phase=0
 *   node scripts/gap-detector.js --phase=1
 *   node scripts/gap-detector.js --phase=all
 *
 * 检测项:
 *   1. 产出物无过程追踪 → 报告
 *   2. 过程追踪未引用框架 Agent/Skill → 报告
 *   3. 门禁条件不满足 → 报告
 *
 * 输出: .claude/logs/gap-report.md
 *
 * Updated: 2026-04-27
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.join(PROJECT_ROOT, 'workspace');

const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase='));
const targetPhase = phaseArg ? phaseArg.split('=')[1] : 'all';

const gaps = [];

const PHASE_ARTIFACTS = {
  0: [
    { path: 'docs/brainstorms/', desc: '头脑风暴笔记', checkType: 'dir_has_md' },
    { path: '.user-confirmed', desc: '用户确认标记', checkType: 'file_exists' },
  ],
  1: [
    { path: 'docs/requirements/PRD.md', desc: 'PRD 文档' },
    { path: 'docs/requirements/user-stories.md', desc: '用户故事' },
    { path: 'docs/requirements/acceptance-criteria.md', desc: '验收标准' },
    { path: 'docs/design/01_系统架构设计.md', desc: '系统架构设计' },
    { path: 'docs/design/02_数据库设计.md', desc: '数据库设计' },
    { path: 'docs/design/03_API接口设计.md', desc: 'API 接口设计' },
    { path: 'docs/design/04_UI设计规范.md', desc: 'UI 设计规范' },
  ],
  2: [
    { path: 'src/', desc: '源代码目录', checkType: 'dir_has_files' },
  ],
};

const PHASE_TRACE_CHECKS = {
  0: { dir: 'docs/process-trace/phase0/', requiredAgent: 'Brainstormer', minFiles: 1 },
  1: { dir: 'docs/process-trace/phase1/', requiredAgent: 'PM|PO|Architect', minFiles: 7 },
  2: { dir: 'docs/process-trace/phase2/', requiredAgent: 'Frontend|Backend', minFiles: 1 },
};

function checkArtifactExists(artifact) {
  const fullPath = path.join(WORKSPACE_ROOT, artifact.path);
  const checkType = artifact.checkType || 'file_exists';

  if (checkType === 'file_exists') {
    return fs.existsSync(fullPath);
  }
  if (checkType === 'dir_has_md') {
    if (!fs.existsSync(fullPath)) return false;
    return fs.readdirSync(fullPath).some(f => f.endsWith('.md'));
  }
  if (checkType === 'dir_has_files') {
    if (!fs.existsSync(fullPath)) return false;
    const entries = fs.readdirSync(fullPath);
    return entries.length > 0;
  }
  return false;
}

function checkProcessTrace(phase) {
  const check = PHASE_TRACE_CHECKS[phase];
  if (!check) return { hasTrace: true, details: '无追踪要求' };

  const traceDir = path.join(WORKSPACE_ROOT, check.dir);
  if (!fs.existsSync(traceDir)) {
    return { hasTrace: false, details: `过程追踪目录不存在: ${check.dir}` };
  }

  const traceFiles = fs.readdirSync(traceDir).filter(f => f.endsWith('.md'));
  if (traceFiles.length < check.minFiles) {
    return { hasTrace: false, details: `过程追踪文件不足: ${traceFiles.length}/${check.minFiles}` };
  }

  let hasAgentRef = false;
  for (const file of traceFiles) {
    const content = fs.readFileSync(path.join(traceDir, file), 'utf-8');
    const agents = check.requiredAgent.split('|');
    if (agents.some(a => content.includes(a))) {
      hasAgentRef = true;
      break;
    }
  }

  if (!hasAgentRef) {
    return { hasTrace: false, details: `过程追踪未引用要求的 Agent: ${check.requiredAgent}` };
  }

  return { hasTrace: true, details: `✓ ${traceFiles.length} 个追踪文件，引用了 ${check.requiredAgent}` };
}

function checkPhaseGate(phase) {
  const gateKey = `phase${phase}_to_phase${phase + 1}`;
  const gatesPath = path.join(PROJECT_ROOT, 'automation', 'phase-gates.json');

  if (!fs.existsSync(gatesPath)) return { passed: false, details: 'phase-gates.json 不存在' };

  const gates = JSON.parse(fs.readFileSync(gatesPath, 'utf-8'));
  const gate = gates.gates[gateKey];

  if (!gate) return { passed: true, details: '无门禁定义（可能未配置）' };

  const failed = [];
  for (const cond of gate.conditions) {
    if (!cond.check) continue;
    try {
      execSync(cond.check, { cwd: WORKSPACE_ROOT, timeout: 5000, stdio: 'pipe' });
    } catch {
      failed.push(cond.description);
    }
  }

  if (failed.length > 0) {
    return { passed: false, details: `${failed.length}/${gate.conditions.length} 条件未通过:\n${failed.map(f => `  - ${f}`).join('\n')}` };
  }

  return { passed: true, details: `✓ ${gate.conditions.length}/${gate.conditions.length} 条件通过` };
}

function detectPhase(phase) {
  console.log(`\n=== Phase ${phase} 缺口检测 ===\n`);

  // 1. 产出物存在性
  const artifacts = PHASE_ARTIFACTS[phase] || [];
  console.log('--- 产出物检查 ---');
  for (const artifact of artifacts) {
    const exists = checkArtifactExists(artifact);
    if (!exists) {
      const gap = `[P${phase}] 缺少产出物: ${artifact.desc} (${artifact.path})`;
      gaps.push(gap);
      console.log(`  ❌ ${artifact.desc}`);
    } else {
      console.log(`  ✓ ${artifact.desc}`);
    }
  }

  // 2. 过程追踪
  console.log('\n--- 过程追踪检查 ---');
  const traceResult = checkProcessTrace(phase);
  if (!traceResult.hasTrace) {
    const gap = `[P${phase}] 过程追踪问题: ${traceResult.details}`;
    gaps.push(gap);
    console.log(`  ❌ ${traceResult.details}`);
  } else {
    console.log(`  ${traceResult.details}`);
  }

  // 3. 门禁
  console.log('\n--- 门禁检查 ---');
  const gateResult = checkPhaseGate(phase);
  if (!gateResult.passed) {
    const gap = `[P${phase}] 门禁未通过: ${gateResult.details}`;
    gaps.push(gap);
    console.log(`  ❌ ${gateResult.details}`);
  } else {
    console.log(`  ${gateResult.details}`);
  }
}

function main() {
  const phases = targetPhase === 'all'
    ? [0, 1, 2, 3, 4, 5]
    : [parseInt(targetPhase)];

  console.log(`Gap Detector — Phase: ${targetPhase}`);
  console.log(`项目: ${PROJECT_ROOT}`);

  for (const phase of phases) {
    detectPhase(phase);
  }

  // 输出报告
  console.log('\n========================================');
  if (gaps.length === 0) {
    console.log('✅ 无缺口');
  } else {
    console.log(`❌ 发现 ${gaps.length} 个缺口:`);
    gaps.forEach((g, i) => console.log(`  ${i + 1}. ${g}`));
  }

  // 写入报告文件
  const logsDir = path.join(PROJECT_ROOT, '.claude', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const reportPath = path.join(logsDir, 'gap-report.md');
  const report = [
    `# Gap Report — Phase: ${targetPhase}`,
    `> 生成时间: ${new Date().toISOString()}`,
    '',
    `## 总计: ${gaps.length} 个缺口`,
    '',
    ...gaps.map((g, i) => `${i + 1}. ${g}`),
    '',
    gaps.length === 0 ? '**状态: ✅ 无缺口，可进入下一阶段**' : '**状态: ❌ 存在缺口，需修复后重新检测**',
    '',
  ].join('\n');

  fs.writeFileSync(reportPath, report);
  console.log(`\n报告已写入: ${reportPath}`);

  process.exit(gaps.length > 0 ? 1 : 0);
}

main();
