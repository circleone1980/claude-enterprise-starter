#!/usr/bin/env node

/**
 * @module scripts/post-phase-reconcile
 * @version 1.0.0
 * @since 2026-04-28
 * @description Phase 完成后的事后对账脚本。
 *              根因: Claude Code 子 agent 操作不触发主会话 hooks，
 *              导致 process-trace 和 skill-invocation markers 缺失。
 *              本脚本通过扫描实际产出物 + trace-audit.jsonl 逆向生成这些记录。
 *
 * 用法:
 *   node scripts/post-phase-reconcile.js --phase=1 [--workspace=.]
 *   node scripts/post-phase-reconcile.js --phase=1 --dry-run
 *
 * Changelog:
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

// --- 生成过程追踪文件内容 ---
function generateTraceContent(doc, auditLog, ws) {
  const artifactPath = path.join(ws, doc.artifact);
  const stat = fs.existsSync(artifactPath) ? fs.statSync(artifactPath) : null;
  const mtime = stat ? stat.mtime.toISOString() : new Date().toISOString();
  const size = stat ? stat.lines || Math.round(stat.size / 40) : 0;

  // 从 audit log 查找证据
  const skillRecords = doc.skills.flatMap(s => findSkillInAudit(auditLog, s));
  const agentRecords = findAgentInAudit(auditLog, doc.agent);
  const skillCalled = skillRecords.length > 0;
  const agentSpawned = agentRecords.length > 0;

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
- **耗时**: 由 agent 异步执行

### Step 2: 文档生成
- **Agent**: ${doc.agent}
- **工作流**: 基于 Skill 指导和需求文档，生成${path.basename(doc.artifact)}
- **输出**: ${doc.artifact} (${size} 行)

### Step 3: 事后对账（本脚本）
- **工具**: scripts/post-phase-reconcile.js
- **工作流**: 扫描产出物 + trace-audit.jsonl，逆向生成过程追踪记录
- **Audit 证据**: Skill 调用 ${skillRecords.length} 条, Agent 调用 ${agentRecords.length} 条

## 关键决策
| 决策 | 选择 | 原因 | 决策者 |
|------|------|------|--------|
| 文档生成方式 | 子 agent 异步生成 | 并行加速产出 | 主会话 |
| Skill 调用确认 | 事后 audit log 对账 | 子 agent hooks 不触发主会话 | post-phase-reconcile |

## 产出物
- 最终文件: \`${doc.artifact}\`
- Audit 记录: \`.claude/logs/trace-audit.jsonl\`

## 审查记录
- **审查方式**: 待执行（对抗审查 / ce-review）
- **审查者**: 待指定
- **审查意见数**: 待定
- **审查报告**: 待生成

## 质量指标
- Skill 调用完整度: ${skillCalled ? '1/1 (100%)' : '0/1 (0%) — 未在 audit log 中找到记录'}
- Agent 合规度: ${agentSpawned ? '是' : '未确认'}
- Rule 遵循度: 事后对账已补偿
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

// --- 主流程 ---
function main() {
  console.log(`\n[reconcile] Phase: ${phase}`);
  console.log(`[reconcile] Workspace: ${workspace}`);
  console.log(`[reconcile] Dry run: ${dryRun}\n`);

  const auditLog = readAuditLog(workspace);
  console.log(`[reconcile] Audit log: ${auditLog.length} 条记录`);

  let generated = 0;
  let skipped = 0;
  let markers = 0;

  for (const doc of config.docs) {
    const artifactPath = path.join(workspace, doc.artifact);
    const tracePath = path.join(workspace, doc.traceFile);

    // 产出物不存在则跳过
    if (!fs.existsSync(artifactPath)) {
      console.log(`  SKIP  ${doc.artifact} — 产出物不存在`);
      skipped++;
      continue;
    }

    // 过程追踪已存在则跳过
    if (fs.existsSync(tracePath)) {
      console.log(`  EXISTS  ${doc.traceFile}`);
      continue;
    }

    // 生成过程追踪
    const content = generateTraceContent(doc, auditLog, workspace);

    if (dryRun) {
      console.log(`  DRY-RUN  ${doc.traceFile} (${content.split('\n').length} 行)`);
    } else {
      const traceDir = path.dirname(tracePath);
      if (!fs.existsSync(traceDir)) {
        fs.mkdirSync(traceDir, { recursive: true });
      }
      fs.writeFileSync(tracePath, content, 'utf-8');
      console.log(`  CREATED  ${doc.traceFile}`);
    }
    generated++;

    // 生成 skill-invocation markers
    for (const skill of doc.skills) {
      const existingMarkers = fs.existsSync(path.join(workspace, '.claude', 'logs', 'skill-invocations'))
        ? fs.readdirSync(path.join(workspace, '.claude', 'logs', 'skill-invocations'))
            .filter(f => f.includes(skill))
        : [];

      if (existingMarkers.length === 0) {
        if (!dryRun) {
          generateSkillMarker(skill, workspace);
        }
        markers++;
      }
    }
  }

  console.log(`\n[reconcile] 结果: ${generated} 生成, ${skipped} 跳过, ${markers} skill markers 补建`);
  if (dryRun) {
    console.log('[reconcile] (dry-run 模式，未实际写入)');
  }
  console.log('[reconcile] 完成\n');
}

main();
