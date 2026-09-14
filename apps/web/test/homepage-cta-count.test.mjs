import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage hero keeps two focused brand and journey actions', () => {
  assert.equal((page.match(/Explore Neptlium/g) ?? []).length, 1);
  assert.equal((page.match(/For business/g) ?? []).length, 1);
  assert.match(page, /href="#financial-world"/);
  assert.match(page, /href="\/business"/);
  assert.doesNotMatch(page, /href=\{SITE\.signUpUrl\}/);
  assert.doesNotMatch(page, /Explore the Platform|View Investment Solutions/);
});
