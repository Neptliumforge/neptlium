# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

## Authentication

Clerk is the sole browser authentication, session, recovery, and MFA authority.

- `ClerkProvider` owns the application identity context.
- Clerk middleware protects `/dashboard` and `/onboarding`.
- `/auth/sign-in` and `/auth/sign-up` use Clerk components.
- Authenticated requests to `api.neptlium.com` use the current Clerk bearer token.
- The application does not create, refresh, validate, or link Supabase Auth sessions.
- No Supabase URL, publishable key, password endpoint, cookie session, or legacy account-linking UI is part of the customer authentication flow.

First authenticated entry calls `POST /v1/auth/bootstrap`. The API resolves the verified Clerk subject to a stable Neptlium principal. Existing accounts are preserved through the forward Clerk-only identity cutover migration; new users receive a new principal and continue to onboarding.

## Data boundary

`api.neptlium.com` is the customer product and financial authority consumed by this application. The server-only API client obtains the current Clerk session token, forwards it as a bearer token, adds request correlation, uses bounded timeouts, retries reads only, and never manufactures financial state.

Supabase may remain behind `apps/api` as server-side persistence infrastructure. It is not an authentication provider for this application and no Supabase service-role or browser key belongs in `apps/app`.

## Product truth

- Unknown is not zero.
- Pending is not settled.
- Provider observation is evidence, not canonical balance.
- Browser success is not financial execution.
- Consequential operations remain server-authorized, idempotent, audited, posted, and reconciled before they become canonical.

## Environment

See `.env.example`. Required identity variables are Clerk configuration only, plus the canonical application/API origins.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app test
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md), [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md), and [`docs/16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](../../docs/16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).
