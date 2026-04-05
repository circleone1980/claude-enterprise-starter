#!/usr/bin/env node
/**
 * Phase Controller - 阶段推进控制器
 *
 * 功能：检查当前阶段完成情况，自动推进到下一阶段
 */

const fs = require('fs');
const path = require('path');

// 阶段配置
const PHASES = [
  { id: 0, name: '项目初始化', gates: ['目录结构已创建', '环境已配置'] },
  { id: 1, name: '需求分析', gates: ['PRD完成', '架构设计完成'] },
  { id: 2, name: '开发实现', gates: ['代码实现完成', '单元测试通过', '代码审查通过'] },
  { id: 3, name: '测试验证', gates: ['测试覆盖率>80%', '所有测试通过'] },
  { id: 4, name: '产品体验', gates: ['体验测试完成', '体验报告输出'] },
  { id: 5, name: '部署发布', gates: ['部署成功', '健康检查通过'] }
];

// 状态文件路径
const PHASE_FILE = path.join(process.cwd(), '.claude', 'logs', 'current-phase.json');

/**
 * 读取当前阶段状态
 */
function readPhaseStatus() {
  try {
    if (fs.existsSync(PHASE_FILE)) {
      const content = fs.readFileSync(PHASE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('[Phase Controller] Error reading phase file:', error.message);
  }
  return { phase: 0, completed: [], gates: {} };
}

/**
 * 保存阶段状态
 */
function savePhaseStatus(status) {
  try {
    const dir = path.dirname(PHASE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PHASE_FILE, JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('[Phase Controller] Error saving phase file:', error.message);
  }
}

/**
 * 检查阶段门禁
 */
function checkPhaseGates(phaseId, status) {
  const phase = PHASES[phaseId];
  if (!phase) return { passed: false, reason: 'Invalid phase' };

  const gates = status.gates[phaseId] || [];
  const allPassed = phase.gates.every(gate => gates.includes(gate));

  return {
    passed: allPassed,
    required: phase.gates,
    completed: gates,
    pending: phase.gates.filter(gate => !gates.includes(gate))
  };
}

/**
 * 推进到下一阶段
 */
function advanceToNextPhase(currentStatus) {
  const nextPhase = currentStatus.phase + 1;

  if (nextPhase >= PHASES.length) {
    console.log('[Phase Controller] 🎉 All phases completed!');
    return { completed: true, phase: currentStatus.phase };
  }

  console.log(`[Phase Controller] ➡️ Advancing to Phase ${nextPhase}: ${PHASES[nextPhase].name}`);

  const newStatus = {
    ...currentStatus,
    phase: nextPhase,
    completed: [...currentStatus.completed, currentStatus.phase]
  };

  savePhaseStatus(newStatus);

  return { completed: false, phase: nextPhase, status: newStatus };
}

/**
 * 主控制函数
 */
async function control() {
  console.log('[Phase Controller] 🔍 Checking phase status...');

  const status = readPhaseStatus();
  const currentPhase = PHASES[status.phase];

  console.log(`[Phase Controller] 📍 Current Phase: ${currentPhase.name}`);

  // 检查门禁
  const gateCheck = checkPhaseGates(status.phase, status);

  if (gateCheck.passed) {
    console.log('[Phase Controller] ✅ All gates passed, advancing to next phase...');
    const result = advanceToNextPhase(status);

    if (result.completed) {
      console.log('[Phase Controller] 🎉 Project completed successfully!');
    } else {
      console.log(`[Phase Controller] 🚀 Started Phase ${result.phase}: ${PHASES[result.phase].name}`);
    }

    return result;
  } else {
    console.log('[Phase Controller] ⏳ Gates pending:');
    gateCheck.pending.forEach(gate => {
      console.log(`  - ${gate}`);
    });
    return { completed: false, phase: status.phase, pending: gateCheck.pending };
  }
}

// 执行控制
control().catch(error => {
  console.error('[Phase Controller] Fatal error:', error);
  process.exit(1);
});
