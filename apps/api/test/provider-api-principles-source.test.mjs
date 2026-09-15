import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider API principles preserve provider-neutral product contracts', async () => {
  const principles = await readFile(new URL('../../../docs/52_PROVIDER_API_PRINCIPLES.md', import.meta.url), 'utf8');
  assert.match(principles, /not provider SDK objects/);
  assert.match(principles, /Provider selection is an internal capability\/policy concern/);
  assert.match(principles, /preserve unknown\/pending\/ambiguous states/);
});
