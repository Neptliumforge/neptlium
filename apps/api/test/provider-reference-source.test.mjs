import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider reference preserves concise responsibility boundaries', async () => {
  const reference = await readFile(new URL('../../../docs/71_PROVIDER_REFERENCE.md', import.meta.url), 'utf8');
  assert.match(reference, /Circle \| Stablecoin\/digital-money/);
  assert.match(reference, /Alchemy \| Multi-chain blockchain/);
  assert.match(reference, /Stripe \| Fiat\/card\/bank-payment/);
});
