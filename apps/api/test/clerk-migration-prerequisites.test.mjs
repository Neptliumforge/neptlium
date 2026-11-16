import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const migration = name => readFileSync(resolve(root, 'supabase/migrations', name), 'utf8');
const foundation = migration('20260825051902_identity_principal_provider_subject_foundation.sql');
const cutover = migration('20260825053749_clerk_application_identity_cutover.sql');
const hardening = migration('20261116050000_clerk_bootstrap_no_email_auto_link.sql');

test('Clerk identity foundation explicitly requires existing profiles and Supabase Auth', () => {
  assert.match(foundation, /to_regclass\('public\.profiles'\) is null/);
  assert.match(foundation, /to_regclass\('auth\.users'\) is null/);
  assert.match(foundation, /create table public\.identity_principals/i);
  assert.match(foundation, /create table public\.identity_provider_subjects/i);
  assert.match(foundation, /create table public\.identity_events/i);
});

test('Clerk cutover requires identity foundation before bootstrap', () => {
  assert.match(cutover, /requires the provider-independent identity foundation/i);
  assert.match(cutover, /create or replace function public\.bootstrap_clerk_identity_principal/i);
});

test('later bootstrap override denies email-only linking and restricts execute', () => {
  assert.match(hardening, /lower\(btrim\(p\.email\)\) = v_email/);
  assert.match(hardening, /'status','link_required'/);
  assert.doesNotMatch(hardening, /insert into public\.identity_provider_subjects[\s\S]*?select[\s\S]*?from public\.profiles/i);
  assert.match(hardening, /pg_advisory_xact_lock/);
  assert.match(hardening, /revoke all on function public\.bootstrap_clerk_identity_principal/);
  assert.match(hardening, /to service_role/);
});
