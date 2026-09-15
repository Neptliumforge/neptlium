import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('failure model requires controlled recovery for ambiguous outcomes', async () => {
  const model = await readFile(new URL('../../../docs/29_PROVIDER_FAILURE_MODEL.md', import.meta.url), 'utf8');
  assert.match(model, /ambiguous_outcome/);
  assert.match(model, /Never blindly retry an externally mutating request after timeout/);
  assert.match(model, /must not leak secrets or provider SDK internals/);
});
