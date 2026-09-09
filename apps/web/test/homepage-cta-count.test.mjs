import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage renders governed entry at the hero and final entry act', () => {
  assert.equal((page.match(/SITE\.publicAccessUrl/g) ?? []).length, 2);
  assert.equal((page.match(/SITE\.publicAccessLabel/g) ?? []).length, 2);
  assert.equal((page.match(/className="final-authority"/g) ?? []).length, 1);
});
