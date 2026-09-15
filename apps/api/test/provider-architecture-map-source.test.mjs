import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('architecture map places providers below Platform Core and reconciliation', async () => {
  const map = await readFile(new URL('../../../docs/34_PROVIDER_ARCHITECTURE_MAP.md', import.meta.url), 'utf8');
  assert.match(map, /Platform Core/);
  assert.match(map, /Circle\s+Alchemy\s+Stripe/);
  assert.match(map, /canonical ledger/);
  assert.match(map, /provider layer is subordinate to Platform Core/);
});
