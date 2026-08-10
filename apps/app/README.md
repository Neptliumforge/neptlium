# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

## CURRENT

- Supabase Auth sessions, server guards, onboarding, roles, and RLS-backed data access.
- Server-only bearer-token client for `api.neptlium.com`.
- Overview, Portfolio, Capital Account, Treasury, and Allocation product groundwork.
- Circle-backed testnet Capital Account observation through the API where configured.
- Honest unavailable/pending states for incomplete financial capabilities.

Clerk identity and Stripe funding/Onramp are TARGET only. The browser is not the financial control plane, and modeling or UI status never proves execution.

## Environment

See `.env.example`. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` are browser-safe configuration. `NEPTLIUM_API_URL` is server-side API routing. This app must not receive the Supabase service-role key or provider secrets.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md) and [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md).
