import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const migrationName = '20261021190000_contain_profile_browser_write_authority.sql';
const migration = read(`supabase/migrations/${migrationName}`);
const laterMigrations = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .filter((name) => name.endsWith('.sql') && name > migrationName);

test('profile containment drops every browser write policy on profiles', () => {
  for (const policy of [
    '"profiles_update_own"',
    '"Users can update own profile"',
    '"Users can insert own profile"',
  ]) {
    assert.match(
      migration,
      new RegExp(`drop policy if exists ${policy} on public\\.profiles`, 'i'),
    );
  }
});

test('profile containment leaves browser roles an owner read projection only', () => {
  assert.match(
    migration,
    /revoke all privileges on table public\.profiles from anon, authenticated/i,
  );
  assert.match(migration, /grant select on table public\.profiles to authenticated/i);
  assert.doesNotMatch(
    migration,
    /grant\s+(?:all|insert|update|delete|truncate|trigger|references)[^;]*public\.profiles/i,
  );
  assert.doesNotMatch(migration, /grant[^;]*public\.profiles[^;]*\banon\b/i);
});

test('later migrations do not restore browser write authority on profiles', () => {
  for (const name of laterMigrations) {
    const sql = read(`supabase/migrations/${name}`);
    assert.doesNotMatch(
      sql,
      /grant\s+(?:all|insert|update|delete|truncate)[^;]*public\.profiles[^;]*\b(?:anon|authenticated)\b/i,
      `${name} re-grants browser write on profiles`,
    );
    assert.doesNotMatch(
      sql,
      /create policy[^;]*on\s+(?:"?public"?\.)?"?profiles"?\s+for\s+(?:all|insert|update|delete)/i,
      `${name} re-creates a browser write policy on profiles`,
    );
  }
});

test('database authorization test applies the tracked containment migration', () => {
  const run = read('supabase/test/profile-authority/run.sql');
  assert.match(
    run,
    new RegExp(`\\\\ir \\.\\./\\.\\./migrations/${migrationName.replace('.', '\\.')}`),
  );
  for (const scenario of [
    'before: suspended customer can self-reinstate',
    'suspended customer cannot self-reinstate',
    'customer cannot edit profile fields directly',
    'owner reads own profile',
    'service role operator can change compliance status',
    'security-definer provisioning still creates profiles',
  ]) {
    assert.ok(run.includes(scenario), `missing scenario: ${scenario}`);
  }
});

test('onboarding is a one-time transition that never resets account standing', () => {
  const onboarding = read(
    'supabase/migrations/20261021191000_onboarding_preserves_account_standing.sql',
  );
  assert.match(
    onboarding,
    /if v_provisioned_at is not null then\s+return query select target_user_id;\s+return;/,
  );
  assert.match(onboarding, /compliance_status = coalesce\(p\.compliance_status, 'pending'\)/);
  const onboardingCode = onboarding.replace(/--.*$/gm, '');
  assert.doesNotMatch(onboardingCode, /compliance_status = 'pending'/);
  assert.match(
    onboarding,
    /revoke all on function public\.complete_account_onboarding\(uuid, jsonb\)\s+from public, anon, authenticated/,
  );
  const run = read('supabase/test/profile-authority/run.sql');
  assert.ok(run.includes('resubmitted onboarding keeps a suspended account suspended'));
  assert.ok(run.includes('20261021191000_onboarding_preserves_account_standing.sql'));
});
