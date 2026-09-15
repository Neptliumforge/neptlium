import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('implementation plan does not confuse architecture with provider activation', async () => {
  const plan = await readFile(new URL('../../../docs/27_PROVIDER_IMPLEMENTATION_PLAN.md', import.meta.url), 'utf8');
  assert.match(plan, /retiring the Base-only production validation only when replacement coverage is complete/);
  assert.match(plan, /must not claim provider activation merely because architecture code\/docs merge/);
});
