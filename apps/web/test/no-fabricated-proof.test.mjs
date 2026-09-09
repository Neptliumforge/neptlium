import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage credibility is architectural rather than synthetic scale proof', () => {
  assert.match(
    page,
    /Trust is established through evidence,[\s\S]*explicit state,[\s\S]*controlled authority,[\s\S]*and[\s\S]*verifiable outcomes\./,
  );
  assert.match(page, /Authorization before consequence/);
  assert.doesNotMatch(
    page,
    /\b[0-9]+ institutions\b|\b[0-9]+ countries\b|\b99\.9+%\b|\$[0-9]+[BMK]/i,
  );
});
