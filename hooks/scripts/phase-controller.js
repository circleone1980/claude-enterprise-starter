#!/usr/bin/env node
/**
 * Phase Controller v2.0 — 机器可检查条件 + 自动 Team 清理
 *
 * 核心变更（vs v1 硬编码版）:
 *   1. 从 automation/phase-gates.json 读取 gate 配置
 *   2. 执行每个 condition 的 check shell 命令，收集 pass/fail
 *   3. 阶段推进时自动调用 team-manager.sh clean 清理上阶段 Team
 *   4. 输出结构化 JSON 供主 Claude 进程解析
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { resolveWorkspaceRoot } = require('./lib/workspace-resolver');

const PROJECT_ROOT = process.cwd();
const GATES_PATH = path.join(PROJECT_ROOT, 'automation', 'phase-gates.json');
const RAGE_MODE_PATH = path.join(PROJECT_ROOT, 'automation', 'rage-mode.json');
const PHASE_LOG_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');
const PHASE_FILE = path.join(PHASE_LOG_DIR, 'current-phase.json');

/**
 * 加载 gates 配置
 */
function loadGates() {
  if (!fs.existsSync(GATES_PATH)) {
    console.error('[phase-controller] phase-gates.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(GATES_PATH, 'utf-8'));
}

/**
 * 加载 rage-mode 配置
 */
function loadRageMode() {
  if (!fs.existsSync(RAGE_MODE_PATH)) return null;
  return JSON.parse(fs.readFileSync(RAGE_MODE_PATH, 'utf-8'));
}

/**
 * 读取当前阶段
 */
function readCurrentPhase() {
  try {
    if (fs.existsSync(PHASE_FILE)) {
      return JSON.parse(fs.readFileSync(PHASE_FILE, 'utf-8'));
    }
  } catch { /* fallback */ }
  return { currentPhase: 0, completed: [] };
}

/**
 * 保存阶段状态
 */
function savePhaseStatus(status) {
  const dir = path.dirname(PHASE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PHASE_FILE, JSON.stringify(status, null, 2));
}

/**
 * 执行 check 命令，返回通过/失败
 */
function checkCondition(condition) {
  if (!condition.check) {
    // 无 check 命令，默认通过（人工验证）
    return { passed: true, note: '无自动检查，需人工确认' };
  }

  try {
    execSync(condition.check, {
      cwd: condition.cwd === 'project_root' ? PROJECT_ROOT : resolveWorkspaceRoot(),
      timeout: 5000,
      stdio: 'pipe',
      shell: '/bin/bash'
    });
    return { passed: true };
  } catch (error) {
    return { passed: false, error: error.message };
  }
}

/**
 * 清理上阶段的 Team（解决 TeamDelete Bug）
 */
function cleanPreviousTeam(phaseId, rageMode) {
  if (!rageMode || !rageMode.phases) return;

  const prevPhase = rageMode.phases.find(p => p.id === phaseId - 1);
  if (!prevPhase || !prevPhase.requiredAgents) return;

  // 尝试调用 team-manager.sh clean（如果有活跃 Team）
  const teamManagerPath = path.join(PROJECT_ROOT, 'scripts', 'team-manager.sh');
  if (fs.existsSync(teamManagerPath)) {
    try {
      // 在 bash 中检查是否有对应的 team 目录
      const teamsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'teams');
      if (fs.existsSync(teamsDir)) {
        const dirs = fs.readdirSync(teamsDir);
        // 查找包含 phase 相关 agent 的 team
        for (const dir of dirs) {
          const configPath = path.join(teamsDir, dir, 'config.json');
          if (fs.existsSync(configPath)) {
            try {
              const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
              if (config.description && config.description.includes(`Phase ${phaseId - 1}`)) {
                execSync(`bash "${teamManagerPath}" clean "${dir}"`, {
                  cwd: PROJECT_ROOT,
                  timeout: 10000,
                  stdio: 'pipe'
                });
              }
            } catch { /* skip invalid configs */ }
          }
        }
      }
    } catch (error) {
      // 清理失败不阻塞流程
      console.error(`[phase-controller] Team cleanup warning: ${error.message}`);
    }
  }
}

/**
 * 主函数
 */
function main() {
  const gates = loadGates();
  const rageMode = loadRageMode();
  const phaseStatus = readCurrentPhase();
  const currentPhase = phaseStatus.currentPhase || 0;

  // 查找当前阶段的 gate
  const gateKey = `phase${currentPhase}_to_phase${currentPhase + 1}`;
  const gate = gates.gates[gateKey];

  if (!gate) {
    // 最后阶段或无对应 gate
    const output = {
      type: 'phase-check-result',
      currentPhase,
      status: 'no_gate_defined',
      message: `Phase ${currentPhase} 无对应 gate 定义（可能是最终阶段）`
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // 执行所有条件检查
  const results = gate.conditions.map(cond => {
    const check = checkCondition(cond);
    return {
      description: cond.description,
      check: cond.check || '(none)',
      checkType: cond.checkType || 'manual',
      passed: check.passed,
      note: check.note || check.error || null
    };
  });

  const allPassed = results.every(r => r.passed);
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  if (allPassed) {
    // 全部通过 → 推进阶段
    const nextPhase = currentPhase + 1;

    // 清理上阶段 Team
    cleanPreviousTeam(nextPhase, rageMode);

    // 更新状态
    const newStatus = {
      currentPhase: nextPhase,
      completed: [...(phaseStatus.completed || []), currentPhase],
      advancedAt: new Date().toISOString()
    };
    savePhaseStatus(newStatus);

    // 获取下阶段 agent 列表
    let nextAgents = [];
    if (rageMode && rageMode.phases) {
      const nextPhaseConfig = rageMode.phases.find(p => p.id === nextPhase);
      nextAgents = nextPhaseConfig ? nextPhaseConfig.requiredAgents : [];
    }

    const output = {
      type: 'phase-check-result',
      currentPhase,
      status: 'advanced',
      nextPhase,
      gateResults: results,
      nextAgents,
      message: `Phase ${currentPhase} → Phase ${nextPhase} 全部 ${total}/${total} 条件通过`
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    // 部分失败 → 输出 pending
    const output = {
      type: 'phase-check-result',
      currentPhase,
      status: 'pending',
      gateResults: results,
      progress: `${passed}/${total}`,
      pendingConditions: results.filter(r => !r.passed).map(r => r.description),
      message: `Phase ${currentPhase} 门禁未通过 (${passed}/${total})`
    };
    console.log(JSON.stringify(output, null, 2));
  }
}

main();
