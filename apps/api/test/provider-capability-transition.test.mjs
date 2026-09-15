import assert from 'node:assert/strict';
import test from 'node:test';

import { canTransitionProviderCapability, requireProviderCapabilityTransition } from '../dist/provider-capability-transition.js';

test('capability certification advances through explicit stages', () => {
  assert.equal(canTransitionProviderCapability('configured', 'connectivity_verified'), true);
  assert.equal(canTransitionProviderCapability('connectivity_verified', 'capability_certified'), true);
  assert.equal(canTransitionProviderCapability('configured', 'capability_certified'), false);
  assert.throws(() => requireProviderCapabilityTransition('configured', 'capability_certified'));
});
