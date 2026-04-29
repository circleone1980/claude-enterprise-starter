const { test, describe } = require('node:test');
const assert = require('node:assert');
const { loadJSON } = require('../helpers/config-loader');

const gates = loadJSON('automation/phase-gates.json');

describe('phase-controller.js - gate configuration', () => {
  test('phase-gates.json is valid JSON with gates key', () => {
    assert.ok(gates.gates, 'Missing gates key');
    assert.strictEqual(typeof gates.gates, 'object');
  });

  test('phase-gates.json has enabled flag', () => {
    assert.strictEqual(gates.enabled, true);
  });

  test('each gate has conditions array', () => {
    for (const [key, gate] of Object.entries(gates.gates)) {
      assert.ok(Array.isArray(gate.conditions), `Gate ${key} missing conditions array`);
      assert.ok(gate.conditions.length > 0, `Gate ${key} has empty conditions`);
    }
  });

  test('each condition has description and check command', () => {
    for (const [key, gate] of Object.entries(gates.gates)) {
      for (const cond of gate.conditions) {
        assert.ok(cond.description, `Gate ${key} condition missing description`);
        assert.ok(cond.check, `Gate ${key} condition missing check command`);
      }
    }
  });

  test('check commands are valid executable syntax', () => {
    for (const [key, gate] of Object.entries(gates.gates)) {
      for (const cond of gate.conditions) {
        const valid = cond.check.startsWith('node ') || cond.check.startsWith('bash') || cond.check.startsWith('test');
        assert.ok(
          valid,
          `Gate ${key} condition has unexpected check syntax: ${cond.check.substring(0, 60)}`
        );
      }
    }
  });
});
