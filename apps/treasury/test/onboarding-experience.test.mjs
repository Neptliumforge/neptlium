import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/onboarding/page.tsx', import.meta.url), 'utf8');
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');

test('Treasury onboarding models the complete organization readiness sequence', () => {
  for (const label of ['Organization','Business purpose','Ownership & control','Treasury connections','Team','Policies','Counterparties','Review & activate']) assert.match(page, new RegExp(label.replace('&', '\\&')));
});

test('Treasury onboarding never claims browser-side financial authority', () => {
  assert.match(page, /does not create payment, custody, settlement or approval authority/i);
  assert.match(page, /Platform Core owner\/membership contracts/i);
});

test('Treasury onboarding is protected by the Supabase session boundary', () => {
  assert.match(proxy, /pathname === '\/onboarding'/);
  assert.match(proxy, /refreshSupabaseSession/);
});
