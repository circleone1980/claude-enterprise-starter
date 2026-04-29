#!/usr/bin/env node

/**
 * GStack Toggle - Enable/Disable GStack Phase 0.5
 *
 * Usage:
 *   node scripts/gstack-toggle.js --enable    # Enable GStack
 *   node scripts/gstack-toggle.js --disable   # Disable GStack
 *   node scripts/gstack-toggle.js --status    # Show current status
 */

const fs = require('fs');
const path = require('path');

const ORCHESTRATION_PATH = path.join(__dirname, '..', 'automation', 'agent-orchestration.json');
const FEATURE_GATES_PATH = path.join(__dirname, '..', 'automation', 'feature-gates.json');

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${filePath}: ${e.message}`);
    process.exit(1);
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function showStatus() {
  const orch = readJSON(ORCHESTRATION_PATH);
  const gates = readJSON(FEATURE_GATES_PATH);

  const enabled = orch.gstackConfig && orch.gstackConfig.enabled;
  const gateEnabled = gates.gstack && gates.gstack.enabled;

  console.log('\n=== GStack Status ===');
  console.log(`agent-orchestration.json: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`feature-gates.json:       ${gateEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Consistent:               ${enabled === gateEnabled ? 'YES' : 'NO (mismatch!)'}`);

  if (enabled) {
    console.log('\nPhase 0.5 Pipeline:');
    console.log('  0.5a Think: Product-Designer (office-hours → design-consultation → design-shotgun → design-html)');
    console.log('  0.5b Plan:  Design-Reviewer (autoplan → CEO → Design → Eng → DX review)');
    console.log('  Bridge:    gstack-bridge → Phase 1 PRD');
  }
  console.log('');
}

function setEnabled(value) {
  // Update agent-orchestration.json
  const orch = readJSON(ORCHESTRATION_PATH);
  if (!orch.gstackConfig) {
    orch.gstackConfig = {
      enabled: false,
      version: '0.4.1',
      phasePrefix: '0.5',
      threshold: 7.0,
      requiredOutputs: [
        'workspace/docs/design/DESIGN.md',
        'workspace/docs/design/IMPLEMENTATION_PLAN.md'
      ],
      bridgeSkill: 'gstack-bridge'
    };
  }
  orch.gstackConfig.enabled = value;
  writeJSON(ORCHESTRATION_PATH, orch);

  // Update feature-gates.json
  const gates = readJSON(FEATURE_GATES_PATH);
  if (!gates.gstack) {
    gates.gstack = {
      enabled: false,
      description: 'GStack 产品设计层 (Phase 0.5)',
      toggleScript: 'scripts/gstack-toggle.js',
      requiredOutputs: {
        'phase0.5a': ['workspace/docs/design/DESIGN.md', 'workspace/docs/design/OFFICE_HOURS.md'],
        'phase0.5b': ['workspace/docs/design/IMPLEMENTATION_PLAN.md']
      }
    };
  }
  gates.gstack.enabled = value;
  writeJSON(FEATURE_GATES_PATH, gates);

  console.log(`\nGStack ${value ? 'ENABLED' : 'DISABLED'} successfully.`);
  if (value) {
    console.log('\nNext steps:');
    console.log('  1. Start Claude Code from repo root');
    console.log('  2. Say: "启用狂暴模式，Phase 0.5 开始"');
    console.log('  3. Or manually: /office-hours 我要做一个...');
  } else {
    console.log('\nPhase 0.5 will be skipped. Phase 0 → Phase 1 direct (v2.5.0 behavior).');
  }
  console.log('');
}

// Main
const arg = process.argv[2];
if (arg === '--enable') {
  setEnabled(true);
} else if (arg === '--disable') {
  setEnabled(false);
} else if (arg === '--status') {
  showStatus();
} else {
  console.log('Usage: node scripts/gstack-toggle.js [--enable|--disable|--status]');
  process.exit(1);
}
