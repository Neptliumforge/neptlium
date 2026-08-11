import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../dist/config.js';
import { handleFinancialRoute } from '../dist/financial-routes.js';
import { MemoryFinancialRepository } from '../dist/financial-repository.js';

const config = loadConfig({ NODE_ENV: 'test' });
const ownerA = '00000000-0000-4000-8000-000000000001';
const ownerB = '00000000-0000-4000-8000-000000000002';
const ownerId = async () => ownerA;
const enabledUsd = () => ({ code: 'USD_ACH', asset: 'USD', network: 'ACH', state: 'ENABLED' });
const enabledUsdc = () => ({ code: 'USDC_BASE', asset: 'USDC', network: 'BASE', state: 'ENABLED' });
const context = (method, path, body, key = 'idem-key-0001', query = '') => ({
  method,
  path,
  query: new URLSearchParams(query),
  headers: { 'idempotency-key': key },
  body,
  rawBody: Buffer.alloc(0),
});

test('live capabilities fail closed by default and XRP is explicit but unavailable', async () => {
  const repo = new MemoryFinancialRepository();
  const response = await handleFinancialRoute(context('GET', '/v1/funding/capabilities'), { config, repository: repo, ownerId });
  assert.equal(response.data.custody_model, 'OMNIBUS');
  for (const code of ['USD_ACH', 'USDC_BASE', 'ETH_BASE', 'BTC_BITCOIN', 'XRP_XRPL']) {
    const capability = response.data.capabilities.find((item) => item.code === code);
    assert.ok(capability);
    assert.notEqual(capability.state, 'ENABLED');
  }
});

test('duplicate funding request is idempotent and conflicting replay is rejected', async () => {
  const repo = new MemoryFinancialRepository();
  const deps = { config, repository: repo, ownerId, capabilityResolver: enabledUsd };
  const first = await handleFinancialRoute(context('POST', '/v1/funding/intents', { capability: 'USD_ACH', amount_atomic: '1000' }), deps);
  const second = await handleFinancialRoute(context('POST', '/v1/funding/intents', { capability: 'USD_ACH', amount_atomic: '1000' }), deps);
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal(first.data.id, second.data.id);
  assert.equal(second.data.replayed, true);
  await assert.rejects(
    () => handleFinancialRoute(context('POST', '/v1/funding/intents', { capability: 'USD_ACH', amount_atomic: '2000' }), deps),
    (error) => error.code === 'idempotency_conflict',
  );
});

test('customer balance response is owner-scoped canonical ledger state, never aggregate provider balance', async () => {
  const repo = new MemoryFinancialRepository();
  repo.balancesByOwner.set(ownerA, [{ asset: 'BTC', network: 'BITCOIN', totalAtomic: '200000000', availableAtomic: '200000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' }]);
  repo.balancesByOwner.set(ownerB, [{ asset: 'BTC', network: 'BITCOIN', totalAtomic: '500000000', availableAtomic: '500000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' }]);
  const response = await handleFinancialRoute(context('GET', '/v1/capital-account/balances'), { config, repository: repo, ownerId });
  assert.equal(response.data.source, 'NEPTLIUM_CANONICAL_LEDGER');
  assert.equal(response.data.balances.length, 1);
  assert.equal(response.data.balances[0].available_atomic, '200000000');
  assert.notEqual(response.data.balances[0].available_atomic, '700000000');
  assert.equal(JSON.stringify(response.data).includes('provider'), false);
});

test('deposit instructions require the exact owner funding intent and its governed route', async () => {
  const repo = new MemoryFinancialRepository();
  const createdA = await repo.createFundingIntent({ ownerId: ownerA, asset: 'USDC', network: 'BASE', rail: 'USDC_BASE', amountAtomic: '1000000', environment: 'LIVE', idempotencyKey: 'route-a-0001', requestDigest: 'digest-a' });
  const createdB = await repo.createFundingIntent({ ownerId: ownerB, asset: 'USDC', network: 'BASE', rail: 'USDC_BASE', amountAtomic: '1000000', environment: 'LIVE', idempotencyKey: 'route-b-0001', requestDigest: 'digest-b' });
  repo.depositRoutes.set(createdA.value.id, {
    id: 'route-a', ownerId: ownerA, fundingIntentId: createdA.value.id, asset: 'USDC', network: 'BASE',
    depositAddress: '0xroutea', memoOrTag: null, provider: 'circle', status: 'active', createdAt: new Date().toISOString(),
  });
  repo.depositRoutes.set(createdB.value.id, {
    id: 'route-b', ownerId: ownerB, fundingIntentId: createdB.value.id, asset: 'USDC', network: 'BASE',
    depositAddress: '0xrouteb', memoOrTag: null, provider: 'circle', status: 'active', createdAt: new Date().toISOString(),
  });
  const response = await handleFinancialRoute(
    context('GET', '/v1/capital-account/deposit-instructions', undefined, 'idem-key-0001', `funding_intent_id=${createdA.value.id}`),
    { config, repository: repo, ownerId, capabilityResolver: enabledUsdc },
  );
  assert.equal(response.data.deposit_address, '0xroutea');
  assert.equal('treasury_destination_id' in response.data, false);

  await assert.rejects(
    () => handleFinancialRoute(
      context('GET', '/v1/capital-account/deposit-instructions', undefined, 'idem-key-0001', `funding_intent_id=${createdB.value.id}`),
      { config, repository: repo, ownerId, capabilityResolver: enabledUsdc },
    ),
    (error) => error.code === 'not_found',
  );
});

test('XRP route can carry a memo/tag without exposing treasury identity', async () => {
  const repo = new MemoryFinancialRepository();
  const created = await repo.createFundingIntent({ ownerId: ownerA, asset: 'XRP', network: 'XRPL', rail: 'XRP_XRPL', amountAtomic: '900000000', environment: 'LIVE', idempotencyKey: 'xrp-route-001', requestDigest: 'digest-xrp' });
  repo.depositRoutes.set(created.value.id, {
    id: 'route-xrp', ownerId: ownerA, fundingIntentId: created.value.id, asset: 'XRP', network: 'XRPL',
    depositAddress: 'rNeptliumTreasury', memoOrTag: '271828', provider: 'circle', status: 'active', createdAt: new Date().toISOString(),
  });
  const response = await handleFinancialRoute(
    context('GET', '/v1/capital-account/deposit-instructions', undefined, 'idem-key-0001', `funding_intent_id=${created.value.id}`),
    { config, repository: repo, ownerId, capabilityResolver: () => ({ code: 'XRP_XRPL', asset: 'XRP', network: 'XRPL', state: 'ENABLED' }) },
  );
  assert.equal(response.data.deposit_address, 'rNeptliumTreasury');
  assert.equal(response.data.memo_or_tag, '271828');
});

test('alias response does not expose underlying destination reference', async () => {
  const repo = new MemoryFinancialRepository();
  const response = await handleFinancialRoute(
    context('POST', '/v1/treasury/aliases', { alias: 'primary-usd', destination_type: 'stripe_payment_method', destination_reference: 'pm_sensitive_reference' }),
    { config, repository: repo, ownerId },
  );
  assert.equal(response.status, 201);
  assert.equal('destination_reference' in response.data, false);
  assert.equal(response.data.verification_state, 'unverified');
  assert.equal(response.data.activation_state, 'inactive');
});

test('transfer creation is server-gated and cannot be enabled by request payload', async () => {
  const repo = new MemoryFinancialRepository();
  await assert.rejects(
    () => handleFinancialRoute(
      context('POST', '/v1/treasury/transfers', { capability: 'USD_ACH', alias_id: 'alias', amount_atomic: '100', outbound_execution_verified: true }),
      { config, repository: repo, ownerId, capabilityResolver: enabledUsd },
    ),
    (error) => error.code === 'live_execution_disabled',
  );
});

test('verified active alias is required before a transfer request can be persisted', async () => {
  const repo = new MemoryFinancialRepository();
  const alias = await repo.createAlias({ ownerId: await ownerId(), alias: 'dest-one', destinationType: 'wallet', destinationReference: '0xabc123' });
  await assert.rejects(
    () => handleFinancialRoute(
      context('POST', '/v1/treasury/transfers', { capability: 'USD_ACH', alias_id: alias.id, amount_atomic: '100' }),
      { config, repository: repo, ownerId, capabilityResolver: enabledUsd, transferRequestEnabled: true },
    ),
    (error) => error.code === 'destination_not_verified',
  );
  const stored = repo.aliases.get(alias.id);
  stored.verificationState = 'verified';
  stored.activationState = 'active';
  const created = await handleFinancialRoute(
    context('POST', '/v1/treasury/transfers', { capability: 'USD_ACH', alias_id: alias.id, amount_atomic: '100' }),
    { config, repository: repo, ownerId, capabilityResolver: enabledUsd, transferRequestEnabled: true },
  );
  const replay = await handleFinancialRoute(
    context('POST', '/v1/treasury/transfers', { capability: 'USD_ACH', alias_id: alias.id, amount_atomic: '100' }),
    { config, repository: repo, ownerId, capabilityResolver: enabledUsd, transferRequestEnabled: true },
  );
  assert.equal(created.status, 202);
  assert.equal(replay.status, 200);
  assert.equal(created.data.id, replay.data.id);
});
