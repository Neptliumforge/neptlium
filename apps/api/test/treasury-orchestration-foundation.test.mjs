import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatTreasuryMoney, normalizeTreasuryMoney, requireTreasuryIntentTransition } from '../dist/treasury-orchestration-domain.js';
import { resolvePaymentRail } from '../dist/treasury-provider-boundaries.js';
import { evaluateTreasuryPolicy, validateApprovalAction } from '../dist/treasury-policy.js';
import { runTreasuryPreflight } from '../dist/treasury-preflight.js';

const organizationId = '22222222-2222-4222-8222-222222222222';
const actorId = '11111111-1111-4111-8111-111111111111';
const approverId = '33333333-3333-4333-8333-333333333333';
const money = { amountAtomic: '1800000', scale: 2, currencyOrAsset: 'USD' };

test('treasury money is exact and never relies on floating point', () => {
  assert.deepEqual(normalizeTreasuryMoney({ amountAtomic: '000100', scale: 2, currencyOrAsset: 'usd' }), { amountAtomic: '100', scale: 2, currencyOrAsset: 'USD' });
  assert.equal(formatTreasuryMoney({ amountAtomic: '1000000', scale: 6, currencyOrAsset: 'USDC' }), '1.000000');
  assert.throws(() => normalizeTreasuryMoney({ amountAtomic: '1.25', scale: 2, currencyOrAsset: 'USD' }), /atomic units/);
});

test('treasury intent lifecycle rejects skipped execution and reconciliation states', () => {
  assert.doesNotThrow(() => requireTreasuryIntentTransition('draft', 'preflight'));
  assert.doesNotThrow(() => requireTreasuryIntentTransition('awaiting_approval', 'approved'));
  assert.throws(() => requireTreasuryIntentTransition('draft', 'settled'), /invalid treasury intent transition/);
  assert.throws(() => requireTreasuryIntentTransition('approved', 'reconciled'), /invalid treasury intent transition/);
});

test('payment routing resolves capability but never authorizes execution', () => {
  const resolution = resolvePaymentRail({
    money,
    preferredRail: 'stripe_bank',
    allowedRails: ['stripe_bank', 'stablecoin_onchain'],
    capabilities: [
      { provider: 'stripe', capability: 'stripe_bank', state: 'available' },
      { provider: 'alchemy', capability: 'stablecoin_onchain', state: 'available' },
    ],
  });
  assert.equal(resolution.rail, 'stripe_bank');
  assert.equal(resolution.executionAuthorized, false);
});

test('policy is deterministic and segregation of duties is server-enforceable', () => {
  const decision = evaluateTreasuryPolicy({
    organizationId,
    actorId,
    creatorId: actorId,
    money,
    rail: 'stripe_bank',
    counterpartyApproved: true,
    rules: [
      { id: 'approval-threshold', enabled: true, kind: 'approval_threshold', amountLimitAtomic: '1000000', requiredRoles: ['approver'] },
      { id: 'no-self-approval', enabled: true, kind: 'segregation_of_duties', forbidSelfApproval: true },
    ],
  });
  assert.equal(decision.decision, 'requires_approval');
  assert.deepEqual(decision.requiredApprovals, ['approver']);
  assert.equal(decision.forbidSelfApproval, true);
  assert.throws(() => validateApprovalAction({ creatorId: actorId, requiredRoles: ['approver'], forbidSelfApproval: true, action: { requestId: 'r1', actorId, actorRole: 'approver', action: 'approve', occurredAt: new Date().toISOString() } }), /self-approval/);
  assert.doesNotThrow(() => validateApprovalAction({ creatorId: actorId, requiredRoles: ['approver'], forbidSelfApproval: true, action: { requestId: 'r1', actorId: approverId, actorRole: 'approver', action: 'approve', occurredAt: new Date().toISOString() } }));
});

test('preflight requires organization operation authority and still cannot authorize provider execution', () => {
  const result = runTreasuryPreflight({
    membership: { organizationId, userId: actorId, role: 'operator', status: 'active' },
    intent: {
      id: 'intent-1', organizationId, sourceAccountId: 'acct-1', type: 'payment', status: 'preflight', money,
      destination: 'supplier-1', counterpartyId: 'cp-1', paymentRail: 'stripe_bank', createdBy: actorId,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    sourceAccount: {
      id: 'acct-1', organizationId, displayName: 'Operating Treasury', accountType: 'bank_account', provider: 'bank',
      purpose: 'vendor payments', signingMode: 'not_applicable', status: 'active',
    },
    railContext: {
      money,
      preferredRail: 'stripe_bank',
      allowedRails: ['stripe_bank'],
      capabilities: [{ provider: 'stripe', capability: 'stripe_bank', state: 'available' }],
    },
    policyContext: {
      organizationId, actorId, creatorId: actorId, money, rail: 'stripe_bank', counterpartyId: 'cp-1', counterpartyApproved: true,
      rules: [{ id: 'approval-threshold', enabled: true, kind: 'approval_threshold', amountLimitAtomic: '1000000', requiredRoles: ['approver'] }],
    },
    simulation: { state: 'not_applicable', warnings: [], assetChanges: [] },
  });
  assert.equal(result.state, 'ready_for_approval');
  assert.equal(result.executionAuthorized, false);

  assert.throws(() => runTreasuryPreflight({
    membership: { organizationId, userId: actorId, role: 'viewer', status: 'active' },
    intent: {
      id: 'intent-2', organizationId, sourceAccountId: 'acct-1', type: 'payment', status: 'preflight', money,
      destination: 'supplier-1', createdBy: actorId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    sourceAccount: {
      id: 'acct-1', organizationId, displayName: 'Operating Treasury', accountType: 'bank_account', provider: 'bank',
      purpose: 'vendor payments', signingMode: 'not_applicable', status: 'active',
    },
    railContext: { money, allowedRails: ['stripe_bank'], capabilities: [{ provider: 'stripe', capability: 'stripe_bank', state: 'available' }] },
    policyContext: { organizationId, actorId, creatorId: actorId, money, rail: 'stripe_bank', counterpartyApproved: true, rules: [] },
    simulation: { state: 'not_applicable', warnings: [], assetChanges: [] },
  }), /cannot operate treasury intent/);
});

test('provider boundary keeps Zengo external and Treasury browser free of provider execution', () => {
  const providerSource = readFileSync(resolve(import.meta.dirname, '../src/treasury-provider-boundaries.ts'), 'utf8');
  const treasuryUiSource = readFileSync(resolve(import.meta.dirname, '../../treasury/app/dashboard/[[...section]]/page.tsx'), 'utf8');
  assert.match(providerSource, /signingAuthority: 'external'/);
  assert.doesNotMatch(providerSource, /seed phrase|privateKey|recovery secret|zengo.*password/i);
  assert.doesNotMatch(treasuryUiSource, /circle\.com|alchemy\.com|api\.stripe\.com|zengo\.com|service_role|private_key/i);
});
