import assert from 'node:assert/strict';
import test from 'node:test';
import {
  executionFoundationCapabilities,
  executionFoundationMode,
  executionProviderId,
  hasExecutionCapability,
} from '../dist/execution/index.js';

const provider = executionProviderId('future-venue');
const otherProvider = executionProviderId('other-venue');

test('execution foundation fails closed for every operation', () => {
  const capabilities = executionFoundationCapabilities(provider, 'TEST');
  assert.equal(executionFoundationMode, 'DOMAIN_ONLY');
  assert.ok(capabilities.length > 0);
  assert.ok(capabilities.every((capability) => capability.state === 'UNAVAILABLE'));
  assert.ok(capabilities.every((capability) => capability.certified === false));
});

test('provider identity alone enables no execution capability', () => {
  const capabilities = executionFoundationCapabilities(provider, 'TEST');
  assert.equal(hasExecutionCapability(capabilities, provider, 'SUBMIT_ORDER', 'TEST', null), false);
  assert.equal(hasExecutionCapability(capabilities, provider, 'CANCEL_ORDER', 'TEST', null), false);
  assert.equal(hasExecutionCapability(capabilities, provider, 'MODIFY_ORDER', 'TEST', null), false);
});

test('read capability does not imply write capability', () => {
  const capabilities = [{
    provider,
    environment: 'TEST',
    operation: 'MARKET_OBSERVATION',
    product: null,
    state: 'AVAILABLE',
    certified: true,
    reason: 'fixture',
  }];

  assert.equal(hasExecutionCapability(capabilities, provider, 'MARKET_OBSERVATION', 'TEST', null), true);
  assert.equal(hasExecutionCapability(capabilities, provider, 'SUBMIT_ORDER', 'TEST', null), false);
});

test('capability matching is provider and product scoped', () => {
  const capabilities = [{
    provider,
    environment: 'TEST',
    operation: 'MARKET_OBSERVATION',
    product: 'SPOT',
    state: 'AVAILABLE',
    certified: true,
    reason: 'fixture',
  }];

  assert.equal(hasExecutionCapability(capabilities, provider, 'MARKET_OBSERVATION', 'TEST', 'SPOT'), true);
  assert.equal(hasExecutionCapability(capabilities, otherProvider, 'MARKET_OBSERVATION', 'TEST', 'SPOT'), false);
  assert.equal(hasExecutionCapability(capabilities, provider, 'MARKET_OBSERVATION', 'TEST', 'PERPETUAL'), false);
  assert.equal(hasExecutionCapability(capabilities, provider, 'MARKET_OBSERVATION', 'TEST', null), false);
});

test('foundation blocks execution operations even if a caller constructs an available capability', () => {
  const capabilities = [{
    provider,
    environment: 'TEST',
    operation: 'SUBMIT_ORDER',
    product: null,
    state: 'AVAILABLE',
    certified: true,
    reason: 'fixture',
  }];

  assert.equal(hasExecutionCapability(capabilities, provider, 'SUBMIT_ORDER', 'TEST', null), false);
});

test('test read capability never implies live capability', () => {
  const capabilities = [{
    provider,
    environment: 'TEST',
    operation: 'MARKET_OBSERVATION',
    product: null,
    state: 'AVAILABLE',
    certified: true,
    reason: 'fixture',
  }];

  assert.equal(hasExecutionCapability(capabilities, provider, 'MARKET_OBSERVATION', 'TEST', null), true);
  assert.equal(hasExecutionCapability(capabilities, provider, 'MARKET_OBSERVATION', 'LIVE', null), false);
});

test('foundation cannot expose live execution', () => {
  const capabilities = [{
    provider,
    environment: 'LIVE',
    operation: 'SUBMIT_ORDER',
    product: null,
    state: 'AVAILABLE',
    certified: true,
    reason: 'fixture',
  }];

  assert.equal(hasExecutionCapability(capabilities, provider, 'SUBMIT_ORDER', 'LIVE', null), false);
  assert.equal(hasExecutionCapability(capabilities, provider, 'CANCEL_ORDER', 'LIVE', null), false);
  assert.equal(hasExecutionCapability(capabilities, provider, 'MODIFY_ORDER', 'LIVE', null), false);
});
