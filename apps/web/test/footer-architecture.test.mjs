import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/site-footer.tsx', import.meta.url), 'utf8');

test('footer is the canonical product and trust directory', () => {
  assert.match(footer, /Capital, intelligently managed/);
  for (const label of ['Capital','Portfolio','Investments','Treasury','Intelligence','Institutional','Infrastructure','Security','Insights','Company','Privacy','Terms','Risk disclosure','Accessibility','Cookies']) assert.match(footer, new RegExp(label));
  assert.match(footer, /SITE\.statusUrl/);
});

test('footer does not fabricate operational status', () => {
  assert.doesNotMatch(footer, /Systems operational|All systems operational/i);
});
