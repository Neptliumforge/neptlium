import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider doctrine freeze names the three primary roles and Platform Core authority', async () => {
  const freeze = await readFile(new URL('../../../docs/63_PROVIDER_DOCTRINE_FREEZE.md', import.meta.url), 'utf8');
  assert.match(freeze, /Circle = stablecoin\/digital-money/);
  assert.match(freeze, /Alchemy = multi-chain blockchain/);
  assert.match(freeze, /Stripe = fiat\/card\/bank-payment/);
  assert.match(freeze, /Neptlium Platform Core = financial authority/);
});
