begin;

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000041','gate02f-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000042','gate02f-b@example.invalid');
insert into public.organizations (owner_id, name) values
  ('00000000-0000-4000-8000-000000000041','Gate 02F tenant A'),
  ('00000000-0000-4000-8000-000000000042','Gate 02F tenant B');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000041', true);
do $$
begin
  if (select count(*) from public.organizations where name like 'Gate 02F tenant %') <> 1
     or exists (select from public.organizations where name = 'Gate 02F tenant B') then
    raise exception 'organization RLS did not isolate customer fixtures';
  end if;
end $$;
reset role;

do $$
declare
  owner_a constant uuid := '00000000-0000-4000-8000-000000000041';
  owner_b constant uuid := '00000000-0000-4000-8000-000000000042';
  source constant uuid := '00000000-0000-4000-8000-000000000043';
  debit_account uuid;
  credit_account uuid;
  foreign_account uuid;
  postings jsonb;
  journal uuid;
  table_name text;
begin
  foreach table_name in array array[
    'identity_provider_subjects', 'organization_memberships', 'treasury_destinations',
    'ledger_accounts', 'ledger_journals', 'ledger_postings', 'funding_intents'
  ] loop
    if not (select relrowsecurity from pg_class where oid = ('public.' || table_name)::regclass)
       or has_table_privilege('anon','public.' || table_name,'SELECT')
       or has_table_privilege('authenticated','public.' || table_name,'SELECT') then
      raise exception 'unexpected RLS or read grants on %', table_name;
    end if;
  end loop;
  if has_function_privilege('authenticated','public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb)','EXECUTE')
     or not has_function_privilege('service_role','public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb)','EXECUTE') then
    raise exception 'unexpected ledger posting authority';
  end if;

  begin
    insert into public.treasury_destinations
      (environment, asset, network, destination_type, controller_type, custody_model, address,
       normalized_address, address_format, status)
    values ('test','USDC','base','custody_wallet','neptlium','self_custody',
      '0x1111111111111111111111111111111111111111','0x1111111111111111111111111111111111111111','evm','active');
    raise exception 'unverified wallet became active';
  exception when check_violation then null;
  end;

  insert into public.funding_intents (owner_id, asset, rail, environment, idempotency_key, request_digest)
    values (owner_a,'USDC','fixture','test','gate02f-duplicate','fixture');
  begin
    insert into public.funding_intents (owner_id, asset, rail, environment, idempotency_key, request_digest)
      values (owner_a,'USDC','fixture','test','gate02f-duplicate','fixture');
    raise exception 'duplicate funding identity was accepted';
  exception when unique_violation then null;
  end;

  insert into public.ledger_accounts (owner_id, account_code, asset, account_class)
    values (owner_a,'fixture:debit','USDC','asset') returning id into debit_account;
  insert into public.ledger_accounts (owner_id, account_code, asset, account_class)
    values (owner_a,'fixture:credit','USDC','liability') returning id into credit_account;
  insert into public.ledger_accounts (owner_id, account_code, asset, account_class)
    values (owner_b,'fixture:credit','USDC','liability') returning id into foreign_account;
  postings := jsonb_build_array(
    jsonb_build_object('account_id',debit_account,'asset','USDC','direction','debit','amount_atomic',5),
    jsonb_build_object('account_id',credit_account,'asset','USDC','direction','credit','amount_atomic',5)
  );
  begin
    perform public.post_balanced_journal(owner_a,'fixture',source,'gate02f',null,
      jsonb_set(postings,'{1,account_id}',to_jsonb(foreign_account)));
    raise exception 'cross-owner ledger posting was accepted';
  exception when raise_exception then
    if sqlerrm not like 'invalid ledger account, ownership%' then raise; end if;
  end;
  begin
    perform public.post_balanced_journal(owner_a,'fixture',source,'gate02f',null,
      jsonb_set(postings,'{1,amount_atomic}','4'::jsonb));
    raise exception 'unbalanced ledger posting was accepted';
  exception when raise_exception then
    if sqlerrm not like 'unbalanced journal%' then raise; end if;
  end;
  journal := public.post_balanced_journal(owner_a,'fixture',source,'gate02f',null,postings);
  if (select count(*) from public.ledger_postings where journal_id = journal) <> 2 then
    raise exception 'balanced journal did not persist both postings';
  end if;
  begin
    perform public.post_balanced_journal(owner_a,'fixture',source,'gate02f',null,postings);
    raise exception 'duplicate journal source was accepted';
  exception when unique_violation then null;
  end;
end $$;

rollback;
