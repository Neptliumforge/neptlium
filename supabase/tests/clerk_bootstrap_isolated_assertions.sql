\set ON_ERROR_STOP on
begin;
select set_config('search_path','public',true);
do $$
declare
  v_new jsonb;
  v_repeat jsonb;
  v_collision jsonb;
  v_subject text := 'user_1234567890ABCDEF';
  v_count integer;
begin
  v_new := public.bootstrap_clerk_identity_principal(v_subject,'new@example.test','request_123456789012345');
  if v_new->>'status' <> 'created' then raise exception 'new identity not created: %',v_new; end if;
  v_repeat := public.bootstrap_clerk_identity_principal(v_subject,'new@example.test','request_123456789012345');
  if v_repeat->>'status' <> 'existing' or v_repeat->>'profile_id' <> v_new->>'profile_id' then
    raise exception 'subject replay not idempotent';
  end if;
  select count(*) into v_count from public.identity_events where principal_id=(v_new->>'profile_id')::uuid;
  if v_count <> 2 then raise exception 'expected exactly two audit events, got %',v_count; end if;
  v_collision := public.bootstrap_clerk_identity_principal('user_ABCDEF1234567890','NEW@EXAMPLE.TEST','request_123456789012346');
  if v_collision <> '{"status":"link_required"}'::jsonb then
    raise exception 'email collision must deny without leaking principal: %',v_collision;
  end if;
  if exists (select 1 from public.identity_provider_subjects where provider_subject='user_ABCDEF1234567890') then
    raise exception 'email collision linked a foreign subject';
  end if;
  update public.identity_provider_subjects set status='REVOKED' where provider_subject=v_subject;
  begin
    perform public.bootstrap_clerk_identity_principal(v_subject,'new@example.test','request_123456789012347');
    raise exception 'revoked subject was accepted';
  exception when others then
    if sqlerrm = 'revoked subject was accepted' then raise; end if;
  end;
end
$$;
rollback;
select case when has_function_privilege('anon','public.bootstrap_clerk_identity_principal(text,text,text)','EXECUTE')
  or has_function_privilege('authenticated','public.bootstrap_clerk_identity_principal(text,text,text)','EXECUTE')
  then 1/0 else 1 end as privileges_restricted;
