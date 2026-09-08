import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const path = new URL('../../../supabase/migrations/20260908074500_thesis_revealed_observations.sql', import.meta.url);
test('revealed thesis snapshots are immutable service-role-only records with RLS enabled', async () => { const sql = await readFile(path, 'utf8'); assert.match(sql, /create table if not exists public\.thesis_revealed_observations/i); assert.match(sql, /enable row level security/i); assert.doesNotMatch(sql, /create policy/i); assert.match(sql, /identity_principals/i); assert.match(sql, /thesis_version/i); assert.match(sql, /observation jsonb not null/i); });
