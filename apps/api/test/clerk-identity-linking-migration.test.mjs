import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const foundation = await readFile(
  new URL(
    '../../../supabase/migrations/20260820190000_identity_principal_provider_subject_foundation.sql',
    import.meta.url,
  ),
  'utf8',
);
const linking = await readFile(
  new URL(
    '../../../supabase/migrations/20260820203000_clerk_identity_linking_commands.sql',
    import.meta.url,
  ),
  'utf8',
);
const principal = '00000000-0000-4000-8000-000000000001';

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
    create table public.profiles(
      id uuid primary key references auth.users(id),
      email text not null,
      user_id uuid unique references auth.users(id),
      created_at timestamptz not null default now()
    );
    insert into auth.users values ('${principal}', 'owner@example.test');
    insert into public.profiles(id,email) values ('${principal}', 'owner@example.test');
  `);
  await db.exec(foundation);
  await db.exec(linking);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [principal]);
  return db;
}

test('existing Supabase principal can idempotently link one Clerk subject without email matching', async () => {
  const db = await database();
  try {
    const first = await db.query(`select public.link_clerk_identity_subject($1,$2,$3) as result`, [
      'user_clerk_123',
      'link-command-123',
      'request-1',
    ]);
    const replay = await db.query(`select public.link_clerk_identity_subject($1,$2,$3) as result`, [
      'user_clerk_123',
      'link-command-123',
      'request-2',
    ]);
    assert.equal(first.rows[0].result.principal_id, principal);
    assert.equal(first.rows[0].result.replayed, false);
    assert.equal(replay.rows[0].result.replayed, true);
    const rows = await db.query(
      `select principal_id, provider, provider_subject from public.identity_provider_subjects where provider='CLERK'`,
    );
    assert.deepEqual(rows.rows, [
      { principal_id: principal, provider: 'CLERK', provider_subject: 'user_clerk_123' },
    ]);
    await assert.rejects(
      () =>
        db.query(`select public.link_clerk_identity_subject($1,$2,$3)`, [
          'user_different',
          'link-command-123',
          'request-3',
        ]),
      /idempotency conflict/,
    );
  } finally {
    await db.close();
  }
});

test('signed lifecycle command revokes only the mapped Clerk subject and is replay-safe', async () => {
  const db = await database();
  try {
    await db.query(`select public.link_clerk_identity_subject($1,$2,$3)`, [
      'user_clerk_123',
      'link-command-123',
      'request-1',
    ]);
    const digest = 'a'.repeat(64);
    await db.query(`select public.sync_clerk_identity_lifecycle($1,$2,$3,$4)`, [
      'user_clerk_123',
      'evt_12345678',
      'user.deleted',
      digest,
    ]);
    const replay = await db.query(
      `select public.sync_clerk_identity_lifecycle($1,$2,$3,$4) as result`,
      ['user_clerk_123', 'evt_12345678', 'user.deleted', digest],
    );
    assert.equal(replay.rows[0].result.replayed, true);
    const subject = await db.query(
      `select status, revoked_at is not null as revoked from public.identity_provider_subjects where provider='CLERK'`,
    );
    assert.deepEqual(subject.rows, [{ status: 'REVOKED', revoked: true }]);
    const supabase = await db.query(
      `select status from public.identity_provider_subjects where provider='SUPABASE_AUTH'`,
    );
    assert.deepEqual(supabase.rows, [{ status: 'ACTIVE' }]);
  } finally {
    await db.close();
  }
});
