import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const page = source.slice(source.indexOf('<section className={styles.hero}'), source.indexOf('</section>', source.indexOf('<section className={styles.hero}')));

test('homepage hero keeps two focused brand and journey actions', () => {
  assert.equal((page.match(/Get started/g) ?? []).length, 1);
  assert.equal((page.match(/Explore investing/g) ?? []).length, 1);
  assert.match(page, /href=\{SITE\.personalSignUpUrl\}/);
  assert.match(page, /href="\/investments"/);
  assert.doesNotMatch(page, /Explore the Platform|View Investment Solutions/);
});
