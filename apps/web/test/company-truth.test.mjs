import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const copy = ['../app/company/page.tsx','../app/about/page.tsx','../app/press/page.tsx'].map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');

test('company copy does not invent corporate history or scale', () => {
  assert.doesNotMatch(copy, /founded in|headquartered in|employees|raised \$|Series [A-Z]|backed by|offices in/i);
});
