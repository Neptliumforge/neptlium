-- FORWARD-ONLY PROPOSAL. Not a runnable migration entrypoint. No execution authorized.
-- Review against live catalogs and PRs #134/#137 before assigning a migration version.
begin;
revoke all on public.ledger_accounts, public.ledger_journals, public.ledger_postings
  from public, anon, authenticated, service_role;
grant select on public.ledger_accounts, public.ledger_journals, public.ledger_postings to service_role;

create or replace function public.post_balanced_journal(
  p_owner_id uuid, p_source_type text, p_source_id uuid, p_request_id text,
  p_reversal_of uuid, p_postings jsonb
) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare journal uuid;
begin
  if p_owner_id is null or p_source_id is null or nullif(trim(p_source_type),'') is null
     or nullif(trim(p_request_id),'') is null then raise exception 'journal identity incomplete'; end if;
  if jsonb_typeof(p_postings) is distinct from 'array' then raise exception 'postings must be an array'; end if;
  if jsonb_array_length(p_postings) not between 2 and 500 then raise exception 'invalid posting count'; end if;
  -- Validate text before casting. No fractional/exponent/negative/null amounts and no rounding.
  if exists(select 1 from jsonb_array_elements(p_postings) p
    where jsonb_typeof(p) is distinct from 'object'
       or coalesce(p->>'amount_atomic','') !~ '^[1-9][0-9]{0,77}$'
       or coalesce(p->>'direction','') not in ('debit','credit')
       or nullif(p->>'account_id','') is null or nullif(p->>'asset','') is null)
    then raise exception 'invalid integer posting'; end if;
  if exists(select 1 from jsonb_array_elements(p_postings) p
    left join public.ledger_accounts a on a.id=(p->>'account_id')::uuid
    where a.id is null or
      (a.owner_id is distinct from p_owner_id and not
        (a.owner_id is null and a.account_class='asset' and a.account_code like 'treasury:%'))
      or a.asset is distinct from p->>'asset' or coalesce(a.network,'') is distinct from coalesce(p->>'network',''))
    then raise exception 'posting ownership or asset/network mismatch'; end if;
  if exists(select 1 from jsonb_array_elements(p_postings) p
    group by p->>'asset',coalesce(p->>'network','')
    having sum(case when p->>'direction'='debit' then (p->>'amount_atomic')::numeric else -(p->>'amount_atomic')::numeric end) <> 0)
    then raise exception 'unbalanced journal by asset and network'; end if;
  if p_reversal_of is not null and not exists(select 1 from public.ledger_journals
    where id=p_reversal_of and owner_id=p_owner_id) then raise exception 'invalid reversal owner'; end if;
  insert into public.ledger_journals(owner_id,source_type,source_id,request_id,reversal_of)
    values(p_owner_id,p_source_type,p_source_id,p_request_id,p_reversal_of) returning id into journal;
  insert into public.ledger_postings(journal_id,account_id,direction,amount_atomic,asset)
    select journal,(p->>'account_id')::uuid,p->>'direction',(p->>'amount_atomic')::numeric,p->>'asset'
      from jsonb_array_elements(p_postings) p;
  return journal;
end $$;
revoke all on function public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb) to service_role;

-- Defense in depth: every committed journal has >=2 postings and balances by account network.
create function public.assert_canonical_journal_balance_v2() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare journal uuid;
begin
  if tg_table_name='ledger_journals' then journal := new.id; else journal := new.journal_id; end if;
  if (select count(*) from public.ledger_postings where journal_id=journal) < 2 then
    raise exception 'empty or incomplete canonical journal'; end if;
  if exists(select 1 from public.ledger_postings p join public.ledger_accounts a on a.id=p.account_id
    where p.journal_id=journal and p.asset is distinct from a.asset) then raise exception 'posting asset mismatch'; end if;
  if exists(select 1 from public.ledger_postings p join public.ledger_accounts a on a.id=p.account_id
    where p.journal_id=journal group by a.asset,coalesce(a.network,'')
    having sum(case when p.direction='debit' then p.amount_atomic else -p.amount_atomic end) <> 0)
    then raise exception 'unbalanced canonical journal'; end if;
  return null;
end $$;
revoke all on function public.assert_canonical_journal_balance_v2() from public,anon,authenticated,service_role;
create constraint trigger canonical_journal_balance_v2 after insert on public.ledger_journals
  deferrable initially deferred for each row execute function public.assert_canonical_journal_balance_v2();
create constraint trigger canonical_posting_balance_v2 after insert on public.ledger_postings
  deferrable initially deferred for each row execute function public.assert_canonical_journal_balance_v2();
commit;
