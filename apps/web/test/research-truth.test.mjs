import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/research/page.tsx', import.meta.url), 'utf8');

test('research does not invent publications', () => {
  assert.doesNotMatch(page, /202[0-9].*report|download report|featured research|latest report/i);
});
