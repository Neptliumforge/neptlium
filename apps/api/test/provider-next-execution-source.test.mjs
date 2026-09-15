import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('next provider execution focuses on runtime integration without bypassing gates', async () => {
  const next = await readFile(new URL('../../../docs/61_PROVIDER_NEXT_EXECUTION.md', import.meta.url), 'utf8');
  assert.match(next, /Circle\/Alchemy\/Stripe the only current primary provider roles/);
  assert.match(next, /retire the Base-only Alchemy production constraint/);
  assert.match(next, /production money movement remains a later explicit gate/);
});
