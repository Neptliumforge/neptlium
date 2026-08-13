import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../dist/config.js';
import { alchemyObservation, verifyAlchemyWebhook } from '../dist/alchemy-observation.js';
import { CircleCapitalProvider } from '../dist/circle.js';
import { StripeTreasuryAdapter } from '../dist/stripe-treasury.js';

test('production provider environments are accepted only with explicit mainnet permission', () => {
  assert.doesNotThrow(() => loadConfig({ NODE_ENV: 'test', ENABLE_MAINNET: 'true', CIRCLE_ENVIRONMENT: 'production', CIRCLE_API_KEY: 'key', CIRCLE_ENTITY_SECRET: 'secret' }));
  assert.throws(() => loadConfig({ NODE_ENV: 'test', CIRCLE_ENVIRONMENT: 'production', CIRCLE_API_KEY: 'key', CIRCLE_ENTITY_SECRET: 'secret' }));
  assert.doesNotThrow(() => loadConfig({ NODE_ENV: 'test', CIRCLE_ENVIRONMENT: 'testnet', CIRCLE_API_KEY: 'key', CIRCLE_ENTITY_SECRET: 'secret' }));
});

test('Circle credential pair and environment are atomic', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'test', CIRCLE_ENVIRONMENT: 'testnet', CIRCLE_API_KEY: 'key' }));
  assert.throws(() => loadConfig({ NODE_ENV: 'test', CIRCLE_ENVIRONMENT: 'testnet', CIRCLE_ENTITY_SECRET: 'secret' }));
});

test('Circle production credentials alone never authorize execution', async () => {
  const provider = new CircleCapitalProvider({}, 'production', 'wallet-set', false);
  await assert.rejects(() => provider.provisionWallet({ refId: 'x', idempotencyKey: 'abcdefgh' }), (error) => error.code === 'provider_execution_disabled');
  await assert.rejects(() => provider.createTransfer({}), (error) => error.code === 'provider_execution_disabled');
});

test('Stripe Treasury requires both eligibility and execution gate', () => {
  const base = { secretKey: 'sk_live_x', webhookSecret: 'whsec_x', financialAccountId: 'fa_x', environment: 'LIVE' };
  assert.equal(new StripeTreasuryAdapter({ ...base, eligibilityVerified: false, liveExecutionEnabled: false }).capability().usdAch, 'INELIGIBLE');
  assert.equal(new StripeTreasuryAdapter({ ...base, eligibilityVerified: true, liveExecutionEnabled: false }).capability().usdAch, 'DISABLED');
  assert.equal(new StripeTreasuryAdapter({ ...base, eligibilityVerified: true, liveExecutionEnabled: true }).capability().usdAch, 'ENABLED');
});

test('Alchemy production mapping is Base mainnet and observations remain non-canonical', () => {
  const config = loadConfig({ NODE_ENV: 'test', ENABLE_MAINNET: 'true', ALCHEMY_ENVIRONMENT: 'production', ALCHEMY_API_KEY: 'key', ALCHEMY_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key' });
  assert.equal(config.ALCHEMY_ENVIRONMENT, 'production');
  const observation = alchemyObservation('production', { balance: '123' });
  assert.equal(observation.network, 'BASE_MAINNET');
  assert.equal(observation.canonical, false);
});

test('mixed Alchemy environment/RPC configuration fails', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'test', ALCHEMY_ENVIRONMENT: 'testnet', ALCHEMY_API_KEY: 'key', ALCHEMY_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key' }));
});

test('Alchemy webhook authentication is mandatory', () => {
  assert.throws(() => verifyAlchemyWebhook({ rawBody: Buffer.from('{}'), signatureHeader: undefined, signingKey: 'secret' }));
});
