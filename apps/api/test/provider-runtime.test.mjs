import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../dist/config.js';
import { alchemyObservation, verifyAlchemyWebhook } from '../dist/alchemy-observation.js';
import { CircleCapitalProvider } from '../dist/circle.js';
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

test('Stripe configuration is evidence-only and never creates a funding capability', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    STRIPE_SECRET_KEY: 'sk_test_x',
    STRIPE_WEBHOOK_SECRET: 'whsec_x',
  });
  assert.equal(config.stripeConfigured, true);
  assert.equal(liveFundingCapabilities(config).some((item) => item.code === 'USD_ACH'), false);
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
  assert.equal(shadow.ENABLE_WALLET_PROVISIONING, false);
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

    ENABLE_CRYPTO_DEPOSITS: 'false',
  });

  const shadowCapabilities = liveFundingCapabilities(providerReadyShadow);

  const shadowUsdc = shadowCapabilities.find((item) => item.code === 'USDC_BASE');

  assert.equal(shadowCapabilities.some((item) => item.code === 'USD_ACH'), false);
  assert.equal(shadowUsdc?.state, 'DISABLED');
  assert.equal(shadowUsdc?.reason, 'crypto_deposits_gate_closed');

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
