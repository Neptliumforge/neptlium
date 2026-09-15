import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider north star preserves Neptlium domain ownership under replacement', async () => {
  const northStar = await readFile(new URL('../../../docs/49_PROVIDER_NORTH_STAR.md', import.meta.url), 'utf8');
  assert.match(northStar, /add, replace, degrade or remove an external provider without changing who owns.*financial authorization.*canonical balances.*reconciliation truth/s);
  assert.match(northStar, /durable platform advantage is the Neptlium control plane/);
});
