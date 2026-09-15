import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider definition of done requires reconciliation and separate execution authorization', async () => {
  const done = await readFile(new URL('../../../docs/28_PROVIDER_DEFINITION_OF_DONE.md', import.meta.url), 'utf8');
  assert.match(done, /provider evidence remains non-canonical until settlement\/reconciliation/);
  assert.match(done, /execution cannot occur from configuration or capability presence alone/);
  assert.match(done, /production configuration\/deployment\/execution is separately authorized/);
});
