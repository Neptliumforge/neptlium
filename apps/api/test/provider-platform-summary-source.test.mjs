import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('platform summary states the canonical provider doctrine', async () => {
  const summary = await readFile(new URL('../../../docs/45_PROVIDER_PLATFORM_SUMMARY.md', import.meta.url), 'utf8');
  assert.match(summary, /Circle:.*stablecoin/s);
  assert.match(summary, /Alchemy:.*multi-chain/s);
  assert.match(summary, /Stripe:.*fiat/s);
  assert.match(summary, /providers supply capabilities and evidence; Neptlium owns financial authority and truth/);
});
