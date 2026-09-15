import assert from 'node:assert/strict';
import test from 'node:test';

import { canPassProviderGate, gatePredecessors } from '../dist/provider-release-gate.js';

test('execution authorization cannot precede capability certification', () => {
  const passed = new Set(['P0_ARCHITECTURE', 'P1_CONFIGURATION', 'P2_CONNECTIVITY', 'P3_EVIDENCE_INGRESS']);
  assert.equal(canPassProviderGate('P5_EXECUTION_AUTHORIZATION', passed), false);
  passed.add('P4_CAPABILITY_CERTIFICATION');
  assert.equal(canPassProviderGate('P5_EXECUTION_AUTHORIZATION', passed), true);
});

test('release gate predecessors are deterministic', () => {
  assert.deepEqual(gatePredecessors('P2_CONNECTIVITY'), ['P0_ARCHITECTURE', 'P1_CONFIGURATION']);
});
