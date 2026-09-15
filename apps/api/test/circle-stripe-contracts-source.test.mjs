import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Circle and Stripe contracts preserve Neptlium financial authority', async () => {
  const circle = await readFile(new URL('../../../docs/32_CIRCLE_SETTLEMENT_CONTRACT.md', import.meta.url), 'utf8');
  const stripe = await readFile(new URL('../../../docs/33_STRIPE_PAYMENT_CONTRACT.md', import.meta.url), 'utf8');
  assert.match(circle, /Circle does not own Neptlium.*canonical ledger or reconciliation/s);
  assert.match(circle, /Wallet provisioning, stablecoin deposits and stablecoin withdrawals are separate capabilities/);
  assert.match(stripe, /does not establish live customer capital funding/);
  assert.match(stripe, /Stripe does not own Neptlium.*canonical ledger or reconciliation/s);
});
