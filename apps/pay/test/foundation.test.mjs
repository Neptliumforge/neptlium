import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('public payment intent uses an opaque token route and exposes no fake execution action', () => {
  const page = read('app/i/[publicToken]/page.tsx');
  assert.match(page, /publicToken/);
  assert.match(page, /Payment execution unavailable/);
  assert.doesNotMatch(page, /<button|Connect wallet|Pay now|mark.*paid|service_role|private_key|circle\.com|alchemy\.com/i);
});

test('public Pay application contains no authenticated treasury management surface', () => {
  const entry = read('app/page.tsx');
  assert.match(entry, /intent-driven public payment surface/);
  assert.doesNotMatch(entry, /Approvals|Policies|Audit Log|Treasury dashboard/i);
});
