#!/usr/bin/env node
/**
 * Auto Start Agents - 自动启动 Agent Team（狂暴模式）
 *
 * 功能：TeamCreate 后自动启动所有 Agent
 * Updated: 2026-04-05 - Unified skill mapping
 */

const fs = require('fs');
const path = require('path');

// Agent 配置 - 统一技能映射
const AGENTS = {
  'PM': {
    subagentType: 'everything-claude-code:planner',
    skills: ['product-requirements', 'sprint-planning'],
    phase: 1
  },
  'PO': {
    subagentType: 'general-purpose',
    skills: ['product-requirements', 'sprint-planning', 'user-onboarding'],
    phase: 1
  },
  'Architect': {
    subagentType: 'everything-claude-code:architect',
    skills: ['product-requirements', 'react-best-practices', 'ui-ux-pro-max', 'code-review'],
    phase: 1
  },
  'UI-Designer': {
    subagentType: 'general-purpose',
    skills: ['ui-ux-pro-max'],
    mcpServers: ['figma'],
    phase: 2
  },
  'Frontend-1': {
    subagentType: 'everything-claude-code:typescript-reviewer',
    skills: ['tdd', 'antfu', 'ui-ux-pro-max', 'code-review'],
    phase: 2
  },
  'Frontend-2': {
    subagentType: 'everything-claude-code:typescript-reviewer',
    skills: ['tdd', 'antfu', 'ui-ux-pro-max', 'code-review'],
    phase: 2
  },
  'Frontend-3': {
    subagentType: 'everything-claude-code:typescript-reviewer',
    skills: ['tdd', 'antfu', 'ui-ux-pro-max', 'code-review'],
    phase: 2
  },
  'Backend-1': {
    subagentType: 'everything-claude-code:python-reviewer',
    skills: ['tdd', 'prisma-database-setup', 'code-review'],
    phase: 2
  },
  'Backend-2': {
    subagentType: 'everything-claude-code:python-reviewer',
    skills: ['tdd', 'prisma-database-setup', 'code-review'],
    phase: 2
  },
  'Backend-3': {
    subagentType: 'everything-claude-code:python-reviewer',
    skills: ['tdd', 'prisma-database-setup', 'code-review'],
    phase: 2
  },
  'QA': {
    subagentType: 'everything-claude-code:tdd-guide',
    skills: ['tdd', 'code-review'],
    mcpServers: ['playwright'],
    phase: 3
  },
  'DevOps': {
    subagentType: 'general-purpose',
    skills: ['code-review'],
    mcpServers: ['github'],
    phase: 5
  },
  '产品体验师': {
    subagentType: 'everything-claude-code:planner',
    skills: ['user-onboarding', 'product-requirements', 'ui-ux-pro-max'],
    mcpServers: ['playwright'],
    phase: 4
  }
};

// 状态文件路径
const TEAM_FILE = path.join(process.cwd(), '.claude', 'logs', 'team-status.json');

/**
 * 保存团队状态
 */
function saveTeamStatus(teamName, agents) {
  try {
    const dir = path.dirname(TEAM_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TEAM_FILE, JSON.stringify({
      teamName,
      agents,
      createdAt: new Date().toISOString(),
      status: 'active'
    }, null, 2));
  } catch (error) {
    console.error('[Auto Start Agents] Error saving team status:', error.message);
  }
}

/**
 * 生成 Agent 启动提示
 */
function generateAgentPrompt(name, config) {
  const skillCalls = config.skills.map(skill => `Skill ${skill}`).join('\n    ');
  const mcpCalls = config.mcpServers
    ? config.mcpServers.map(mcp => `Use ${mcp} MCP tools`).join('\n    ')
    : '';

  return `你是 ${name}。
    必须执行：
    ${skillCalls}
    ${mcpCalls}

    遵循 TDD 流程和代码审查要求。
    任务：等待 PM 分配具体任务`;
}

/**
 * 主函数
 */
async function autoStart() {
  console.log('[Auto Start Agents] 🚀 RAGE MODE ACTIVATED!');
  console.log('[Auto Start Agents] 📋 Starting all agents automatically...');

  const teamName = process.env.TEAM_NAME || 'Dev-Team';
  const agentStatus = {};

  // 按阶段分组 Agent
  const phases = {};
  for (const [name, config] of Object.entries(AGENTS)) {
    const phase = config.phase;
    if (!phases[phase]) phases[phase] = [];
    phases[phase].push({ name, config });
  }

  // 输出启动计划
  console.log('\n[Auto Start Agents] 📊 Agent Launch Plan:');
  for (const [phase, agents] of Object.entries(phases)) {
    console.log(`\n  Phase ${phase}:`);
    agents.forEach(({ name }) => {
      console.log(`    - ${name}`);
    });
  }

  // Phase 1 立即启动
  console.log('\n[Auto Start Agents] 🔄 Starting Phase 1 agents...');
  for (const { name, config } of phases[1] || []) {
    console.log(`[Auto Start Agents] 🤖 Starting ${name}...`);
    console.log(`    Subagent: ${config.subagentType}`);
    console.log(`    Skills: ${config.skills.join(', ')}`);

    agentStatus[name] = {
      status: 'starting',
      subagentType: config.subagentType,
      skills: config.skills,
      phase: config.phase,
      startedAt: new Date().toISOString()
    };

    // 这里实际启动 Agent 的逻辑会由 Claude Code 执行
    // 当前脚本只是输出启动指令
    console.log(`    Prompt: ${generateAgentPrompt(name, config).substring(0, 100)}...`);
  }

  // 保存状态
  saveTeamStatus(teamName, agentStatus);

  console.log('\n[Auto Start Agents] ✅ Phase 1 agents started');
  console.log('[Auto Start Agents] ⏳ Other agents will start when their phase begins');

  console.log('\n[Auto Start Agents] 📝 Next steps:');
  console.log('  1. PM will create task list');
  console.log('  2. PO will analyze requirements');
  console.log('  3. Architect will design system');
  console.log('  4. Development agents will start after Phase 1 completes');

  return agentStatus;
}

// 执行启动
autoStart().catch(error => {
  console.error('[Auto Start Agents] Fatal error:', error);
  process.exit(1);
});
