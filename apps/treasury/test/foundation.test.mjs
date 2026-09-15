import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Neptlium Treasury protects the authenticated dashboard with a Supabase session but grants no browser financial authority', () => {
  const proxy = read('proxy.ts');
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  assert.match(proxy, /refreshSupabaseSession/);
  assert.match(proxy, /\/auth\/sign-in/);
  assert.match(dashboard, /Organization authority unavailable/);
  assert.match(dashboard, /Payment execution unavailable/);
  assert.doesNotMatch(dashboard, /circle\.com|alchemy\.com|fetch\(|service_role|private_key/i);
});

test('Neptlium Treasury preserves organization policy and payment lifecycle boundaries', () => {
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  for (const label of ['Treasury','Payments','Receivables','Counterparties','Approvals','Policies','Risk','Wallets','Reports','Activity','Integrations','Audit Log','Settings']) assert.match(dashboard, new RegExp(label));
  for (const state of ['DRAFT','PREFLIGHT','POLICY_CHECKED','AWAITING_APPROVAL','AUTHORIZED','RESERVED','AWAITING_SIGNATURE','SIGNED','SUBMITTED','CONFIRMING','SETTLED','RECONCILED']) assert.match(dashboard, new RegExp(state));
  assert.match(dashboard, /No authenticated browser session alone grants treasury authority/);
});

test('Neptlium Treasury native access uses the shared browser client and never exposes privileged credentials', () => {
  const signIn = read('app/auth/sign-in/sign-in-form.tsx');
  const signOut = read('app/auth/sign-out-button.tsx');
  assert.match(signIn, /createSupabaseBrowserClient/);
  assert.match(signIn, /signInWithPassword/);
  assert.match(signOut, /auth\.signOut\(\)/);
  assert.doesNotMatch(`${signIn}\n${signOut}`, /service_role|private_key|entity_secret|api_key/i);
});

test('active Treasury product identity contains no obsolete VaultRail package or domain contract', () => {
  const pkg = read('package.json');
  const env = read('.env.example');
  const vercel = read('vercel.json');
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  assert.match(pkg, /@neptlium\/treasury/);
  assert.match(env, /treasury\.neptlium\.com/);
  assert.match(vercel, /@neptlium\/treasury/);
  assert.doesNotMatch(`${pkg}\n${env}\n${vercel}\n${dashboard}`, /@neptlium\/vault|vault\.neptlium\.com|VaultRail/);
});
