import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('product boundaries keep provider authority behind API and Platform Core', async () => {
  const boundaries = await readFile(new URL('../../../docs/26_PROVIDER_PRODUCT_BOUNDARIES.md', import.meta.url), 'utf8');
  assert.match(boundaries, /Pay is the money-movement product\/infrastructure surface/);
  assert.match(boundaries, /Pay.*not the canonical ledger/s);
  assert.match(boundaries, /API is the privileged provider boundary/);
  assert.match(boundaries, /Developers integrate with Neptlium contracts rather than provider-native secrets/);
});
