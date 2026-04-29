const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * 创建模拟 Claude Code hook 的 stdin JSON 输入
 *
 * Hook 脚本从 stdin 读取 JSON，直接访问 file_path 等字段（非嵌套）。
 * 此函数直接序列化 toolInput 作为 stdin 数据。
 *
 * @param {string} toolName - 工具名（Edit, Write, Bash 等）— 仅用于文档记录
 * @param {object} toolInput - 工具输入参数（file_path, content 等）
 * @returns {string} JSON string
 */
function createMockInput(toolName, toolInput) {
  return JSON.stringify(toolInput);
}

/**
 * 运行 hook 脚本并捕获结果
 * @param {string} scriptPath - hook 脚本的相对路径（如 'hooks/scripts/phase-gate-guard.js'）
 * @param {string} stdinInput - stdin JSON 输入
 * @param {object} options - 选项
 * @param {string} [options.cwd] - 工作目录（默认 PROJECT_ROOT）
 * @param {object} [options.env] - 环境变量
 * @param {number} [options.timeout=5000] - 超时 ms
 * @returns {{ exitCode: number, stdout: string, stderr: string }}
 */
function runHook(scriptPath, stdinInput, options = {}) {
  const cwd = options.cwd || PROJECT_ROOT;
  // Always resolve hook scripts relative to PROJECT_ROOT, not cwd
  const fullPath = path.isAbsolute(scriptPath) ? scriptPath : path.join(PROJECT_ROOT, scriptPath);
  const timeout = options.timeout || 5000;

  const env = { ...process.env, ...options.env };

  // Write stdin to temp file to avoid shell escaping issues with paths containing spaces
  const stdinFile = path.join(os.tmpdir(), `ce-stdin-${Date.now()}.json`);
  fs.writeFileSync(stdinFile, stdinInput);

  try {
    const stdout = execSync(`node "${fullPath}" < "${stdinFile}"`, {
      cwd,
      env,
      timeout,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exitCode: 0, stdout: stdout.trim(), stderr: '' };
  } catch (err) {
    return {
      exitCode: err.status || 1,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || '').trim(),
    };
  } finally {
    try { fs.unlinkSync(stdinFile); } catch { /* ignore */ }
  }
}

/**
 * 创建临时项目目录（含 .claude/logs/ 结构）
 * @param {object} structure - 目录结构（key=相对路径, value=内容或 null 表示目录）
 * @returns {string} 临时目录路径
 */
function createTempProject(structure = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-test-'));

  // 确保基础目录存在
  const logsDir = path.join(tmpDir, '.claude', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });

  // 创建 skill-invocations 目录
  fs.mkdirSync(path.join(logsDir, 'skill-invocations'), { recursive: true });

  for (const [relPath, content] of Object.entries(structure)) {
    const fullPath = path.join(tmpDir, relPath);
    if (content === null || content === undefined) {
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    }
  }

  return tmpDir;
}

/**
 * 清理临时目录
 * @param {string} tmpDir
 */
function cleanupTemp(tmpDir) {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/**
 * 创建 marker 文件
 * @param {string} dir - 目录路径
 * @param {string} name - 文件名
 * @param {object|string} content - 内容
 * @returns {string} 文件完整路径
 */
function createMarker(dir, name, content) {
  fs.mkdirSync(dir, { recursive: true });
  const fullPath = path.join(dir, name);
  const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(fullPath, data);
  return fullPath;
}

/**
 * 断言 hook 被阻止（exit code 非零）
 * @param {{ exitCode: number, stdout: string, stderr: string }} result
 * @param {string} [reasonSubstring] - stderr 中应包含的子串
 * @throws {AssertionError}
 */
function assertBlocked(result, reasonSubstring) {
  if (result.exitCode === 0) {
    throw new Error(`Expected hook to be blocked, but got exit code 0.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  }
  if (reasonSubstring) {
    const output = result.stderr + result.stdout;
    if (!output.includes(reasonSubstring)) {
      throw new Error(`Expected stderr to contain "${reasonSubstring}", but got:\n${output}`);
    }
  }
}

/**
 * 断言 hook 被放行（exit code 0）
 * @param {{ exitCode: number, stdout: string, stderr: string }} result
 * @throws {AssertionError}
 */
function assertAllowed(result) {
  if (result.exitCode !== 0) {
    throw new Error(`Expected hook to allow, but got exit code ${result.exitCode}.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  }
}

/**
 * 创建 phase marker 文件
 * @param {string} tmpDir - 临时项目目录
 * @param {number} phase - 当前阶段
 */
function setPhase(tmpDir, phase) {
  const logsDir = path.join(tmpDir, '.claude', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(
    path.join(logsDir, 'current-phase.json'),
    JSON.stringify({ currentPhase: phase })
  );
}

/**
 * 创建 Skill 调用 marker
 * @param {string} tmpDir - 临时项目目录
 * @param {string} skillName - Skill 名
 */
function markSkillInvoked(tmpDir, skillName) {
  const invDir = path.join(tmpDir, '.claude', 'logs', 'skill-invocations');
  fs.mkdirSync(invDir, { recursive: true });
  const timestamp = Date.now();
  fs.writeFileSync(
    path.join(invDir, `${skillName}-${timestamp}.json`),
    JSON.stringify({ skill: skillName, timestamp })
  );
}

/**
 * 创建 team marker
 * @param {string} tmpDir - 临时项目目录
 */
function markTeamCreated(tmpDir) {
  const logsDir = path.join(tmpDir, '.claude', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(path.join(logsDir, 'team-created.marker'), JSON.stringify({ created: true }));
}

/**
 * 创建 active-role marker
 * @param {string} tmpDir - 临时项目目录
 * @param {string} role - 角色名
 * @param {string[]} [allowedPaths] - 允许的路径
 */
function setActiveRole(tmpDir, role, allowedPaths = []) {
  const logsDir = path.join(tmpDir, '.claude', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(
    path.join(logsDir, 'active-role.json'),
    JSON.stringify({ role, allowedPaths, timestamp: Date.now() })
  );
}

/**
 * 创建 milestone-done marker
 * @param {string} tmpDir - 临时项目目录
 * @param {string} milestoneId - 里程碑 ID（如 "M1"）
 */
function markMilestoneDone(tmpDir, milestoneId) {
  const logsDir = path.join(tmpDir, '.claude', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(
    path.join(logsDir, `milestone-${milestoneId}-done.marker`),
    JSON.stringify({ id: milestoneId, completedAt: new Date().toISOString() })
  );
}

module.exports = {
  PROJECT_ROOT,
  createMockInput,
  runHook,
  createTempProject,
  cleanupTemp,
  createMarker,
  assertBlocked,
  assertAllowed,
  setPhase,
  markSkillInvoked,
  markTeamCreated,
  setActiveRole,
  markMilestoneDone,
};
