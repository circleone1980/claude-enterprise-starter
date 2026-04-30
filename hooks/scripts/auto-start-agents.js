#!/usr/bin/env node
/**
 * Auto Start Agents v5.2.0 — SSOT + 智能模式评分引擎 + Prompt 生成
 *
 * 核心变更（vs v1 硬编码版）:
 *   1. 从 automation/agent-orchestration.json（SSOT）读取所有配置
 *   2. 内置 modeSelection 评分引擎，自动决定 Team/Subagent 模式
 *   3. 输出结构化 JSON 供主 Claude 进程解析执行
 *
 * 评分规则:
 *   总分 >= modeThresholds.team (6)        → TeamCreate + SendMessage
 *   总分 >= modeThresholds.subagentParallel (3) → Agent 并行 spawn
 *   总分 < 3                                 → Agent 顺序 spawn
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');
const { isWorkspaceMode, resolveWorkspaceRoot } = require('./lib/workspace-resolver');

// 项目根目录
const PROJECT_ROOT = process.cwd();
const SSOT_PATH = path.join(PROJECT_ROOT, 'automation', 'agent-orchestration.json');
const RAGE_MODE_PATH = path.join(PROJECT_ROOT, 'automation', 'rage-mode.json');
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');

/**
 * 加载 SSOT 配置
 */
function loadSSOT() {
  if (!fs.existsSync(SSOT_PATH)) {
    console.error('[auto-start-agents] SSOT not found:', SSOT_PATH);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(SSOT_PATH, 'utf-8'));
}

/**
 * 加载 rage-mode 配置
 */
function loadRageMode() {
  if (!fs.existsSync(RAGE_MODE_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(RAGE_MODE_PATH, 'utf-8'));
}

/**
 * 获取当前阶段
 */
function getCurrentPhase() {
  const phaseFile = path.join(PHASE_LOG_DIR, 'current-phase.json');
  if (fs.existsSync(phaseFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(phaseFile, 'utf-8'));
      return data.currentPhase || 0;
    } catch { /* fallback to 0 */ }
  }
  return 0;
}

/**
 * 模式评分引擎 — 计算 modeSelection 总分，决定 Team/Subagent
 * @param {Object} agent - agent 配置（含 modeSelection）
 * @param {Object} thresholds - modeThresholds 配置
 * @param {string} subPhase - 子阶段标识（如 "2A" 接口对齐 / "2B" 独立开发）
 * @returns {{ mode: string, score: number, reason: string }}
 */
function decideMode(agent, thresholds, subPhase, targetPhase) {
  const scores = agent.modeSelection || {
    communicationNeed: 0,
    crossLayerDependency: 0,
    contextPressure: 0,
    roleCount: 0,
    writeConflictRisk: 0
  };

  let total = Object.values(scores).reduce((a, b) => a + b, 0);

  // Phase 2 子阶段特殊处理
  if (subPhase === '2A') {
    // Phase 2A（接口对齐）：所有开发角色强制提升通信和跨层分数
    total = Math.max(total, 6); // 保证 >= team 阈值
  }

  // Phase 3/4 特殊处理：测试和体验阶段需要多角色 Team 协作
  const phaseStr = String(targetPhase || '');
  if (phaseStr === '3' || phaseStr === '4') {
    total = Math.max(total, 6); // 保证 Team 模式
  }

  let mode;
  let reason;

  if (total >= (thresholds.team || 6)) {
    mode = 'team';
    reason = `总分 ${total} >= ${thresholds.team}，需要协作通信`;
  } else if (total >= (thresholds.subagentParallel || 3)) {
    mode = 'subagent-parallel';
    reason = `总分 ${total} 在 ${thresholds.subagentParallel}-${thresholds.team - 1} 之间，可并行独立执行`;
  } else {
    mode = 'subagent-sequential';
    reason = `总分 ${total} < ${thresholds.subagentParallel}，顺序独立执行`;
  }

  return { mode, score: total, reason };
}

/**
 * 加载与 Agent 角色相关的 AC 信息
 * @param {string} roleName
 * @param {object} acTracker
 * @returns {Array}
 */
function loadRelevantACs(roleName, acTracker) {
  if (!acTracker || !acTracker.features) return [];

  // 按角色映射筛选策略
  const roleFilterMap = {
    'QA': () => true,
    'PM': () => true,
    'PO': () => true,
    'Architect': () => true,
    '产品体验师': () => true,
    'Frontend': (f) => f.priority === 'P0' || f.priority === 'P1',
    'Backend-Java': (f) => f.priority === 'P0' || f.priority === 'P1',
    'Backend-Python': (f) => f.priority === 'P0' || f.priority === 'P1',
    'DevOps': () => true,
  };

  const filter = roleFilterMap[roleName] || (() => false);
  return acTracker.features.filter(filter);
}

/**
 * 生成 Agent 启动 prompt
 */
function generatePrompt(name, agent) {
  const skills = agent.requiredSkills || [];
  const skillCalls = skills.map(s => `    - 调用 Skill ${s}`).join('\n');

  let tddSection = '';
  if (skills.includes('tdd') || skills.includes('springboot-tdd')) {
    tddSection = `
    TDD 流程（强制）:
    - 🔴 编写测试用例（Red 阶段）
    - 🔴 实现代码（Green 阶段）
    - 🔴 重构优化（Refactor 阶段）`;
  }

  let reviewSection = '';
  if (skills.includes('code-review')) {
    reviewSection = `
    代码审查:
    - 完成后必须调用 Skill code-review 审查代码质量
    - 确保测试覆盖率 >80%`;
  }

  // L2 提醒层: Codex 双模型提醒
  let codexSection = '';
  if (agent.codexIntegration) {
    const rescue = agent.codexIntegration.rescueCommand || '/codex:rescue';
    codexSection = `

    Codex 审查提醒（双模型协作）:
    - 完成任务后，主进程会自动调用 Codex (GPT-5.5) 进行代码审查
    - 如果遇到困难，建议主进程使用 ${rescue}
    - 不要自行调用 Codex 命令`;
  }

  // AC Context 注入 — 验收标准驱动
  let acSection = '';
  const acTrackerPath = path.join(PROJECT_ROOT, 'automation', 'ac-tracker.json');
  if (fs.existsSync(acTrackerPath)) {
    try {
      const tracker = JSON.parse(fs.readFileSync(acTrackerPath, 'utf-8'));
      const relevantFeatures = loadRelevantACs(name, tracker);
      if (relevantFeatures.length > 0) {
        const acList = relevantFeatures.map(f =>
          f.acceptanceCriteria.map(ac =>
            `    - ${ac.acId}: ${ac.title} [${ac.status}]`
          ).join('\n')
        ).join('\n');
        if (acList) {
          acSection = `

    验收标准（必须满足）:
${acList}
    ⚠️ 每个功能完成后必须验证对应 AC 是否通过
    ⚠️ AC 未通过视为功能未完成，不可提交`;
        }
      }
    } catch (e) { /* tracker 解析失败不影响正常启动 */ }
  }

  // Workspace 上下文注入
  let workspaceSection = '';
  if (isWorkspaceMode()) {
    workspaceSection = `

    工作区路径: 目标项目代码在 ${resolveWorkspaceRoot()}
    - 源代码目录: workspace/src/
    - 项目文档目录: workspace/docs/
    - 模板配置在项目根目录`;
  }

  // 代码注释标准注入
  let commentSection = '';
  const commentRulePath = path.join(PROJECT_ROOT, 'rules', '08_code_comments.md');
  if (fs.existsSync(commentRulePath)) {
    commentSection = `

    代码注释标准（强制）:
    - 每个源文件必须有模块头注释（@version, @since, @module, Changelog）
    - 每个公开函数必须有中文 JSDoc/Javadoc/docstring 注释
    - 注释模板见 templates/code-headers/`;
  }

  // CE 必需依赖提醒
  const ceSkills = skills.filter(s => s.startsWith('ce-'));
  let ceSection = '';
  if (ceSkills.length > 0) {
    ceSection = `

    CE Plugin（必需依赖）:
    - CE plugin is a REQUIRED dependency. All ce-* skills must be available.
    - If any ce-* skill is unavailable, STOP and report the error.
    - CE skills to use: ${ceSkills.join(', ')}`;
  }

  // ce-work 工作流注入
  let workSection = '';
  if (skills.includes('ce-work')) {
    workSection = `

    开发工作流（ce-work 驱动）:
    - Use /ce-work as the core execution engine for ALL development tasks.
    - /ce-work enforces:
      * Single-task iteration (no multitasking)
      * Auto progress notes after each sub-task
      * Blocker/dependency tracking
      * TDD cycle (Red → Green → Refactor) within each iteration
      * Code style consistency checks
    - Progress file: docs/dev/progress.md
    - Blockers file: docs/dev/blockers.md`;
  }

  return `你是 ${name}。必须遵循以下流程：
${skillCalls}${tddSection}${reviewSection}${codexSection}${acSection}${workspaceSection}${commentSection}${ceSection}${workSection}

    任务：等待分配具体任务`;
}

/**
 * 主函数 — 读取 SSOT + 评分 → 输出结构化 JSON
 */
function main() {
  const ssot = loadSSOT();
  const rageMode = loadRageMode();
  const currentPhase = getCurrentPhase();
  const thresholds = ssot.modeThresholds || { team: 6, subagentParallel: 3, subagentSequential: 0 };

  // 如果有命令行参数指定 phase，优先使用
  const cliPhase = process.argv.find(a => a.startsWith('--phase='));
  const targetPhase = cliPhase ? cliPhase.split('=')[1] : currentPhase;

  // 获取 rage-mode 中的 phase-agent 映射
  const phaseAgentMap = {};
  if (rageMode && rageMode.phases) {
    for (const phase of rageMode.phases) {
      phaseAgentMap[phase.id] = phase.requiredAgents || [];
    }
  }

  // 筛选当前阶段的 agents
  const agentsToStart = [];
  const phaseAgents = phaseAgentMap[targetPhase] || [];

  // 如果 phaseAgentMap 为空（配置不一致），从 ssot.agents 按 phase 筛选
  const targetAgents = phaseAgents.length > 0
    ? phaseAgents.filter(name => ssot.agents[name])
    : Object.entries(ssot.agents)
        .filter(([_, a]) => String(a.phase) === String(targetPhase))
        .map(([name]) => name);

  // 决定子阶段（仅 Phase 2: 2A=接口对齐, 2B=独立开发）
  // 默认 2B（独立开发），如果需要接口对齐则由 orchestrate.sh 指定
  const subPhaseArg = process.argv.find(a => a.startsWith('--subphase='));
  const subPhase = subPhaseArg ? subPhaseArg.split('=')[1] : (String(targetPhase) === '2' ? '2B' : null);

  // 为每个角色构建启动指令
  const modeDecisions = [];
  const teamAgents = [];
  const subagentTasks = [];

  for (const agentName of targetAgents) {
    const agent = ssot.agents[agentName];
    if (!agent) continue;

    const decision = decideMode(agent, thresholds, subPhase, targetPhase);
    const count = agent.count || 1;

    modeDecisions.push({
      role: agentName,
      score: decision.score,
      decidedMode: decision.mode,
      reason: decision.reason
    });

    const prompt = generatePrompt(agentName, agent);

    // Use local agent .md file name for subagentType — triggers native loading
    const localSubagentType = path.basename(agent.agentMd, '.md');

    if (decision.mode === 'team') {
      // Team 模式：生成 TeamCreate 所需的 agent 列表
      for (let i = 1; i <= count; i++) {
        teamAgents.push({
          name: count > 1 ? `${agentName}-${i}` : agentName,
          subagentType: localSubagentType,
          originalSubagentType: agent.subagentType,
          teamMode: true,
          prompt,
          skills: agent.requiredSkills || [],
          mcpServers: agent.mcpServers || [],
          codexIntegration: agent.codexIntegration || null
        });
      }
    } else {
      // Subagent 模式
      for (let i = 1; i <= count; i++) {
        subagentTasks.push({
          name: count > 1 ? `${agentName}-${i}` : agentName,
          subagentType: localSubagentType,
          originalSubagentType: agent.subagentType,
          teamMode: false,
          prompt,
          skills: agent.requiredSkills || [],
          parallel: decision.mode === 'subagent-parallel',
          mcpServers: agent.mcpServers || [],
          codexIntegration: agent.codexIntegration || null
        });
      }
    }
  }

  // 构建输出
  const output = {
    type: 'agent-spawn-instructions',
    version: '4.0.0',
    currentPhase: targetPhase,
    subPhase,
    modeDecisions,
    teamAgents,
    subagentTasks,
    summary: {
      totalAgents: teamAgents.length + subagentTasks.length,
      teamMode: teamAgents.length,
      subagentMode: subagentTasks.length,
      phaseDescription: getPhaseDescription(targetPhase, rageMode)
    }
  };

  // 检查 --format=prompt 参数
  const formatPrompt = process.argv.includes('--format=prompt');

  if (formatPrompt) {
    // 输出 Claude Code 可直接执行的 prompt 文本
    outputAsPrompt(output, targetPhase);
  } else {
    // 默认输出 JSON
    console.log(JSON.stringify(output, null, 2));
  }
}

/**
 * 以 prompt 格式输出 — Claude Code 主会话可直接执行
 */
function outputAsPrompt(output, phaseId) {
  const lines = [];
  lines.push(`# Phase ${phaseId} Agent 启动指令`);
  lines.push(``);
  lines.push(`> 生成时间: ${new Date().toISOString()}`);
  lines.push(`> 总计 ${output.summary.totalAgents} 个 Agent（Team: ${output.summary.teamMode}, Subagent: ${output.summary.subagentMode}）`);
  lines.push(``);

  // Team 模式
  const teamAgents = output.teamAgents;
  if (teamAgents.length > 0) {
    lines.push(`## 创建 Team`);
    lines.push(``);
    lines.push('```');
    lines.push(`TeamCreate({ team_name: "phase${phaseId}-team", description: "Phase ${phaseId} ${output.summary.phaseDescription}" })`);
    lines.push('```');
    lines.push(``);

    lines.push(`## 启动 Team Agents`);
    lines.push(``);
    for (const agent of teamAgents) {
      lines.push('```');
      lines.push(`Agent({`);
      lines.push(`  description: "${agent.name} — Phase ${phaseId}",`);
      lines.push(`  name: "${agent.name}",`);
      lines.push(`  subagent_type: "${agent.subagentType}",`);
      lines.push(`  team_name: "phase${phaseId}-team",`);
      lines.push(`  prompt: \`${agent.prompt}\``);
      lines.push(`})`);
      lines.push('```');
      lines.push(``);
    }
  }

  // Subagent 模式
  const subagentTasks = output.subagentTasks;
  if (subagentTasks.length > 0) {
    lines.push(`## 启动 Subagents${subagentTasks[0].parallel ? '（并行）' : '（顺序）'}`);
    lines.push(``);
    for (const agent of subagentTasks) {
      lines.push('```');
      lines.push(`Agent({`);
      lines.push(`  description: "${agent.name} — Phase ${phaseId}",`);
      lines.push(`  name: "${agent.name}",`);
      lines.push(`  subagent_type: "${agent.subagentType}",`);
      lines.push(`  prompt: \`${agent.prompt}\``);
      lines.push(`})`);
      lines.push('```');
      lines.push(``);
    }
  }

  // 过程追踪提醒
  lines.push(`## 过程追踪`);
  lines.push(``);
  lines.push(`完成后创建过程追踪记录:`);
  lines.push(`- 路径: docs/process-trace/phase${phaseId}/`);
  lines.push(`- 必须记录: 使用的 Agent、调用的 Skill、关键决策`);
  lines.push(``);

  console.log(lines.join('\n'));
}

/**
 * 获取阶段描述
 */
function getPhaseDescription(phase, rageMode) {
  if (!rageMode || !rageMode.phases) return '';
  const phaseNum = Number(phase);
  const p = rageMode.phases.find(p => {
    if (isNaN(phaseNum)) return String(p.id) === String(phase);
    return p.id === phaseNum || String(p.id) === String(phase);
  });
  return p ? p.name : '';
}

// 执行
main();
