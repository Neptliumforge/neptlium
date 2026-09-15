import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Alchemy contract is multi-chain without granting execution authority', async () => {
  const contract = await readFile(new URL('../../../docs/31_ALCHEMY_MULTICHAIN_CONTRACT.md', import.meta.url), 'utf8');
  assert.match(contract, /Ethereum \(1\).*Base \(8453\).*Arbitrum One \(42161\).*Optimism \(10\).*Polygon PoS \(137\)/s);
  assert.match(contract, /Alchemy observation certification never authorizes financial execution/);
  assert.match(contract, /legacy Base-specific `ALCHEMY_RPC_URL` production check/);
});
