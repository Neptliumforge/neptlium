import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const readMigration = (name) =>
  readFile(new URL(`../../../supabase/migrations/${name}`, import.meta.url), 'utf8');
const foundation = await readMigration('20260820190000_identity_principal_provider_subject_foundation.sql');
const linking = await readMigration('20260820203000_clerk_identity_linking_commands.sql');
const cutover = await readMigration('20260820220000_clerk_application_identity_cutover.sql');

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon noinherit;
    create role authenticated noinherit;
    create role service_role noinherit;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
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
  `);
  await db.exec(foundation);
  await db.exec(linking);
  await db.exec(cutover);
  return db;
}

test('Clerk bootstrap is UUID-stable, idempotent, and creates no financial resource', async () => {
  const db = await database();
  try {
    const first = await db.query(
      `select public.bootstrap_clerk_identity_principal($1,$2,$3) as result`,
      ['user_clerk_new', 'verified@example.test', 'request-1'],
    );
    const replay = await db.query(
      `select public.bootstrap_clerk_identity_principal($1,$2,$3) as result`,
      ['user_clerk_new', 'changed@example.test', 'request-2'],
    );
    assert.equal(first.rows[0].result.status, 'created');
    assert.equal(replay.rows[0].result.status, 'existing');
    assert.equal(replay.rows[0].result.profile_id, first.rows[0].result.profile_id);
    const profile = await db.query('select id, user_id, email from public.profiles');
    assert.deepEqual(profile.rows, [{
      id: first.rows[0].result.profile_id,
      user_id: first.rows[0].result.profile_id,
      email: 'verified@example.test',
    }]);
    const authUsers = await db.query('select count(*)::int as count from auth.users');
    assert.equal(authUsers.rows[0].count, 0);
  } finally {
    await db.close();
  }
});

test('public ownership foreign keys no longer require auth.users', async () => {
  const db = await database();
  try {
    const constraints = await db.query(`
      select count(*)::int as count
      from pg_constraint
      where contype='f' and confrelid='auth.users'::regclass
        and connamespace='public'::regnamespace
    `);
    assert.equal(constraints.rows[0].count, 0);
  } finally {
    await db.close();
  }
});

test('treasury admin authority resolves Clerk subject and rejects spoofed principal UUID', async () => {
  const db = await database();
  try {
    const created = await db.query(
      `select public.bootstrap_clerk_identity_principal($1,$2,$3) as result`,
      ['user_clerk_admin', 'admin@example.test', 'request-1'],
    );
    const principal = created.rows[0].result.profile_id;
    await db.query(`update public.user_roles set role='super_admin' where user_id=$1`, [principal]);
    await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, ['user_clerk_admin']);
    await db.query(`select public.assert_treasury_super_admin($1)`, [principal]);
    await assert.rejects(
      () => db.query(`select public.assert_treasury_super_admin($1)`, [
        '00000000-0000-4000-8000-000000000099',
      ]),
      /does not match authenticated principal/,
    );
  } finally {
    await db.close();
  }
});
