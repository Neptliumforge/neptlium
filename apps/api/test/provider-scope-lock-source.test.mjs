import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider doctrine scope remains focused and distinguishes Supabase infrastructure', async () => {
  const lock = await readFile(new URL('../../../docs/62_PROVIDER_SCOPE_LOCK.md', import.meta.url), 'utf8');
  assert.match(lock, /only primary provider roles established here are Circle, Alchemy and Stripe/);
  assert.match(lock, /Supabase remains authentication\/persistence infrastructure/);
  assert.match(lock, /Further runtime integration belongs to the next focused execution/);
});
