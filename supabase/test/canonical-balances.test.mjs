import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const migration = read(
  'supabase/migrations/20261021200000_canonical_capital_ledger_initialization.sql',
);
const code = migration.replace(/--.*$/gm, '');

test('capital ledger initialization is idempotent, append-only and browser-inaccessible', () => {
  assert.match(code, /create table public\.capital_ledger_initializations/);
  assert.match(code, /source text not null check \(source in \('ONBOARDING', 'BACKFILL'\)\)/);
  assert.match(code, /on conflict \(owner_id\) do nothing/);
  assert.match(code, /enable row level security/);
  assert.match(
    code,
    /revoke all privileges on table public\.capital_ledger_initializations from public, anon, authenticated/,
  );
  assert.match(
    code,
    /revoke insert, update, delete, truncate on table public\.capital_ledger_initializations from service_role/,
  );
  assert.doesNotMatch(code, /create policy[^;]*capital_ledger_initializations/i);
});

test('initialization happens on the first provisioning transition only', () => {
  assert.match(code, /after insert or update of provisioned_at on public\.profiles/);
  assert.match(
    code,
    /new\.provisioned_at is not null\s+and \(tg_op = 'INSERT' or old\.provisioned_at is null\)/,
  );
  assert.match(code, /perform public\.initialize_capital_ledger\(new\.id, 'ONBOARDING'\)/);
});

test('balance aggregation is exact, server-side and service-role only', () => {
  assert.match(code, /'available_atomic', s\.available::text/);
  assert.match(code, /left join public\.ledger_postings p on p\.account_id = a\.id/);
  assert.match(code, /a\.account_class = 'liability'/);
  for (const fn of [
    'initialize_capital_ledger\\(uuid, text\\)',
    'canonical_capital_balance_summary\\(uuid\\)',
  ]) {
    assert.match(
      code,
      new RegExp(`revoke all on function public\\.${fn} from public, anon, authenticated`),
    );
    assert.match(code, new RegExp(`grant execute on function public\\.${fn} to service_role`));
  }
  assert.doesNotMatch(code, /grant[^;]*\b(?:anon|authenticated)\b/);
});

test('the migration performs no backfill or data change of existing accounts', () => {
  assert.doesNotMatch(code, /insert into public\.capital_ledger_initializations[^;]*select/i);
  assert.doesNotMatch(code, /'BACKFILL'\)\s*from/i);
  assert.doesNotMatch(code, /^\s*(?:update|delete from)\s+public\./im);
});
