import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../../../supabase/migrations/20260914174500_platform_core_owner_control_plane.sql', import.meta.url), 'utf8');

test('platform core tables enable RLS and deny browser roles', () => {
  for (const table of ['platform_owners','organization_memberships','canonical_assets','platform_audit_events']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.match(migration, /revoke all on public\.platform_owners, public\.organization_memberships, public\.canonical_assets, public\.platform_audit_events[\s\S]*from public, anon, authenticated;/i);
  assert.doesNotMatch(migration, /grant\s+(?:all|insert|update|delete)\s+on\s+public\.(?:platform_owners|organization_memberships|canonical_assets|platform_audit_events)\s+to\s+(?:anon|authenticated)/i);
});

test('platform audit history is append only', () => {
  assert.match(migration, /platform_audit_events_append_only/i);
  assert.match(migration, /before update or delete on public\.platform_audit_events/i);
  assert.match(migration, /platform audit history is append-only/i);
});

test('platform owner subject identity is immutable', () => {
  assert.match(migration, /old\.owner_type is distinct from new\.owner_type/i);
  assert.match(migration, /old\.individual_user_id is distinct from new\.individual_user_id/i);
  assert.match(migration, /old\.organization_id is distinct from new\.organization_id/i);
  assert.match(migration, /retired platform owner cannot be reactivated/i);
});

test('migration is additive to canonical ledger and does not post money', () => {
  assert.match(migration, /add column if not exists platform_owner_id/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.ledger_(?:journals|postings)/i);
  assert.doesNotMatch(migration, /update\s+public\.ledger_(?:journals|postings)/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.ledger_(?:journals|postings)/i);
});

test('organization membership roles keep operator and approver distinct', () => {
  assert.match(migration, /'owner','admin','approver','operator','viewer','auditor'/i);
  assert.match(migration, /unique \(organization_id, user_id\)/i);
});
