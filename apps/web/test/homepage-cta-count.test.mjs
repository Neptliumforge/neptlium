import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage renders one authoritative product entry in the hero', () => {
  assert.equal((page.match(/SITE\.publicAccessUrl/g) ?? []).length, 1);
  assert.equal((page.match(/Enter Neptlium/g) ?? []).length, 1);
});
