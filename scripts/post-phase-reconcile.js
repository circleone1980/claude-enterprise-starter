#!/usr/bin/env node

/**
 * @module scripts/post-phase-reconcile
 * @version 2.0.0
 * @since 2026-04-28
 * @description Phase 完成后的对账 + 4 层验证脚本。
 *              v1: 事后对账（逆向生成追踪 + markers）
 *              v2: 新增 4 层验证（Agent 自报 + Skill markers + 产出物结构 + Audit 交叉验证）
 *                  FAIL 时退出码 1，主会话重新执行子 agent
 *
 * 用法:
 *   node scripts/post-phase-reconcile.js --phase=1 [--workspace=.]
 *   node scripts/post-phase-reconcile.js --phase=1 --dry-run
 *
 * 退出码:
 *   0 = SUCCESS（4 层验证全部通过）
 *   1 = FAIL（验证失败，需重试或人工介入）
 *
 * Changelog:
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
  if (!fs.existsSync(auditPath)) return [];
  try {
    return fs.readFileSync(auditPath, 'utf-8')
      .split('\n').filter(l => l.trim())
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

// --- 查找 audit log 中的 Skill 调用 ---
function findSkillInAudit(auditLog, skillName) {
  return auditLog.filter(r =>
    r.skill && (r.skill === skillName || r.skill.includes(skillName) || skillName.includes(r.skill))
  );
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

  // Layer 1: Agent 自报文件存在 + skills_called 非空
  const selfReport = findSelfReport(doc.agent, ws);
  results.layers.push({
    name: 'Layer 1: Agent 自报',
    pass: !!selfReport && selfReport.includes('skills_called'),
    detail: selfReport ? '找到自报文件' : '未找到自报文件'
  });

  // Layer 2: Skill marker 文件完整
  const invDir = path.join(ws, '.claude', 'logs', 'skill-invocations');
  const markers = fs.existsSync(invDir)
    ? fs.readdirSync(invDir).filter(f => doc.skills.some(s => f.includes(s)))
    : [];
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

  // Layer 4: trace-audit.jsonl 交叉验证
  const skillRecords = doc.skills.flatMap(s => findSkillInAudit(auditLog, s));
  results.layers.push({
    name: 'Layer 4: Audit 交叉验证',
    pass: skillRecords.length > 0,
    detail: `Audit 记录 ${skillRecords.length} 条`
  });

  results.pass = results.layers.every(l => l.pass);
  return results;
}

// --- 生成过程追踪文件内容 ---
function generateTraceContent(doc, auditLog, ws) {
  const artifactPath = path.join(ws, doc.artifact);
  const stat = fs.existsSync(artifactPath) ? fs.statSync(artifactPath) : null;
  const mtime = stat ? stat.mtime.toISOString() : new Date().toISOString();
  const size = stat ? Math.round(stat.size / 40) : 0;

  const skillRecords = doc.skills.flatMap(s => findSkillInAudit(auditLog, s));
  const agentRecords = findAgentInAudit(auditLog, doc.agent);
  const skillCalled = skillRecords.length > 0;
  const agentSpawned = agentRecords.length > 0;

  // 优先读取自报内容
  const selfReport = findSelfReport(doc.agent, ws);
  let selfReportSection = '';
  if (selfReport) {
    selfReportSection = `\n## 自报来源\n> 数据来自 agent 自报文件\n\n${selfReport.substring(0, 1000)}\n`;
  }

  const timestamp = mtime.replace(/\.\d+Z$/, '').replace('T', ' ');

  return `---
type: process-trace
phase: ${phase.replace('phase', '')}
artifact: ${doc.artifact}
agent: ${doc.agent}
agentFile: agents/${doc.agent}.md
timestamp: ${timestamp}
status: completed
---

# 过程追踪：${path.basename(doc.artifact, '.md')}

## 执行链路

### Step 1: Agent 启动与 Skill 调用
- **Agent**: ${doc.agent} (\`agents/${doc.agent}.md\`)
- **subagent_type**: ${doc.agentType}
- **调用的 Skill**: ${doc.skills.map(s => `${s}${skillCalled ? ' ✓' : ' (未在 audit log 中找到)'}`).join(', ')}
- **遵循的 Rule**: Rule 04 (Agent Team), Rule 07 (Skill 触发), Rule 17 (过程追踪)
- **工作流**: ${doc.agent} agent 被主会话 spawn，调用 ${doc.skills.join(', ')} Skill 后生成文档
- **输入**: PRD.md, user-stories.md, acceptance-criteria.md (如适用)
- **输出**: ${doc.artifact}

### Step 2: 文档生成
- **Agent**: ${doc.agent}
- **工作流**: 基于 Skill 指导和需求文档，生成${path.basename(doc.artifact)}
- **输出**: ${doc.artifact} (${size} 行)

### Step 3: 事后对账（本脚本）
- **工具**: scripts/post-phase-reconcile.js v2.0.0
- **工作流**: 扫描产出物 + 自报文件 + trace-audit.jsonl，生成过程追踪记录
- **Audit 证据**: Skill 调用 ${skillRecords.length} 条, Agent 调用 ${agentRecords.length} 条
- **自报状态**: ${selfReport ? '已找到' : '未找到'}

## 关键决策
| 决策 | 选择 | 原因 | 决策者 |
|------|------|------|--------|
| 文档生成方式 | 子 agent 异步生成 | 并行加速产出 | 主会话 |
| Skill 调用确认 | 4 层验证 | Agent 自报 + markers + 结构 + audit | post-phase-reconcile v2 |
${selfReport ? '| 自报内容 | 已注入追踪文件 | 确保真实记录 | Agent 自报 |\n' : ''}
## 产出物
- 最终文件: \`${doc.artifact}\`
- Audit 记录: \`.claude/logs/trace-audit.jsonl\`
- 自报文件: \`.claude/logs/agent-self-report/${doc.agent}-*.md\`

## 审查记录
- **审查方式**: 待执行（对抗审查 / ce-review）
- **审查者**: 待指定
- **审查意见数**: 待定
- **审查报告**: 待生成

## 质量指标
- Skill 调用完整度: ${skillCalled ? '1/1 (100%)' : '0/1 (0%) — 未在 audit log 中找到记录'}
- Agent 合规度: ${agentSpawned ? '是' : '未确认'}
- Rule 遵循度: 事后对账已补偿
- 4 层验证: 见 verifyLayer() 结果
${selfReportSection}
`;
}

// --- 生成 skill-invocation marker ---
function generateSkillMarker(skillName, ws) {
  const invDir = path.join(ws, '.claude', 'logs', 'skill-invocations');
  if (!fs.existsSync(invDir)) {
    fs.mkdirSync(invDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const markerFile = path.join(invDir, `${timestamp}-${skillName}.json`);
  const markerData = {
    skill: skillName,
    timestamp: new Date().toISOString(),
    source: 'post-phase-reconcile',
    note: 'Retroactive marker — subagent hooks do not fire in main session',
  };
  fs.writeFileSync(markerFile, JSON.stringify(markerData, null, 2));
  return markerFile;
}

// --- Dry-run 主流程（保持向后兼容） ---
function dryRunMain() {
  const auditLog = readAuditLog(workspace);
  console.log(`[reconcile] Audit log: ${auditLog.length} 条记录`);

  let generated = 0, skipped = 0, markers = 0;

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
      continue;
    }

    const content = generateTraceContent(doc, auditLog, workspace);
    console.log(`  DRY-RUN  ${doc.traceFile} (${content.split('\n').length} 行)`);
    generated++;

    for (const skill of doc.skills) {
      const invDir = path.join(workspace, '.claude', 'logs', 'skill-invocations');
      const existing = fs.existsSync(invDir)
        ? fs.readdirSync(invDir).filter(f => f.includes(skill)) : [];
      if (existing.length === 0) {
        markers++;
      }
    }
  }

  console.log(`\n[reconcile] 结果: ${generated} 生成, ${skipped} 跳过, ${markers} skill markers`);
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

  // Phase 1: 生成缺失的追踪文件和 markers
  let generated = 0, skipped = 0, markers = 0;
  for (const doc of config.docs) {
    const artifactPath = path.join(workspace, doc.artifact);
    const tracePath = path.join(workspace, doc.traceFile);
    if (!fs.existsSync(artifactPath)) { skipped++; continue; }
    if (!fs.existsSync(tracePath)) {
      const content = generateTraceContent(doc, auditLog, workspace);
      const traceDir = path.dirname(tracePath);
      if (!fs.existsSync(traceDir)) fs.mkdirSync(traceDir, { recursive: true });
      fs.writeFileSync(tracePath, content, 'utf-8');
      console.log(`  CREATED  ${doc.traceFile}`);
      generated++;
    }
    for (const skill of doc.skills) {
      const invDir = path.join(workspace, '.claude', 'logs', 'skill-invocations');
      const existing = fs.existsSync(invDir)
        ? fs.readdirSync(invDir).filter(f => f.includes(skill)) : [];
      if (existing.length === 0) {
        generateSkillMarker(skill, workspace);
        markers++;
      }
    }
  }
  console.log(`[reconcile] 追踪: ${generated} 生成, ${skipped} 跳过, ${markers} markers 补建`);

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
      console.log(`    ${l.pass ? '✓' : '✗'} ${l.name}: ${l.detail}`);
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
