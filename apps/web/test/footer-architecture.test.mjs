import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/site-footer.tsx', import.meta.url), 'utf8');

test('footer exposes institutional identity, verified social destinations and legal routes', () => {
  assert.match(footer, /A capital operating environment for understanding, coordinating and governing what you own/);
  for (const label of ['Bluesky','X','YouTube','TikTok','Privacy','Terms','Cookie Policy','Risk Disclosure','Accessibility']) assert.match(footer, new RegExp(label));
  assert.match(footer, /rel="noopener noreferrer"/);
});
