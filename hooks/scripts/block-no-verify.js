#!/usr/bin/env node
// block-no-verify.js — 阻止 git push --no-verify 等跳过 hooks 的操作
// 来源: ECC pre:bash:block-no-verify

const toolInput = process.env.TOOL_INPUT || '';

const blockedPatterns = [
  /git\s+push.*--no-verify/,
  /git\s+push.*--no-verify-sign/,
  /git\s+push.*-f\s+--no-verify/,
  /git\s+commit.*--no-verify/,
  /git\s+commit.*--no-gpg-sign/,
  /git\s+commit.*-n\s+/,
  /git\s+push\s+--force/,
  /git\s+push\s+-f\s/,
];

for (const pattern of blockedPatterns) {
  if (pattern.test(toolInput)) {
    console.error(`[BLOCKED] 不允许跳过 Git hooks: ${toolInput}`);
    console.error('原因: --no-verify / --force 等标志会跳过关键的质量检查和安全验证');
    console.error('如需强制推送，请先与团队确认并获得授权');
    process.exit(2); // exit code 2 = block the tool call
  }
}

process.exit(0);
