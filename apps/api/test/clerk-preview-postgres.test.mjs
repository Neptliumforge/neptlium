import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { SupabaseClerkPreviewIdentityStore } from '../dist/clerk-preview-identity.js';

const principal = '00000000-0000-4000-8000-000000000001';
const organization = '00000000-0000-4000-8000-000000000002';
const otherOrganization = '00000000-0000-4000-8000-000000000003';
const existingSubject = 'user_existing123';
const newSubject = 'user_unlinked123';
const migrations = new URL('../../../supabase/migrations/', import.meta.url);

function fixtureTransport(db) {
  return async (input) => {
    const url = new URL(input);
    const eq = (key) => url.searchParams.get(key)?.slice(3);
    let result;
    switch (url.pathname) {
      case '/rest/v1/identity_provider_subjects':
        result = await db.query(
          `select principal_id, provider, provider_subject, status
           from public.identity_provider_subjects
           where provider = $1 and status = $2
             and ($3::text is null or provider_subject = $3)
             and ($4::uuid is null or principal_id = $4)
           limit 2`,
          [eq('provider'), eq('status'), eq('provider_subject') ?? null, eq('principal_id') ?? null],
        );
        break;
      case '/rest/v1/identity_principals':
        result = await db.query(
          'select id, status, suspended_at, retired_at from public.identity_principals where id = $1 and status = $2 limit 2',
          [eq('id'), eq('status')],
        );
        break;
      case '/rest/v1/organization_memberships':
        result = await db.query(
          `select id, organization_id, user_id, status, suspended_at, revoked_at
           from public.organization_memberships
           where organization_id = $1 and user_id = $2 and status = $3
             and suspended_at is null and revoked_at is null limit 2`,
          [eq('organization_id'), eq('user_id'), eq('status')],
        );
        break;
      default:
        assert.fail('Unexpected identity fixture request');
    }
    return Response.json(result.rows);
  };
}

test('Clerk Preview reads migrated identity, preserves ownership and denies revoked access', async () => {
  const db = new PGlite();
  try {
    // Minimal predecessors for the two actual migrations. No connection leaves this process.
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create table public.profiles (id uuid primary key, created_at timestamptz);
      create table public.organizations (id uuid primary key);
      create table public.ledger_accounts (id uuid primary key, asset text, network text);
      create table public.ledger_journals (id uuid primary key, posted_at timestamptz);
    `);
    await db.query('insert into auth.users (id) values ($1)', [principal]);
    await db.query('insert into public.profiles (id) values ($1)', [principal]);
    for (const file of [
      '20260825051902_identity_principal_provider_subject_foundation.sql',
      '20260914174500_platform_core_owner_control_plane.sql',
    ]) await db.exec(await readFile(new URL(file, migrations), 'utf8'));

    await db.query('insert into public.organizations (id) values ($1), ($2)', [organization, otherOrganization]);
    await db.query(
      "insert into public.identity_provider_subjects (principal_id, provider, provider_subject) values ($1, 'CLERK', $2)",
      [principal, existingSubject],
    );
    await db.query(
      "insert into public.organization_memberships (organization_id, user_id, role) values ($1, $2, 'viewer')",
      [organization, principal],
    );
    await db.query(
      "insert into public.platform_owners (id, owner_type, individual_user_id) values ($1, 'individual', $1)",
      [principal],
    );
    await db.query('insert into public.ledger_accounts (id, platform_owner_id) values ($1, $1)', [principal]);

    const store = new SupabaseClerkPreviewIdentityStore('https://fixture.example.test', 'test-only', fixtureTransport(db));
    await db.exec('set role service_role');
    assert.equal(await store.resolveActiveClerkPrincipal(existingSubject), principal);
    assert.equal(await store.resolveActiveClerkPrincipal(newSubject), null);
    assert.equal(await store.isActiveOrganizationMember(principal, organization), true);
    assert.equal(await store.isActiveOrganizationMember(principal, otherOrganization), false);
    await db.exec('reset role');

    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query('select id from public.identity_principals'), /permission denied/);
      await assert.rejects(db.query('select id from public.organization_memberships'), /permission denied/);
      await db.exec('reset role');
    }

    await db.exec('begin');
    await db.query("update public.organization_memberships set status = 'revoked', revoked_at = now() where user_id = $1", [principal]);
    await db.query("update public.identity_principals set status = 'SUSPENDED', suspended_at = now() where id = $1", [principal]);
    await db.exec('set local role service_role');
    assert.equal(await store.isActiveOrganizationMember(principal, organization), false);
    assert.equal(await store.resolveActiveClerkPrincipal(existingSubject), null);
    await db.exec('rollback');

    await db.exec('set role service_role');
    assert.equal(await store.resolveActiveClerkPrincipal(existingSubject), principal);
    assert.equal(await store.isActiveOrganizationMember(principal, organization), true);
    await db.exec('reset role');

    const retained = await db.query(
      'select id, platform_owner_id from public.ledger_accounts where id = $1',
      [principal],
    );
    assert.deepEqual(retained.rows, [{ id: principal, platform_owner_id: principal }]);
  } finally {
    await db.close();
  }
});
