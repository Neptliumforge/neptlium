import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8');

test('developer docs label speculative domains instead of presenting them as live', () => {
  for (const label of ['Available','Beta','Planned']) assert.match(page, new RegExp(label));
  assert.match(page, /Payments', 'Planned'/);
  assert.match(page, /Approvals', 'Planned'/);
});

test('developer docs preserve one shared API boundary and contain no real secrets', () => {
  assert.match(page, /api\.neptlium\.com/);
  assert.match(page, /Neptlium Treasury/);
  assert.doesNotMatch(page, /treasury-api\.neptlium\.com|pay-api\.neptlium\.com/);
  assert.doesNotMatch(page, /sk_live_|whsec_|service_role|private_key/i);
});
