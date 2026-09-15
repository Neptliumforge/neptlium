import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('production readiness remains capability-specific and evidence-based', async () => {
  const readiness = await readFile(new URL('../../../docs/44_PROVIDER_PRODUCTION_READINESS.md', import.meta.url), 'utf8');
  assert.match(readiness, /production-connected while having zero execution-enabled financial capabilities/);
  assert.match(readiness, /Do not label Circle, Alchemy or Stripe globally `live`/);
});
