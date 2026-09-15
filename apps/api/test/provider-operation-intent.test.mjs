import assert from 'node:assert/strict';
import test from 'node:test';

import { validateProviderOperationIntent } from '../dist/provider-operation-intent.js';

const valid = { intentId: 'intent_1', principalId: 'principal_1', ownerId: 'owner_1', provider: 'circle', operation: 'stablecoin_withdrawal', environment: 'production', assetOrCurrency: 'USDC', idempotencyKey: 'idem_1', authorized: true };

test('authorized Neptlium-owned provider intent passes boundary validation', () => {
  assert.doesNotThrow(() => validateProviderOperationIntent(valid));
});

test('provider intent fails closed without authorization or idempotency', () => {
  assert.throws(() => validateProviderOperationIntent({ ...valid, authorized: false }));
  assert.throws(() => validateProviderOperationIntent({ ...valid, idempotencyKey: '' }));
});

test('provider intent rejects cross-provider operation leakage', () => {
  assert.throws(() => validateProviderOperationIntent({ ...valid, provider: 'alchemy' }));
});
