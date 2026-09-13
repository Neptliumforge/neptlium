-- Gate 05: browser database roles retain read projections only on legacy
-- financial tables. Canonical writes belong to governed server authorities.

revoke all privileges on table public.transactions from anon, authenticated;
revoke all privileges on table public.portfolios from anon, authenticated;
revoke all privileges on table public.holdings from anon, authenticated;
revoke all privileges on table public.subscriptions from anon, authenticated;

grant select on table public.transactions to anon, authenticated;
grant select on table public.portfolios to anon, authenticated;
grant select on table public.holdings to anon, authenticated;
grant select on table public.subscriptions to anon, authenticated;
