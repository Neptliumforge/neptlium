import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider doctrine closeout prevents uncontrolled scope expansion', async () => {
  const closeout = await readFile(new URL('../../../docs/68_PROVIDER_DOCTRINE_CLOSEOUT.md', import.meta.url), 'utf8');
  assert.match(closeout, /stops here pending validation/);
  assert.match(closeout, /next distinct execution is runtime integration\/migration/);
});
