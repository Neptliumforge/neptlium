import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('reconciliation doctrine keeps provider evidence non-canonical', async () => {
  const doctrine = await readFile(new URL('../../../docs/21_PROVIDER_RECONCILIATION_DOCTRINE.md', import.meta.url), 'utf8');
  assert.match(doctrine, /Evidence begins non-canonical and unreconciled/);
  assert.match(doctrine, /timeout after a potentially successful submission is `ambiguous`/);
  assert.match(doctrine, /reversals or compensating entries/);
});
