import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../dist/config.js';
import { alchemyObservation, verifyAlchemyWebhook } from '../dist/alchemy-observation.js';
import { CircleCapitalProvider } from '../dist/circle.js';
import { StripeTreasuryAdapter } from '../dist/stripe-treasury.js';
import { liveFundingCapabilities } from '../dist/financial-routes.js';

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

test('product economic gates fail closed independently from provider configuration', () => {
  assert.throws(
    () => loadConfig({
      NODE_ENV: 'test',
      ENABLE_CRYPTO_DEPOSITS: 'true',
    }),
    /ENABLE_MAINNET/,
  );

  assert.throws(
    () => loadConfig({
      NODE_ENV: 'test',
      ENABLE_MAINNET: 'true',
      ENABLE_CRYPTO_DEPOSITS: 'true',
    }),
    /Circle and Alchemy/,
  );

  assert.throws(
    () => loadConfig({
      NODE_ENV: 'test',
      ENABLE_MAINNET: 'true',
      ENABLE_FIAT_DEPOSITS: 'true',
    }),
    /Stripe Treasury/,
  );

  const shadow = loadConfig({
    NODE_ENV: 'test',
    ENABLE_MAINNET: 'true',
    CIRCLE_ENVIRONMENT: 'production',
    CIRCLE_API_KEY: 'key',
    CIRCLE_ENTITY_SECRET: 'secret',
    ALCHEMY_ENVIRONMENT: 'production',
    ALCHEMY_API_KEY: 'key',
    ALCHEMY_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key',
  });

  assert.equal(shadow.ENABLE_CRYPTO_DEPOSITS, false);
  assert.equal(shadow.ENABLE_CRYPTO_WITHDRAWALS, false);
  assert.equal(shadow.ENABLE_FIAT_DEPOSITS, false);
  assert.equal(shadow.ENABLE_FIAT_WITHDRAWALS, false);
  assert.equal(shadow.ENABLE_WALLET_PROVISIONING, false);
  assert.equal(shadow.ENABLE_CONVERSIONS, false);
});


test('customer funding capability surface is subordinate to product economic gates', () => {
  const providerReadyShadow = loadConfig({
    NODE_ENV: 'test',
    ENABLE_MAINNET: 'true',

    CIRCLE_ENVIRONMENT: 'production',
    CIRCLE_API_KEY: 'circle-key',
    CIRCLE_ENTITY_SECRET: 'circle-secret',
    CIRCLE_LIVE_CAPABILITY_VERIFIED: 'true',

    ALCHEMY_ENVIRONMENT: 'production',
    ALCHEMY_API_KEY: 'alchemy-key',
    ALCHEMY_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_PRODUCTION_CAPABILITY_VERIFIED: 'true',

    STRIPE_SECRET_KEY: 'sk_live_x',
    STRIPE_WEBHOOK_SECRET: 'whsec_x',
    STRIPE_TREASURY_FINANCIAL_ACCOUNT_ID: 'fa_x',
    STRIPE_TREASURY_ELIGIBILITY_VERIFIED: 'true',
    STRIPE_TREASURY_LIVE_EXECUTION_ENABLED: 'true',

    ENABLE_CRYPTO_DEPOSITS: 'false',
    ENABLE_FIAT_DEPOSITS: 'false',
  });

  const shadowCapabilities = liveFundingCapabilities(providerReadyShadow);

  const shadowUsd = shadowCapabilities.find((item) => item.code === 'USD_ACH');
  const shadowUsdc = shadowCapabilities.find((item) => item.code === 'USDC_BASE');

  assert.equal(shadowUsd?.state, 'DISABLED');
  assert.equal(shadowUsd?.reason, 'fiat_deposits_gate_closed');
  assert.equal(shadowUsdc?.state, 'DISABLED');
  assert.equal(shadowUsdc?.reason, 'crypto_deposits_gate_closed');

  const fiatOpen = loadConfig({
    NODE_ENV: 'test',
    ENABLE_MAINNET: 'true',

    STRIPE_SECRET_KEY: 'sk_live_x',
    STRIPE_WEBHOOK_SECRET: 'whsec_x',
    STRIPE_TREASURY_FINANCIAL_ACCOUNT_ID: 'fa_x',
    STRIPE_TREASURY_ELIGIBILITY_VERIFIED: 'true',
    STRIPE_TREASURY_LIVE_EXECUTION_ENABLED: 'true',

    ENABLE_FIAT_DEPOSITS: 'true',
  });

  assert.equal(
    liveFundingCapabilities(fiatOpen).find((item) => item.code === 'USD_ACH')?.state,
    'ENABLED',
  );

  const cryptoOpen = loadConfig({
    NODE_ENV: 'test',
    ENABLE_MAINNET: 'true',

    CIRCLE_ENVIRONMENT: 'production',
    CIRCLE_API_KEY: 'circle-key',
    CIRCLE_ENTITY_SECRET: 'circle-secret',
    CIRCLE_LIVE_CAPABILITY_VERIFIED: 'true',

    ALCHEMY_ENVIRONMENT: 'production',
    ALCHEMY_API_KEY: 'alchemy-key',
    ALCHEMY_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_PRODUCTION_CAPABILITY_VERIFIED: 'true',

    ENABLE_CRYPTO_DEPOSITS: 'true',
  });

  assert.equal(
    liveFundingCapabilities(cryptoOpen).find((item) => item.code === 'USDC_BASE')?.state,
    'ENABLED',
  );
});
