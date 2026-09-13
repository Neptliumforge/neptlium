-- Gate 05: remove legacy/browser financial mutation authorities.
-- Preserve read access and canonical server-side authorities; remove only the
-- confirmed competing write paths discovered in production.

-- Browser clients must not create canonical transactions directly.
drop policy if exists "User can create transaction" on public.transactions;
revoke insert, update, delete on table public.transactions from anon, authenticated;

-- Browser clients must not mutate canonical portfolio totals/state directly.
drop policy if exists portfolios_update_own on public.portfolios;
revoke insert, update, delete on table public.portfolios from anon, authenticated;

-- The legacy calculate-yield Edge Function manufactured synthetic portfolio
-- value and was invoked by an active pg_cron job. Remove the schedule without
-- deleting historical cron evidence or changing unrelated scheduled work.
do $$
declare
  v_job record;
begin
  for v_job in
    select jobid
      from cron.job
     where jobname = 'calculate-yield-daily'
  loop
    perform cron.unschedule(v_job.jobid);
  end loop;
end;
$$;
