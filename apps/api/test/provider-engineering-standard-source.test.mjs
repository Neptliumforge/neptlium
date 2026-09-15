import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider engineering standard preserves idempotency, evidence and reconciliation doctrine', async () => {
  const standard = await readFile(new URL('../../../docs/19_PROVIDER_ENGINEERING_STANDARD.md', import.meta.url), 'utf8');
  assert.match(standard, /timeout after submission is an ambiguous state/i);
  assert.match(standard, /Provider-specific SDK objects terminate inside adapter modules/);
  assert.match(standard, /requested\/approved\/submitted\/observed\/confirmed\/settled\/reconciled/);
  assert.match(standard, /Mainnet or live execution must not be used merely to make automated tests pass/);
});
