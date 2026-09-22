import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../../../supabase/migrations/20260914174500_platform_core_owner_control_plane.sql', import.meta.url), 'utf8');

test('platform core tables enable RLS and deny browser roles', () => {
  for (const table of ['platform_owners','organization_memberships','canonical_assets','platform_audit_events']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.match(migration, /revoke all on public\.platform_owners, public\.organization_memberships, public\.canonical_assets, public\.platform_audit_events from public, anon, authenticated;/i);
});

test('audit history and owner identity are immutable', () => {
  assert.match(migration, /platform_audit_events_append_only/i);
  assert.match(migration, /before update or delete on public\.platform_audit_events/i);
  assert.match(migration, /platform owner identity is immutable/i);
  assert.match(migration, /retired platform owner cannot be reactivated/i);
});

test('migration bridges the existing ledger without posting money', () => {
  assert.match(migration, /alter table public\.ledger_accounts add column if not exists platform_owner_id/i);
  assert.match(migration, /alter table public\.ledger_journals add column if not exists platform_owner_id/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.ledger_(?:journals|postings)/i);
  assert.doesNotMatch(migration, /update\s+public\.ledger_(?:journals|postings)/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.ledger_(?:journals|postings)/i);
});

test('organization membership roles preserve maker checker separation', () => {
  assert.match(migration, /'owner','admin','approver','operator','viewer','auditor'/i);
  assert.match(migration, /unique \(organization_id, user_id\)/i);
});
