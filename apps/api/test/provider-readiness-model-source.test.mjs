import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('readiness model distinguishes observation from economic execution', async () => {
  const model = await readFile(new URL('../../../docs/46_PROVIDER_READINESS_MODEL.md', import.meta.url), 'utf8');
  assert.match(model, /Observation readiness/);
  assert.match(model, /Execution readiness/);
  assert.match(model, /Alchemy.*production-ready for multi-chain observation.*incapable of financial execution/s);
});
