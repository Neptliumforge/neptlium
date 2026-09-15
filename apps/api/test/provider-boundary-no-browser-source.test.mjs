import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('privileged provider environment names are never browser-public', async () => {
  const env = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
  for (const providerPrefix of ['ALCHEMY_', 'CIRCLE_', 'STRIPE_']) {
    assert.doesNotMatch(env, new RegExp(`NEXT_PUBLIC_${providerPrefix}`));
    assert.doesNotMatch(env, new RegExp(`VITE_${providerPrefix}`));
  }
});
