import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage credibility is architectural rather than synthetic scale proof', () => {
  assert.match(page, /Capital, intelligently managed\./);
  assert.match(page, /Illustrative infrastructure — no customer data/);
  assert.match(page, /No customer balances, returns or performance data are[\s\S]*shown\./);
  assert.doesNotMatch(
    page,
    /\b[0-9]+ institutions\b|\b[0-9]+ countries\b|\b99\.9+%\b|\$[0-9]+[BMK]|\bAUM\b|guaranteed return/i,
  );
});
