import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider doctrine slice does not claim production activation or legacy retirement', async () => {
  const boundary = await readFile(new URL('../../../docs/53_PROVIDER_IMPLEMENTATION_BOUNDARY.md', import.meta.url), 'utf8');
  assert.match(boundary, /does not mutate existing production provider resources/);
  assert.match(boundary, /does not remove the current Base-specific legacy Alchemy runtime check/);
  assert.match(boundary, /provider production activation remains separately incomplete/);
});
