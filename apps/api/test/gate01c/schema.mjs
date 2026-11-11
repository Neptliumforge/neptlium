import { readFile } from 'node:fs/promises';
import { newDatabase, sql, handle, loadSql } from './isolation.mjs';
export const dependencies='/tmp/neptlium-gate01c/dependencies';
export const foundation=[
  '20260811161123_production_funding_treasury_transfer_foundation.sql',
  '20260811161216_governed_financial_operations.sql',
  '20260811161300_transfer_reconciliation_hardening.sql',
  '20260811161413_omnibus_treasury_funding_model.sql',
  '20260908091732_provider_webhook_control_plane.sql',
  '20260913024025_webhook_disposition_evidence.sql',
];
export async function combined({harden=true}={}) {
  const name=await newDatabase(harden?'combined':'negativecontrol');const db=handle(name);
  await sql(name,await loadSql(`${dependencies}/134/supabase/test/profile-authority/fixture.sql`),'profile_prerequisite_fixture');
  await sql(name,`alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    alter default privileges in schema public grant all on functions to anon,authenticated,service_role;
    create type public.subscription_plan as enum('free','pro','elite');
    create type public.subscription_status as enum('active','canceled','past_due','trialing','incomplete');
    create table public.subscriptions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),
      plan public.subscription_plan not null default 'free',status public.subscription_status not null default 'active',
      stripe_customer_id text,stripe_subscription_id text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
    alter table public.subscriptions enable row level security;
    create policy subscriptions_select_own on public.subscriptions for select to authenticated using(auth.uid()=user_id);
  `,'synthetic_subscription_prerequisites');
  for(const file of foundation) await sql(name,await readFile(new URL(`../../../../supabase/migrations/${file}`,import.meta.url),'utf8'),file);
  for(const file of ['20261021190000_contain_profile_browser_write_authority.sql','20261021191000_onboarding_preserves_account_standing.sql'])
    await sql(name,await loadSql(`${dependencies}/134/supabase/migrations/${file}`),file);
  await sql(name,await loadSql(`${dependencies}/137/supabase/migrations/20261021200000_canonical_capital_ledger_initialization.sql`),'pr137_initialization');
  if(harden) for(const file of ['dependency-hardening.sql','webhook-fencing.sql','ledger-hardening.sql'])
    await sql(name,await readFile(new URL(`../../../../docs/engineering/proposals/gate-01b/${file}`,import.meta.url),'utf8'),file);
  return {name,db};
}
