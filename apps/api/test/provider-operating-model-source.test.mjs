import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider operating model preserves staged enablement and safe degradation', async () => {
  const model = await readFile(new URL('../../../docs/41_PROVIDER_OPERATING_MODEL.md', import.meta.url), 'utf8');
  assert.match(model, /New capabilities begin disabled\/non-certified/);
  assert.match(model, /enabled only after separate operational authorization/);
  assert.match(model, /avoid blind duplicate submission/);
});
