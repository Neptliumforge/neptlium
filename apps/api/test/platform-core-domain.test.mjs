import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalAssetKey,
  canActForOrganization,
  requireActiveMembership,
  validateBalancedLedgerPostings,
  validateCanonicalAsset,
} from '../dist/platform-core-domain.js';

const individual = { type: 'individual', id: '11111111-1111-4111-8111-111111111111' };
const organization = { type: 'organization', id: '22222222-2222-4222-8222-222222222222' };

test('canonical asset identity is deterministic and network scoped', () => {
  assert.equal(canonicalAssetKey({ symbol: 'usdc', networkIdentifier: 'BASE-MAINNET', contractAddress: '0x0000000000000000000000000000000000000001' }), 'base-mainnet:USDC:0x0000000000000000000000000000000000000001');
  assert.equal(canonicalAssetKey({ symbol: 'ETH', networkIdentifier: 'ethereum-mainnet' }), 'ethereum-mainnet:ETH:native');
});

test('canonical asset rejects invalid precision and contract addresses', () => {
  assert.throws(() => validateCanonicalAsset({ symbol: 'USDC', networkIdentifier: 'base-mainnet', contractAddress: 'not-an-address', decimals: 6, kind: 'token' }));
  assert.throws(() => validateCanonicalAsset({ symbol: 'USDC', networkIdentifier: 'base-mainnet', contractAddress: '0x0000000000000000000000000000000000000001', decimals: 100, kind: 'token' }));
});

test('token identity requires a contract while native assets forbid one', () => {
  assert.throws(() => validateCanonicalAsset({ symbol: 'USDC', networkIdentifier: 'base-mainnet', decimals: 6, kind: 'token' }), /require a contract/);
  assert.throws(() => validateCanonicalAsset({ symbol: 'ETH', networkIdentifier: 'ethereum-mainnet', contractAddress: '0x0000000000000000000000000000000000000001', decimals: 18, kind: 'native' }), /cannot have a contract/);
  assert.equal(validateCanonicalAsset({ symbol: 'ETH', networkIdentifier: 'ethereum-mainnet', decimals: 18, kind: 'native' }).assetKey, 'ethereum-mainnet:ETH:native');
});

test('organization roles separate operation from approval authority', () => {
  assert.equal(canActForOrganization('operator', 'operate'), true);
  assert.equal(canActForOrganization('operator', 'approve'), false);
  assert.equal(canActForOrganization('approver', 'approve'), true);
  assert.equal(canActForOrganization('viewer', 'operate'), false);
});

test('membership scope must be active and organization exact', () => {
  const membership = { organizationId: organization.id, userId: individual.id, role: 'approver', status: 'active' };
  assert.equal(requireActiveMembership(membership, organization.id), membership);
  assert.throws(() => requireActiveMembership({ ...membership, status: 'suspended' }, organization.id));
  assert.throws(() => requireActiveMembership(membership, '33333333-3333-4333-8333-333333333333'));
});

test('double entry must balance per canonical asset', () => {
  assert.doesNotThrow(() => validateBalancedLedgerPostings([
    { accountId: 'a', owner: individual, assetKey: 'base-mainnet:USDC:0x0000000000000000000000000000000000000001', direction: 'debit', amountAtomic: '1000000' },
    { accountId: 'b', owner: individual, assetKey: 'base-mainnet:USDC:0x0000000000000000000000000000000000000001', direction: 'credit', amountAtomic: '1000000' },
  ]));
  assert.throws(() => validateBalancedLedgerPostings([
    { accountId: 'a', owner: individual, assetKey: 'base-mainnet:USDC:0x0000000000000000000000000000000000000001', direction: 'debit', amountAtomic: '1000000' },
    { accountId: 'b', owner: individual, assetKey: 'base-mainnet:USDC:0x0000000000000000000000000000000000000001', direction: 'credit', amountAtomic: '999999' },
  ]), /unbalanced/);
});

test('a single journal cannot cross owner boundaries', () => {
  assert.throws(() => validateBalancedLedgerPostings([
    { accountId: 'a', owner: individual, assetKey: 'ethereum-mainnet:ETH:native', direction: 'debit', amountAtomic: '1' },
    { accountId: 'b', owner: organization, assetKey: 'ethereum-mainnet:ETH:native', direction: 'credit', amountAtomic: '1' },
  ]), /cross-owner/);
});
