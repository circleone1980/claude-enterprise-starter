#!/usr/bin/env node
/**
 * Agent Health Monitor - Agent 健康监控脚本
 *
 * 功能：监控 Agent 运行状态，检测下线的 Agent 并触发重启
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  checkInterval: 300000,  // 5 分钟
  maxRetries: 3,
  restartDelay: 10000,    // 10 秒
  healthTimeout: 60000    // 1 分钟
};

// Agent 状态文件路径
const AGENT_STATUS_FILE = path.join(process.cwd(), '.claude', 'logs', 'agent-status.json');

/**
 * 读取 Agent 状态
 */
function readAgentStatus() {
  try {
    if (fs.existsSync(AGENT_STATUS_FILE)) {
      const content = fs.readFileSync(AGENT_STATUS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('[Agent Monitor] Error reading status file:', error.message);
  }
  return { agents: {} };
}

/**
 * 保存 Agent 状态
 */
function saveAgentStatus(status) {
  try {
    const dir = path.dirname(AGENT_STATUS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AGENT_STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('[Agent Monitor] Error saving status file:', error.message);
  }
}

/**
 * 检查 Agent 是否健康
 */
function checkAgentHealth(agentName, agentInfo) {
  const now = Date.now();
  const lastHeartbeat = agentInfo.lastHeartbeat || 0;
  const timeSinceLastHeartbeat = now - lastHeartbeat;

  // 如果超过 2 倍检查间隔没有心跳，认为 Agent 下线
  if (timeSinceLastHeartbeat > CONFIG.checkInterval * 2) {
    return {
      healthy: false,
      reason: 'No heartbeat detected',
      lastSeen: new Date(lastHeartbeat).toISOString()
    };
  }

  return { healthy: true };
}

/**
 * 触发 Agent 重启
 */
async function triggerAgentRestart(agentName, agentInfo) {
  console.log(`[Agent Monitor] 🔄 Triggering restart for agent: ${agentName}`);

  // 检查重试次数
  const retries = agentInfo.restartRetries || 0;
  if (retries >= CONFIG.maxRetries) {
    console.error(`[Agent Monitor] ❌ Max retries exceeded for agent: ${agentName}`);
    return false;
  }

  // 这里可以集成实际的 Agent 重启逻辑
  // 例如：通过 Claude Code API 重启 Agent
  console.log(`[Agent Monitor] Restarting agent ${agentName} (attempt ${retries + 1}/${CONFIG.maxRetries})`);

  return true;
}

/**
 * 主监控循环
 */
async function monitor() {
  console.log('[Agent Monitor] 🔍 Starting health check...');

  const status = readAgentStatus();
  const agents = status.agents || {};
  const results = {
    healthy: [],
    unhealthy: [],
    restarted: []
  };

  for (const [agentName, agentInfo] of Object.entries(agents)) {
    const health = checkAgentHealth(agentName, agentInfo);

    if (health.healthy) {
      results.healthy.push(agentName);
      console.log(`[Agent Monitor] ✅ ${agentName}: Healthy`);
    } else {
      results.unhealthy.push({
        name: agentName,
        reason: health.reason,
        lastSeen: health.lastSeen
      });
      console.log(`[Agent Monitor] ⚠️ ${agentName}: Unhealthy - ${health.reason}`);

      // 尝试重启
      const restarted = await triggerAgentRestart(agentName, agentInfo);
      if (restarted) {
        results.restarted.push(agentName);
      }
    }
  }

  // 输出监控报告
  console.log('\n[Agent Monitor] 📊 Health Check Report:');
  console.log(`  Healthy: ${results.healthy.length}`);
  console.log(`  Unhealthy: ${results.unhealthy.length}`);
  console.log(`  Restarted: ${results.restarted.length}`);

  // 如果有不健康的 Agent，返回非零状态码
  if (results.unhealthy.length > 0) {
    console.log('\n[Agent Monitor] ⚠️ Attention required for unhealthy agents');
  }

  return results;
}

// 执行监控
monitor().catch(error => {
  console.error('[Agent Monitor] Fatal error:', error);
  process.exit(1);
});
