import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const migration = await readFile(
  new URL(
    '../../../supabase/migrations/20260820190000_identity_principal_provider_subject_foundation.sql',
    import.meta.url,
  ),
  'utf8',
);

const first = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';

async function productionShapedDatabase() {
  const db = new PGlite();
  await db.exec(`
    create role anon noinherit;
    create role authenticated noinherit;
    create role service_role noinherit;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create table public.profiles(
      id uuid primary key references auth.users(id),
      email text not null,
      user_id uuid unique references auth.users(id),
      created_at timestamptz not null default now()
    );
    create table public.ledger_accounts(id uuid primary key default gen_random_uuid());
    create table public.ledger_journals(id uuid primary key default gen_random_uuid());
    create table public.ledger_postings(id uuid primary key default gen_random_uuid());
    create table public.funding_intents(id uuid primary key default gen_random_uuid());
    create table public.transfer_executions(id uuid primary key default gen_random_uuid());
    create table public.settlement_evidence(id uuid primary key default gen_random_uuid());
    create table public.reconciliation_runs(id uuid primary key default gen_random_uuid());
    create table public.reconciliation_items(id uuid primary key default gen_random_uuid());
    insert into auth.users(id, email) values
      ('${first}', 'first@example.test'),
      ('${second}', 'second@example.test');
    insert into public.profiles(id, email, created_at) values
      ('${first}', 'first@example.test', '2026-01-01T00:00:00Z'),
      ('${second}', 'second@example.test', '2026-02-01T00:00:00Z');
    insert into public.ledger_accounts default values;
    insert into public.ledger_journals default values;
    insert into public.ledger_postings default values;
    insert into public.funding_intents default values;
    insert into public.transfer_executions default values;
    insert into public.settlement_evidence default values;
    insert into public.reconciliation_runs default values;
    insert into public.reconciliation_items default values;
  `);
  return db;
}

test('migration preserves profile UUIDs and backfills one Supabase subject per principal', async () => {
  const db = await productionShapedDatabase();
  try {
    await db.exec(migration);
    const principals = await db.query(
      `select id, status, created_at from public.identity_principals order by id`,
    );
    assert.deepEqual(
      principals.rows.map((row) => ({ id: row.id, status: row.status })),
      [
        { id: first, status: 'ACTIVE' },
        { id: second, status: 'ACTIVE' },
      ],
    );

    const subjects = await db.query(
      `select principal_id, provider, provider_subject, status
       from public.identity_provider_subjects order by principal_id`,
    );
    assert.deepEqual(subjects.rows, [
      { principal_id: first, provider: 'SUPABASE_AUTH', provider_subject: first, status: 'ACTIVE' },
      {
        principal_id: second,
        provider: 'SUPABASE_AUTH',
        provider_subject: second,
        status: 'ACTIVE',
      },
    ]);
    assert.equal(
      subjects.rows.some((row) => row.provider_subject.includes('@')),
      false,
    );

    const events = await db.query(
      `select operation, count(*)::integer as count
       from public.identity_events group by operation order by operation`,
    );
    assert.deepEqual(events.rows, [
      { operation: 'principal.created', count: 2 },
      { operation: 'provider_subject.linked', count: 2 },
    ]);

    const security = await db.query(`
      select c.relname, c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('identity_principals', 'identity_provider_subjects', 'identity_events')
      order by c.relname
    `);
    assert.deepEqual(security.rows, [
      { relname: 'identity_events', relrowsecurity: true },
      { relname: 'identity_principals', relrowsecurity: true },
      { relname: 'identity_provider_subjects', relrowsecurity: true },
    ]);
    const grants = await db.query(`
      select grantee, table_name, privilege_type
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name in ('identity_principals', 'identity_provider_subjects', 'identity_events')
        and grantee in ('anon', 'authenticated', 'service_role')
      order by grantee, table_name, privilege_type
    `);
    assert.deepEqual(grants.rows, [
      { grantee: 'service_role', table_name: 'identity_events', privilege_type: 'SELECT' },
      { grantee: 'service_role', table_name: 'identity_principals', privilege_type: 'SELECT' },
      {
        grantee: 'service_role',
        table_name: 'identity_provider_subjects',
        privilege_type: 'SELECT',
      },
    ]);

    await assert.rejects(
      () => db.exec(`update public.identity_events set metadata = '{}'::jsonb`),
      /identity events are append-only/,
    );
    await assert.rejects(
      () => db.exec(`delete from public.identity_events`),
      /identity events are append-only/,
    );
    await assert.rejects(
      () =>
        db.query(
          `update public.identity_principals
           set status = 'SUSPENDED'
           where id = $1`,
          [first],
        ),
      /identity_principals_lifecycle_check/,
    );
    const sourceState = await db.query(`
      select
        (select count(*)::integer from auth.users) as auth_users,
        (select count(*)::integer from public.profiles) as profiles,
        (select count(*)::integer from public.ledger_accounts) as ledger_accounts,
        (select count(*)::integer from public.ledger_journals) as ledger_journals,
        (select count(*)::integer from public.ledger_postings) as ledger_postings,
        (select count(*)::integer from public.funding_intents) as funding_intents,
        (select count(*)::integer from public.transfer_executions) as transfer_executions,
        (select count(*)::integer from public.settlement_evidence) as settlement_evidence,
        (select count(*)::integer from public.reconciliation_runs) as reconciliation_runs,
        (select count(*)::integer from public.reconciliation_items) as reconciliation_items
    `);
    assert.deepEqual(sourceState.rows, [
      {
        auth_users: 2,
        profiles: 2,
        ledger_accounts: 1,
        ledger_journals: 1,
        ledger_postings: 1,
        funding_intents: 1,
        transfer_executions: 1,
        settlement_evidence: 1,
        reconciliation_runs: 1,
        reconciliation_items: 1,
      },
    ]);
  } finally {
    await db.close();
  }
});

test('identity mapping constraints fail closed under duplicate and conflicting concurrent links', async () => {
  const db = await productionShapedDatabase();
  try {
    await db.exec(migration);
    const clerkSubject = 'user_clerk_123';
    const attempts = await Promise.allSettled([
      db.query(
        `insert into public.identity_provider_subjects(principal_id, provider, provider_subject)
         values ($1, 'CLERK', $2) returning id`,
        [first, clerkSubject],
      ),
      db.query(
        `insert into public.identity_provider_subjects(principal_id, provider, provider_subject)
         values ($1, 'CLERK', $2) returning id`,
        [first, clerkSubject],
      ),
    ]);
    assert.equal(attempts.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(attempts.filter((result) => result.status === 'rejected').length, 1);

    await assert.rejects(
      () =>
        db.query(
          `insert into public.identity_provider_subjects(principal_id, provider, provider_subject)
           values ($1, 'CLERK', $2)`,
          [second, clerkSubject],
        ),
      /identity_provider_subjects_provider_subject_unique/,
    );
    await assert.rejects(
      () =>
        db.query(
          `insert into public.identity_provider_subjects(principal_id, provider, provider_subject)
           values ($1, 'CLERK', 'another_subject')`,
          [first],
        ),
      /identity_provider_subjects_active_principal_provider_unique/,
    );
  } finally {
    await db.close();
  }
});

test('migration rejects an orphaned profile instead of inventing an identity', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon noinherit;
      create role authenticated noinherit;
      create role service_role noinherit;
      create schema auth;
      create table auth.users(id uuid primary key);
      create table public.profiles(
        id uuid primary key,
        email text not null,
        created_at timestamptz not null default now()
      );
      insert into public.profiles(id, email) values ('${first}', 'orphan@example.test');
    `);
    await assert.rejects(
      () => db.exec(migration),
      /cannot backfill a profile without a matching Supabase Auth subject/,
    );
    const relation = await db.query(`select to_regclass('public.identity_principals') as value`);
    assert.equal(relation.rows[0].value, null);
  } finally {
    await db.close();
  }
});
