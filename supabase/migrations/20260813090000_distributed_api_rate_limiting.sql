-- Distributed, fail-closed API rate limiting for horizontally scaled runtimes.
create table public.api_rate_limits (
  key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms integer
) returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window interval;
  v_count integer;
  v_started timestamptz;
begin
  if p_key is null or length(p_key) <> 64 or p_key !~ '^[0-9a-f]+$' then
    raise exception 'invalid rate-limit key';
  end if;
  if p_limit < 1 or p_limit > 10000 or p_window_ms < 1000 or p_window_ms > 3600000 then
    raise exception 'invalid rate-limit policy';
  end if;

  v_window := make_interval(secs => p_window_ms::double precision / 1000.0);
  perform pg_advisory_xact_lock(hashtextextended(p_key, 0));

  select request_count, window_started_at
    into v_count, v_started
    from public.api_rate_limits
    where key = p_key
    for update;

  if not found or v_started + v_window <= v_now then
    insert into public.api_rate_limits(key, window_started_at, request_count, updated_at)
      values (p_key, v_now, 1, v_now)
      on conflict (key) do update
        set window_started_at = excluded.window_started_at,
            request_count = 1,
            updated_at = excluded.updated_at;
    return query select true, p_limit - 1, v_now + v_window;
    return;
  end if;

  v_count := v_count + 1;
  update public.api_rate_limits
    set request_count = v_count, updated_at = v_now
    where key = p_key;
  return query select v_count <= p_limit, greatest(p_limit - v_count, 0), v_started + v_window;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to service_role;
