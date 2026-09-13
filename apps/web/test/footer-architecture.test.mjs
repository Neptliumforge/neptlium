import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/site-footer.tsx', import.meta.url), 'utf8');

test('footer exposes institutional identity, investor paths, verified social destinations and legal routes', () => {
  assert.match(footer, /Capital, made clearer\./);
  assert.match(footer, /modern capital platform/i);
  for (const label of ['Overview','Investments','Funding','Security','About','Insights','Contact','Sign In','Create Account']) assert.match(footer, new RegExp(label));
  for (const label of ['Bluesky','X','YouTube','TikTok','Privacy','Terms','Cookie Policy','Risk Disclosure','Accessibility']) assert.match(footer, new RegExp(label));
  assert.match(footer, /does not constitute investment advice/i);
  assert.match(footer, /rel="noopener noreferrer"/);
});
