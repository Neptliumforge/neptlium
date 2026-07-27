# @neptlium/admin

Role-gated internal operations console deployed separately at `https://admin.neptlium.com` with Vercel root `apps/admin`. It is not customer navigation. Supabase server authorization and RLS remain mandatory; service-role use must be server-only and narrowly scoped.

```sh
pnpm --filter @neptlium/admin dev
pnpm --filter @neptlium/admin typecheck
pnpm --filter @neptlium/admin lint
pnpm --filter @neptlium/admin build
```

Browser-safe variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. Server-only variable: `SUPABASE_SERVICE_ROLE_KEY`. Missing provider credentials do not block frontend deployment; Coinbase CDP and Alchemy integrations are not complete. Never fabricate financial or provider states.
