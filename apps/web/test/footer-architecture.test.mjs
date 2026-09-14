import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/site-footer.tsx', import.meta.url), 'utf8');

test('footer closes with brand, real status, maintained social and essential trust/legal links', () => {
  assert.match(footer, /Capital systems for people, businesses and institutions/);
  assert.match(footer, /View system status/);
  for (const label of ['X','Bluesky','YouTube','Security','Privacy','Terms','Risk disclosure','Accessibility','Cookies']) assert.match(footer, new RegExp(label));
});

test('footer does not duplicate the product directory already available in navigation', () => {
  assert.doesNotMatch(footer, /const columns/);
  assert.doesNotMatch(footer, />Portfolio</);
  assert.doesNotMatch(footer, />Payments</);
  assert.doesNotMatch(footer, />Institutional</);
});

test('footer does not fabricate operational status', () => {
  assert.doesNotMatch(footer, /Systems operational|All systems operational/i);
});
