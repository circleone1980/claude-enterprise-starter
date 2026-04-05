#!/usr/bin/env node
/**
 * Auto GitHub Push - 自动 GitHub 推送脚本
 *
 * 功能：自动创建仓库并推送代码
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  branch: 'main',
  commitMessageTemplate: 'auto: ${phase} - ${timestamp}',
  autoCreate: true
};

/**
 * 检查是否在 Git 仓库中
 */
function isGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查是否有远程仓库
 */
function hasRemote() {
  try {
    const output = execSync('git remote -v', { encoding: 'utf-8' });
    return output.includes('origin');
  } catch {
    return false;
  }
}

/**
 * 获取当前分支
 */
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'main';
  }
}

/**
 * 检查是否有未提交的更改
 */
function hasChanges() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf-8' });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * 获取阶段信息
 */
function getPhaseInfo() {
  try {
    const phaseFile = path.join(process.cwd(), '.claude', 'logs', 'current-phase.json');
    if (fs.existsSync(phaseFile)) {
      const content = fs.readFileSync(phaseFile, 'utf-8');
      const data = JSON.parse(content);
      return data.phase || 'development';
    }
  } catch {
    // ignore
  }
  return 'development';
}

/**
 * 执行 Git 操作
 */
function gitCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 主推送函数
 */
async function autoPush() {
  console.log('[GitHub Auto-Push] 🚀 Starting auto push process...');

  // 检查是否是 Git 仓库
  if (!isGitRepo()) {
    console.log('[GitHub Auto-Push] 📁 Initializing Git repository...');
    const initResult = gitCommand('git init');
    if (!initResult.success) {
      console.error('[GitHub Auto-Push] ❌ Failed to init git:', initResult.error);
      return false;
    }
  }

  // 检查是否有更改
  if (!hasChanges()) {
    console.log('[GitHub Auto-Push] ℹ️ No changes to commit');
    return true;
  }

  // 获取阶段信息
  const phase = getPhaseInfo();
  const timestamp = new Date().toISOString();
  const commitMessage = CONFIG.commitMessageTemplate
    .replace('${phase}', phase)
    .replace('${timestamp}', timestamp);

  // 添加所有更改
  console.log('[GitHub Auto-Push] 📦 Staging changes...');
  const addResult = gitCommand('git add -A');
  if (!addResult.success) {
    console.error('[GitHub Auto-Push] ❌ Failed to stage changes:', addResult.error);
    return false;
  }

  // 提交更改
  console.log(`[GitHub Auto-Push] 💾 Committing: "${commitMessage}"`);
  const commitResult = gitCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    console.error('[GitHub Auto-Push] ❌ Failed to commit:', commitResult.error);
    return false;
  }

  // 检查是否有远程仓库
  if (hasRemote()) {
    const branch = getCurrentBranch();
    console.log(`[GitHub Auto-Push] 🌐 Pushing to origin/${branch}...`);
    const pushResult = gitCommand(`git push origin ${branch}`);
    if (!pushResult.success) {
      console.error('[GitHub Auto-Push] ⚠️ Failed to push:', pushResult.error);
      console.log('[GitHub Auto-Push] ℹ️ Changes committed locally, will retry push later');
      return false;
    }
    console.log('[GitHub Auto-Push] ✅ Successfully pushed to GitHub');
  } else {
    console.log('[GitHub Auto-Push] ℹ️ No remote configured, changes committed locally');
    console.log('[GitHub Auto-Push] 💡 To push to GitHub, add a remote: git remote add origin <url>');
  }

  return true;
}

// 执行推送
autoPush().catch(error => {
  console.error('[GitHub Auto-Push] Fatal error:', error);
  process.exit(1);
});
