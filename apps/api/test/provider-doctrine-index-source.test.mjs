import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider doctrine index points to canonical provider architecture authority', async () => {
  const index = await readFile(new URL('../../../docs/60_PROVIDER_DOCTRINE_INDEX.md', import.meta.url), 'utf8');
  assert.match(index, /Core authority: `docs\/10_PROVIDER_ARCHITECTURE.md`/);
  assert.match(index, /Source\/tests\/runtime evidence determine implementation truth/);
});
