import assert from 'node:assert/strict';
import test from 'node:test';
import {
  executionFoundationCapabilities,
  executionFoundationMode,
  executionProviderId,
  hasExecutionCapability,
} from '../dist/execution/index.js';

const provider = executionProviderId('future-venue');

test('execution foundation fails closed for every operation', () => {
  const capabilities = executionFoundationCapabilities(provider, 'TEST');
  assert.equal(executionFoundationMode, 'DOMAIN_ONLY');
  assert.ok(capabilities.length > 0);
  assert.ok(capabilities.every((capability) => capability.state === 'UNAVAILABLE'));
  assert.ok(capabilities.every((capability) => capability.certified === false));
});

test('provider identity alone enables no execution capability', () => {
  const capabilities = executionFoundationCapabilities(provider, 'TEST');
  assert.equal(hasExecutionCapability(capabilities, 'SUBMIT_ORDER', 'TEST'), false);
  assert.equal(hasExecutionCapability(capabilities, 'CANCEL_ORDER', 'TEST'), false);
  assert.equal(hasExecutionCapability(capabilities, 'MODIFY_ORDER', 'TEST'), false);
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

  assert.equal(hasExecutionCapability(capabilities, 'MARKET_OBSERVATION', 'TEST'), true);
  assert.equal(hasExecutionCapability(capabilities, 'SUBMIT_ORDER', 'TEST'), false);
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

  assert.equal(hasExecutionCapability(capabilities, 'SUBMIT_ORDER', 'TEST'), false);
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

  assert.equal(hasExecutionCapability(capabilities, 'MARKET_OBSERVATION', 'TEST'), true);
  assert.equal(hasExecutionCapability(capabilities, 'MARKET_OBSERVATION', 'LIVE'), false);
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

  assert.equal(hasExecutionCapability(capabilities, 'SUBMIT_ORDER', 'LIVE'), false);
  assert.equal(hasExecutionCapability(capabilities, 'CANCEL_ORDER', 'LIVE'), false);
  assert.equal(hasExecutionCapability(capabilities, 'MODIFY_ORDER', 'LIVE'), false);
});
