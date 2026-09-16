import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage hero keeps two focused brand and journey actions', () => {
  assert.equal((page.match(/Get started/g) ?? []).length, 1);
  assert.equal((page.match(/For institutions/g) ?? []).length, 1);
  assert.match(page, /href=\{SITE\.personalSignUpUrl\}/);
  assert.match(page, /href="\/institutional"/);
  assert.doesNotMatch(page, /Explore the Platform|View Investment Solutions/);
});
