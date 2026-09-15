import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('environment contract documents server-only multi-provider configuration', async () => {
  const contract = await readFile(new URL('../../../docs/20_PROVIDER_ENVIRONMENT_CONTRACT.md', import.meta.url), 'utf8');
  assert.match(contract, /ALCHEMY_ETHEREUM_RPC_URL/);
  assert.match(contract, /CIRCLE_LIVE_CAPABILITY_VERIFIED/);
  assert.match(contract, /STRIPE_WEBHOOK_SECRET/);
  assert.match(contract, /Never expose privileged provider values/);
});
