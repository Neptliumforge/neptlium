import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('landing v2 preserves explicit state distinctions', () => {
  for (const phrase of ['Observed','Provider-reported','Derived','Modeled','Authorized','Completed']) assert.match(page, new RegExp(phrase, 'i'));
  for (const boundary of ['MODELED ≠ EXECUTED','PENDING ≠ COMPLETED','VISIBLE ≠ AUTHORITATIVE','PUBLIC CLIENT ≠ PRIVILEGED AUTHORITY']) assert.match(page, new RegExp(boundary));
});

test('landing v2 contains no synthetic credibility bar', () => {
  assert.doesNotMatch(page, /\$[0-9]|\bAUM\b|institutions served|countries served|uptime|assets managed|processing volume/i);
});

test('landing v2 uses structural wave language without imagery or decorative dashboard mockups', () => {
  assert.match(page, /hero-wave-field/);
  assert.doesNotMatch(page, /<Image|<img|dashboard mockup|floating dashboard|planet|stock-market/i);
});
