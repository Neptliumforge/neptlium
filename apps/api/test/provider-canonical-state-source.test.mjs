import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider canonical state distinguishes current transition and target', async () => {
  const state = await readFile(new URL('../../../docs/55_PROVIDER_CANONICAL_STATE.md', import.meta.url), 'utf8');
  assert.match(state, /## CURRENT/);
  assert.match(state, /## TRANSITION/);
  assert.match(state, /## TARGET/);
  assert.match(state, /Base-specific single-RPC constraint/);
});
