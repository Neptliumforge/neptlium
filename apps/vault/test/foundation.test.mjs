import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('VaultRail protects the authenticated dashboard but grants no browser financial authority', () => {
  const proxy = read('proxy.ts');
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  assert.match(proxy, /auth\.protect\(\)/);
  assert.match(dashboard, /Organization authority unavailable/);
  assert.match(dashboard, /Payment execution unavailable/);
  assert.doesNotMatch(dashboard, /circle\.com|alchemy\.com|fetch\(|supabase|service_role|private_key/i);
});

test('VaultRail preserves organization policy and payment lifecycle boundaries', () => {
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  for (const label of ['Treasury','Payments','Receivables','Counterparties','Approvals','Policies','Risk','Wallets','Reports','Activity','Integrations','Audit Log','Settings']) assert.match(dashboard, new RegExp(label));
  for (const state of ['DRAFT','PREFLIGHT','POLICY_CHECKED','AWAITING_APPROVAL','AUTHORIZED','RESERVED','AWAITING_SIGNATURE','SIGNED','SUBMITTED','CONFIRMING','SETTLED','RECONCILED']) assert.match(dashboard, new RegExp(state));
  assert.match(dashboard, /No authenticated browser session alone grants treasury authority/);
});
