#!/usr/bin/env node
/**
 * workspace-resolver.js — 工作区路径解析共享模块
 *
 * 提供 workspace/ 目录路径解析功能。
 * 当 workspace.json 不存在或 workspaceDir 为 "." 时，所有函数返回原始 PROJECT_ROOT 路径。
 * 零破坏性回退设计。
 *
 * Usage:
 *   const { resolveWorkspaceRoot, resolveDocPath, isWorkspaceMode } = require('./lib/workspace-resolver');
 *
 * Updated: 2026-04-11
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const WORKSPACE_CONFIG_PATH = path.join(PROJECT_ROOT, 'automation', 'workspace.json');

// 缓存配置，避免重复读取
let _configCache = null;

/**
 * 读取工作区配置
 * @returns {{ workspaceDir: string, docsDir: string, srcDir: string }}
 */
function getWorkspaceConfig() {
  if (_configCache) return _configCache;

  if (!fs.existsSync(WORKSPACE_CONFIG_PATH)) {
    _configCache = { workspaceDir: '.', docsDir: 'docs', srcDir: 'src' };
    return _configCache;
  }

  try {
    _configCache = JSON.parse(fs.readFileSync(WORKSPACE_CONFIG_PATH, 'utf-8'));
    return _configCache;
  } catch {
    _configCache = { workspaceDir: '.', docsDir: 'docs', srcDir: 'src' };
    return _configCache;
  }
}

/**
 * 清除配置缓存（测试用）
 */
function clearCache() {
  _configCache = null;
}

/**
 * 是否为 workspace 模式
 * @returns {boolean}
 */
function isWorkspaceMode() {
  const config = getWorkspaceConfig();
  return config.workspaceDir && config.workspaceDir !== '.';
}

/**
 * 解析 workspace 根目录的绝对路径
 * workspace 模式: PROJECT_ROOT/workspaceDir
 * 传统模式: PROJECT_ROOT
 * @returns {string} 绝对路径
 */
function resolveWorkspaceRoot() {
  const config = getWorkspaceConfig();
  if (!isWorkspaceMode()) return PROJECT_ROOT;
  return path.resolve(PROJECT_ROOT, config.workspaceDir);
}

/**
 * 解析 workspace 下的文档路径
 * @param {string} relativePath - 相对于 docs/ 的路径，如 "requirements/PRD.md"
 * @returns {string} 绝对路径
 */
function resolveDocPath(relativePath) {
  const config = getWorkspaceConfig();
  return path.join(resolveWorkspaceRoot(), config.docsDir || 'docs', relativePath);
}

/**
 * 解析 workspace 下的源代码路径
 * @param {string} relativePath - 相对于 src/ 的路径
 * @returns {string} 绝对路径
 */
function resolveSrcPath(relativePath) {
  const config = getWorkspaceConfig();
  return path.join(resolveWorkspaceRoot(), config.srcDir || 'src', relativePath);
}

/**
 * 获取模板根目录（永远在 PROJECT_ROOT）
 * @returns {string}
 */
function getTemplateRoot() {
  return PROJECT_ROOT;
}

module.exports = {
  getWorkspaceConfig,
  clearCache,
  isWorkspaceMode,
  resolveWorkspaceRoot,
  resolveDocPath,
  resolveSrcPath,
  getTemplateRoot,
  PROJECT_ROOT
};
