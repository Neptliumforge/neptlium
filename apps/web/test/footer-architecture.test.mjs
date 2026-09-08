import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/site-footer.tsx', import.meta.url), 'utf8');

test('footer groups canonical institutional architecture without duplicate overview labels', () => {
  for (const label of ['Platform','Products','Solutions','Resources','Company','Privacy','Terms','Cookie Policy','Risk Disclosure','Accessibility']) assert.match(footer, new RegExp(label));
  assert.doesNotMatch(footer, /Platform overview|All products|Solutions overview|Resources overview|Company overview/i);
});
