import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider acceptance criteria include authority, multichain and validation truth', async () => {
  const criteria = await readFile(new URL('../../../docs/65_PROVIDER_ARCHITECTURE_ACCEPTANCE.md', import.meta.url), 'utf8');
  assert.match(criteria, /Platform Core financial authority is preserved/);
  assert.match(criteria, /Alchemy is represented as multi-chain/);
  assert.match(criteria, /tests\/build\/lint\/typecheck.*pass before merge/s);
});
