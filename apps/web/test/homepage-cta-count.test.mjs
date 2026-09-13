import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage hero keeps two focused exploration actions', () => {
  assert.equal((page.match(/Explore the Platform/g) ?? []).length, 1);
  assert.equal((page.match(/View Investment Solutions/g) ?? []).length, 1);
  assert.match(page, /href="\/platform"/);
  assert.match(page, /href="\/investments"/);
  assert.doesNotMatch(page, /href=\{SITE\.signUpUrl\}/);
});
