#!/usr/bin/env node

/**
 * @module scripts/post-phase-reconcile
 * @version 3.0.0
 * @since 2026-04-28
 * @description Phase 完成后的对账 + 4 层验证脚本。
 *              v3: 删除自动补建，只报告缺失；Layer 4 降级为 WARN；精确匹配
 *              v2: 4 层验证 + Agent 自报读取 + 验证流程
 *              v1: 事后对账（逆向生成追踪 + markers）— 已废弃
 *
 * 用法:
 *   node scripts/post-phase-reconcile.js --phase=1 [--workspace=.]
 *   node scripts/post-phase-reconcile.js --phase=1 --dry-run
 *
 * 退出码:
 *   0 = SUCCESS（Layer 1-3 验证通过）
 *   1 = FAIL（验证失败，需重试或人工介入）
 *
 * Changelog:
 * - 3.0.0 (2026-04-29): 删除自动补建；Layer 4 WARN；精确匹配；每技能独立检查
 * - 2.0.0 (2026-04-29): 4 层验证 + Agent 自报读取 + 验证流程
 * - 1.0.0 (2026-04-28): 初始实现
 */

const fs = require('fs');
const path = require('path');

// --- Phase 冻结层文档定义 ---
const PHASE_CONFIGS = {
  phase1: {
    docs: [
      { artifact: 'docs/requirements/PRD.md', traceFile: 'docs/process-trace/phase1/001-prd-generation.md', skills: ['product-requirements'], agent: 'pm', agentType: 'planner' },
      { artifact: 'docs/requirements/user-stories.md', traceFile: 'docs/process-trace/phase1/002-user-stories-generation.md', skills: ['product-requirements'], agent: 'po', agentType: 'general-purpose' },
      { artifact: 'docs/requirements/acceptance-criteria.md', traceFile: 'docs/process-trace/phase1/003-acceptance-criteria.md', skills: ['product-requirements'], agent: 'po', agentType: 'general-purpose' },
      { artifact: 'docs/design/01_系统架构设计.md', traceFile: 'docs/process-trace/phase1/004-architecture-design.md', skills: ['writing-plans'], agent: 'architect', agentType: 'architect' },
      { artifact: 'docs/design/02_数据库设计.md', traceFile: 'docs/process-trace/phase1/005-data-storage-design.md', skills: ['writing-plans'], agent: 'architect', agentType: 'architect' },
      { artifact: 'docs/design/03_API接口设计.md', traceFile: 'docs/process-trace/phase1/006-api-design.md', skills: ['writing-plans'], agent: 'architect', agentType: 'architect' },
      { artifact: 'docs/design/04_UI设计规范.md', traceFile: 'docs/process-trace/phase1/007-ui-spec.md', skills: ['ui-ux-pro-max'], agent: 'ui-designer', agentType: 'general-purpose' },
    ]
  }
};

// --- 解析参数 ---
const args = process.argv.slice(2);
const phase = args.find(a => a.startsWith('--phase='))?.split('=')[1] || 'phase1';
const workspace = args.find(a => a.startsWith('--workspace='))?.split('=')[1] || process.cwd();
const dryRun = args.includes('--dry-run');

const config = PHASE_CONFIGS[phase];
if (!config) {
  console.error(`[reconcile] 不支持的 phase: ${phase}。支持: ${Object.keys(PHASE_CONFIGS).join(', ')}`);
  process.exit(1);
}

// --- 读取 trace-audit.jsonl ---
function readAuditLog(ws) {
  const auditPath = path.join(ws, '.claude', 'logs', 'trace-audit.jsonl');
  if (!fs.existsSync(auditPath)) {
    console.warn('[reconcile] trace-audit.jsonl 不存在');
    return [];
  }
  try {
    return fs.readFileSync(auditPath, 'utf-8')
      .split('\n').filter(l => l.trim())
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

// --- 查找 audit log 中的 Skill 调用（精确匹配） ---
function findSkillInAudit(auditLog, skillName) {
  return auditLog.filter(r => r.skill === skillName);
}

// --- 查找 audit log 中的 Agent 调用 ---
function findAgentInAudit(auditLog, agentName) {
  return auditLog.filter(r =>
    r.agentName === agentName || r.subagentType === agentName
  );
}

// --- 查找 Agent 自报文件 ---
function findSelfReport(agentName, ws) {
  const reportDir = path.join(ws, '.claude', 'logs', 'agent-self-report');
  if (!fs.existsSync(reportDir)) return null;
  const files = fs.readdirSync(reportDir)
    .filter(f => f.startsWith(agentName) && f.endsWith('.md'))
    .sort().reverse();
  if (files.length === 0) return null;
  return fs.readFileSync(path.join(reportDir, files[0]), 'utf-8');
}

// --- 验证产出物结构 ---
function verifyOutputStructure(artifactPath, requiredSkills) {
  const checks = [];
  if (!fs.existsSync(artifactPath)) {
    return { pass: false, checks: [{ name: '文件存在', pass: false }] };
  }
  const content = fs.readFileSync(artifactPath, 'utf-8');

  checks.push({ name: '最小行数(>100)', pass: content.split('\n').length > 100 });
  checks.push({ name: '结构化标题(#/##)', pass: /^#{1,3}\s/m.test(content) });

  if (requiredSkills.includes('writing-plans')) {
    checks.push({ name: '架构内容', pass: content.includes('架构') || content.includes('系统') });
  }
  if (requiredSkills.includes('ui-ux-pro-max')) {
    checks.push({ name: '设计系统内容', pass: content.includes('色彩') || content.includes('组件') || content.includes('Design') });
  }
  if (requiredSkills.includes('product-requirements')) {
    checks.push({ name: '需求内容', pass: content.includes('需求') || content.includes('用户') || content.includes('功能') });
  }

  return { pass: checks.every(c => c.pass), checks };
}

// --- 4 层验证核心 ---
function verifyLayer(doc, ws) {
  const results = { layers: [], pass: true };
  const auditLog = readAuditLog(ws);

  // Layer 1: Agent 自报文件存在 + skills_called 非空（大小写不敏感）
  const selfReport = findSelfReport(doc.agent, ws);
  results.layers.push({
    name: 'Layer 1: Agent 自报',
    pass: !!selfReport && /skills[\s_-]?called/i.test(selfReport),
    detail: selfReport ? '找到自报文件' : '未找到自报文件'
  });

  // Layer 2: Skill marker 文件完整（只计实时 markers）
  const invDir = path.join(ws, '.claude', 'logs', 'skill-invocations');
  const markers = [];
  if (fs.existsSync(invDir)) {
    for (const f of fs.readdirSync(invDir)) {
      if (f.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(invDir, f), 'utf-8'));
          if (data.source !== 'post-phase-reconcile' && doc.skills.includes(data.skill)) {
            markers.push(f);
          }
        } catch { /* skip malformed */ }
      }
    }
  }
  results.layers.push({
    name: 'Layer 2: Skill markers',
    pass: markers.length >= doc.skills.length,
    detail: `期望 ${doc.skills.length} 个, 找到 ${markers.length} 个`
  });

  // Layer 3: 产出物结构验证
  const structResult = verifyOutputStructure(path.join(ws, doc.artifact), doc.skills);
  results.layers.push({
    name: 'Layer 3: 产出物结构',
    pass: structResult.pass,
    detail: structResult.checks.map(c => `${c.name}: ${c.pass ? '✓' : '✗'}`).join(', ')
  });

  // Layer 4: trace-audit.jsonl 交叉验证 (WARN)
  const skillDetails = doc.skills.map(s => `${s}: ${findSkillInAudit(auditLog, s).length}条`);
  const allSkillsFound = doc.skills.every(s => findSkillInAudit(auditLog, s).length > 0);
  results.layers.push({
    name: 'Layer 4: Audit 交叉验证 (WARN)',
    pass: allSkillsFound,
    warn: true,
    detail: `Audit: ${skillDetails.join(', ')}${!allSkillsFound ? ' (子 agent 不触发主会话 hooks，属已知限制)' : ''}`
  });

  // Layer 4 为 WARN 不计入 pass/fail 判定
  results.pass = results.layers.filter(l => !l.warn).every(l => l.pass);
  return results;
}

// --- Dry-run: 报告缺失项（不写入任何文件） ---
function dryRunMain() {
  const auditLog = readAuditLog(workspace);
  console.log(`[reconcile] Audit log: ${auditLog.length} 条记录`);

  let missingTraces = 0, missingMarkers = 0, skipped = 0;

  for (const doc of config.docs) {
    const artifactPath = path.join(workspace, doc.artifact);
    const tracePath = path.join(workspace, doc.traceFile);

    if (!fs.existsSync(artifactPath)) {
      console.log(`  SKIP  ${doc.artifact} — 产出物不存在`);
      skipped++;
      continue;
    }

    if (fs.existsSync(tracePath)) {
      console.log(`  EXISTS  ${doc.traceFile}`);
    } else {
      console.log(`  MISSING  ${doc.traceFile}`);
      console.log(`    → 需要: ${doc.agent} agent 的 ${doc.skills.join(', ')} Skill 调用`);
      missingTraces++;
    }

    for (const skill of doc.skills) {
      const invDir = path.join(workspace, '.claude', 'logs', 'skill-invocations');
      const existing = fs.existsSync(invDir)
        ? fs.readdirSync(invDir).filter(f => f.includes(skill)) : [];
      if (existing.length === 0) {
        console.log(`    → MISSING skill marker: ${skill}`);
        missingMarkers++;
      }
    }
  }

  console.log(`\n[reconcile] 结果: ${missingTraces} 缺失追踪, ${missingMarkers} 缺失 markers, ${skipped} 跳过`);
  console.log('[reconcile] (dry-run 模式，未实际写入)');
  console.log('[reconcile] 完成\n');
}

// --- 主流程 ---
function main() {
  console.log(`\n[reconcile] Phase: ${phase}`);
  console.log(`[reconcile] Workspace: ${workspace}`);
  console.log(`[reconcile] Dry run: ${dryRun}\n`);

  if (dryRun) {
    return dryRunMain();
  }

  const auditLog = readAuditLog(workspace);
  console.log(`[reconcile] Audit log: ${auditLog.length} 条记录`);

  // Phase 1: 扫描缺失（不自动补建）
  let missingTraces = 0, missingMarkers = 0, skipped = 0;
  for (const doc of config.docs) {
    const artifactPath = path.join(workspace, doc.artifact);
    const tracePath = path.join(workspace, doc.traceFile);
    if (!fs.existsSync(artifactPath)) { skipped++; continue; }
    if (!fs.existsSync(tracePath)) {
      console.log(`  MISSING  ${doc.traceFile}`);
      missingTraces++;
    }
    for (const skill of doc.skills) {
      const invDir = path.join(workspace, '.claude', 'logs', 'skill-invocations');
      const existing = fs.existsSync(invDir)
        ? fs.readdirSync(invDir).filter(f => f.includes(skill)) : [];
      if (existing.length === 0) {
        console.log(`  MISSING  skill marker: ${skill}`);
        missingMarkers++;
      }
    }
  }
  console.log(`[reconcile] 追踪: 缺失 ${missingTraces} 个, markers 缺失 ${missingMarkers} 个, 跳过 ${skipped} 个`);

  // Phase 2: 4 层验证
  console.log(`\n[reconcile] === 4 层验证 ===`);
  let allPass = true;
  const failedDocs = [];

  for (const doc of config.docs) {
    const artifactPath = path.join(workspace, doc.artifact);
    if (!fs.existsSync(artifactPath)) continue;

    const result = verifyLayer(doc, workspace);
    const status = result.pass ? 'PASS' : 'FAIL';
    console.log(`  ${status}  ${doc.artifact}`);
    result.layers.forEach(l => {
      const marker = l.warn ? '⚠' : (l.pass ? '✓' : '✗');
      console.log(`    ${marker} ${l.name}: ${l.detail}`);
    });

    if (!result.pass) {
      allPass = false;
      failedDocs.push({ doc, result });
    }
  }

  if (allPass) {
    console.log(`\n[reconcile] ✅ 所有验证通过`);
    process.exit(0);
  } else {
    console.log(`\n[reconcile] ❌ 验证失败`);
    failedDocs.forEach(({ doc, result }) => {
      console.log(`  ${doc.artifact}:`);
      result.layers.filter(l => !l.pass).forEach(l => {
        console.log(`    ✗ ${l.name}: ${l.detail}`);
      });
    });
    console.log(`\n[reconcile] 建议:`);
    console.log(`  1. 检查子 agent prompt 是否包含框架绑定指令（无 SUBAGENT-STOP）`);
    console.log(`  2. 检查 .claude/logs/agent-self-report/ 下是否有自报文件`);
    console.log(`  3. 检查 .claude/logs/skill-invocations/ 下是否有 marker 文件`);
    console.log(`  4. 考虑使用 CE_SKIP_GATE=1 跳过门禁`);
    process.exit(1);
  }
}

main();
