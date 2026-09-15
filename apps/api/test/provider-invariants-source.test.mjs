import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('canonical provider invariants preserve financial truth boundaries', async () => {
  const invariants = await readFile(new URL('../../../docs/42_PROVIDER_INVARIANTS.md', import.meta.url), 'utf8');
  assert.match(invariants, /Provider observation is not canonical ledger state/);
  assert.match(invariants, /Capability certification is not execution authorization/);
  assert.match(invariants, /Ambiguous provider outcomes require controlled lookup/);
});
