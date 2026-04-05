#!/usr/bin/env node
/**
 * Safety Guard - 安全边界守护脚本
 *
 * 功能：检查操作是否在项目目录内，防止操作项目外的文件
 */

const fs = require('fs');
const path = require('path');

// 获取项目根目录
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

// 受保护的路径（禁止访问）
const PROTECTED_PATHS = [
  path.join(process.env.HOME, '.ssh'),
  path.join(process.env.HOME, '.gnupg'),
  path.join(process.env.HOME, '.config'),
  '/etc',
  '/System',
  '/usr',
  '/bin',
  '/sbin'
];

// 危险命令模式
const DANGEROUS_PATTERNS = [
  /^rm\s+-rf\s+\//,           // rm -rf /
  /^rm\s+-rf\s+~/,            // rm -rf ~
  /^sudo\s+/,                 // sudo
  /^su\s+/,                   // su
  /^chmod\s+777/,             // chmod 777
  /^chown\s+/,                // chown
  /^dd\s+/,                   // dd
  /^format\s+/,               // format
  /^fdisk\s+/,                // fdisk
  /^mkfs\s+/                  // mkfs
];

/**
 * 检查路径是否在项目目录内
 */
function isWithinProject(targetPath) {
  const resolved = path.resolve(targetPath);
  const projectRoot = path.resolve(PROJECT_ROOT);
  return resolved.startsWith(projectRoot);
}

/**
 * 检查路径是否受保护
 */
function isProtectedPath(targetPath) {
  const resolved = path.resolve(targetPath);
  return PROTECTED_PATHS.some(protected =>
    resolved.startsWith(protected)
  );
}

/**
 * 检查命令是否危险
 */
function isDangerousCommand(command) {
  return DANGEROUS_PATTERNS.some(pattern =>
    pattern.test(command)
  );
}

/**
 * 主检查函数
 */
function safetyCheck() {
  // 获取工具调用信息（从环境变量或标准输入）
  const toolName = process.env.TOOL_NAME || '';
  const toolInput = process.env.TOOL_INPUT || '';
  const filePath = process.env.FILE_PATH || '';

  // 检查文件路径
  if (filePath) {
    // 检查是否在项目目录外
    if (!isWithinProject(filePath)) {
      console.error(`[SAFETY GUARD] 🚫 BLOCKED: Operation outside project directory`);
      console.error(`  Project: ${PROJECT_ROOT}`);
      console.error(`  Target: ${filePath}`);
      console.error(`  Action: Requires user confirmation`);
      process.exit(1);
    }

    // 检查是否是受保护路径
    if (isProtectedPath(filePath)) {
      console.error(`[SAFETY GUARD] 🚫 BLOCKED: Protected path access denied`);
      console.error(`  Target: ${filePath}`);
      process.exit(1);
    }
  }

  // 检查 Bash 命令
  if (toolName === 'Bash' && toolInput) {
    if (isDangerousCommand(toolInput)) {
      console.error(`[SAFETY GUARD] 🚫 BLOCKED: Dangerous command detected`);
      console.error(`  Command: ${toolInput}`);
      process.exit(1);
    }
  }

  // 通过检查
  console.log(`[SAFETY GUARD] ✅ ALLOWED: Operation within safe boundaries`);
  process.exit(0);
}

// 执行检查
safetyCheck();
