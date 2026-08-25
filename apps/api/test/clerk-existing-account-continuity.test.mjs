import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const readMigration = (name) =>
  readFile(new URL(`../../../supabase/migrations/${name}`, import.meta.url), 'utf8');

const foundation = await readMigration('20260820190000_identity_principal_provider_subject_foundation.sql');
const linking = await readMigration('20260820203000_clerk_identity_linking_commands.sql');
const serviceLink = await readMigration('20260820210000_clerk_dual_session_link_service.sql');
const cutover = await readMigration('20260820220000_clerk_application_identity_cutover.sql');
const bootstrapGuard = await readMigration('20260820221000_clerk_bootstrap_existing_account_guard.sql');

const legacyId = '00000000-0000-4000-8000-000000000016';

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon noinherit;
    create role authenticated noinherit;
    create role service_role noinherit;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    create function auth.jwt() returns jsonb language sql stable as $$
      select jsonb_build_object('sub', nullif(current_setting('request.jwt.claim.sub', true), ''))
    $$;
    create table public.profiles(
      id uuid primary key references auth.users(id),
      user_id uuid unique references auth.users(id),
      email text not null,
      full_name text, first_name text, last_name text, country text,
      investor_type text, purpose text, organization_id uuid,
      compliance_status text, compliance_acknowledged_at timestamptz,
      provisioned_at timestamptz, created_at timestamptz not null default now()
    );
    create table public.user_roles(
      user_id uuid primary key references auth.users(id), role text not null
    );
    create table public.organizations(
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null references auth.users(id),
      name text, role text, website text, country text
    );
    alter table public.profiles add constraint profiles_organization_fk
      foreign key (organization_id) references public.organizations(id);
    create table public.onboarding_drafts(
      user_id uuid primary key references auth.users(id), data jsonb default '{}'
    );
    insert into auth.users(id,email) values ('${legacyId}','legacy@example.test');
    insert into public.profiles(id,user_id,email) values ('${legacyId}','${legacyId}','legacy@example.test');
    insert into public.user_roles(user_id,role) values ('${legacyId}','user');
  `);
  await db.exec(foundation);
  await db.exec(linking);
  await db.exec(serviceLink);
  await db.exec(cutover);
  await db.exec(bootstrapGuard);
  return db;
}

test('existing verified email requires linking instead of creating a second principal', async () => {
  const db = await database();
  try {
    const result = await db.query(
      `select public.bootstrap_clerk_identity_principal($1,$2,$3) as result`,
      ['user_clerk_existing', 'legacy@example.test', 'request-existing'],
    );
    assert.equal(result.rows[0].result.status, 'link_required');
    assert.equal(result.rows[0].result.profile_id, legacyId);
    const principals = await db.query('select count(*)::int as count from public.identity_principals');
    assert.equal(principals.rows[0].count, 1);
  } finally {
    await db.close();
  }
});

test('service-only dual-session link preserves the existing principal after cutover', async () => {
  const db = await database();
  try {
    const linked = await db.query(
      `select public.link_clerk_identity_subject_service($1,$2,$3,$4) as result`,
      [legacyId, 'user_clerk_existing', 'link-request-0001', 'request-link'],
    );
    assert.equal(linked.rows[0].result.linked, true);
    assert.equal(linked.rows[0].result.principal_id, legacyId);

    const bootstrap = await db.query(
      `select public.bootstrap_clerk_identity_principal($1,$2,$3) as result`,
      ['user_clerk_existing', 'legacy@example.test', 'request-after-link'],
    );
    assert.equal(bootstrap.rows[0].result.status, 'existing');
    assert.equal(bootstrap.rows[0].result.profile_id, legacyId);

    const profile = await db.query('select id,user_id,email from public.profiles where id=$1', [legacyId]);
    assert.deepEqual(profile.rows, [{ id: legacyId, user_id: legacyId, email: 'legacy@example.test' }]);
  } finally {
    await db.close();
  }
});

test('genuinely new verified email can create one new principal', async () => {
  const db = await database();
  try {
    const result = await db.query(
      `select public.bootstrap_clerk_identity_principal($1,$2,$3) as result`,
      ['user_clerk_new', 'new@example.test', 'request-new'],
    );
    assert.equal(result.rows[0].result.status, 'created');
    assert.notEqual(result.rows[0].result.profile_id, legacyId);
    const principals = await db.query('select count(*)::int as count from public.identity_principals');
    assert.equal(principals.rows[0].count, 2);
  } finally {
    await db.close();
  }
});
