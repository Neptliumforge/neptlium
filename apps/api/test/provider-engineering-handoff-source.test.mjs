import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider handoff requires stacked-work reconciliation before runtime migration', async () => {
  const handoff = await readFile(new URL('../../../docs/57_PROVIDER_ENGINEERING_HANDOFF.md', import.meta.url), 'utf8');
  assert.match(handoff, /reconciling it with open stacked Platform Core\/Treasury provider work/);
  assert.match(handoff, /retire Base-only validation after replacement coverage passes/);
  assert.match(handoff, /Production credentials.*outside this branch's implementation scope/s);
});
