import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('executive provider contract keeps external providers subordinate', async () => {
  const contract = await readFile(new URL('../../../docs/51_PROVIDER_EXECUTIVE_CONTRACT.md', import.meta.url), 'utf8');
  assert.match(contract, /Circle is the stablecoin\/digital-money infrastructure adapter/);
  assert.match(contract, /Alchemy is the multi-chain blockchain observation\/intelligence adapter/);
  assert.match(contract, /Stripe is the fiat\/payment infrastructure adapter/);
  assert.match(contract, /Every provider is replaceable behind that control plane/);
});
