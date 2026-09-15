import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('provider architecture documents the canonical three-provider responsibility model', async () => {
  const doc = await read('../../../docs/10_PROVIDER_ARCHITECTURE.md');
  assert.match(doc, /Circle — digital money and settlement adapter/);
  assert.match(doc, /Alchemy — multi-chain observation and intelligence adapter/);
  assert.match(doc, /Stripe — fiat and payment adapter/);
  assert.match(doc, /Provider success is not financial truth/);
});

test('environment contract exposes multi-chain Alchemy target without enabling execution', async () => {
  const env = await read('../.env.example');
  for (const name of ['ALCHEMY_ETHEREUM_RPC_URL', 'ALCHEMY_BASE_RPC_URL', 'ALCHEMY_ARBITRUM_RPC_URL', 'ALCHEMY_OPTIMISM_RPC_URL', 'ALCHEMY_POLYGON_RPC_URL']) {
    assert.match(env, new RegExp(`^${name}=`, 'm'));
  }
  assert.match(env, /^ENABLE_CRYPTO_WITHDRAWALS=false$/m);
});
