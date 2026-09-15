import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider release gates separate configuration, certification and execution', async () => {
  const gates = await readFile(new URL('../../../docs/24_PROVIDER_RELEASE_GATES.md', import.meta.url), 'utf8');
  assert.match(gates, /Gate P1 — configuration/);
  assert.match(gates, /Gate P4 — capability certification/);
  assert.match(gates, /Gate P5 — execution authorization/);
  assert.match(gates, /Alchemy observation never receives financial execution authority/);
});
