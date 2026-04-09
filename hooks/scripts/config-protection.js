#!/usr/bin/env node
// config-protection.js — 阻止 Agent 修改 linter/formatter/构建配置
// 来源: ECC pre:config-protection

const filePath = process.env.FILE_PATH || process.env.TOOL_INPUT || '';

const protectedFiles = [
  /eslint\.config\.(js|ts|mjs|cjs)/,
  /\.eslintrc\.(js|json|yml|yaml|cjs)/,
  /prettier\.config\.(js|ts|mjs|cjs)/,
  /\.prettierrc(\.(js|json|yml|yaml))?$/,
  /tsconfig(\..*)?\.json$/,
  /biome\.json$/,
  /babel\.config\.(js|ts|json|mjs|cjs)/,
  /vite\.config\.(js|ts|mjs)/,
  /next\.config\.(js|ts|mjs)/,
  /vitest\.config\.(js|ts)/,
  /jest\.config\.(js|ts|json)/,
  /\.editorconfig$/,
  /pnpm-workspace\.yaml$/,
  /package\.json$/,  // protect package.json from unauthorized changes
];

const normalizedPath = filePath.replace(/\\/g, '/');

for (const pattern of protectedFiles) {
  if (pattern.test(normalizedPath)) {
    console.error(`[PROTECTED] 不允许修改配置文件: ${filePath}`);
    console.error('原因: 配置文件变更需要通过 ADR（Architecture Decision Record）流程审批');
    console.error('如需修改，请先创建 ADR 文档: docs/superpowers/decisions/');
    process.exit(2);
  }
}

process.exit(0);
