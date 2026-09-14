# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

## Authentication

Supabase Auth is the sole browser authentication and session authority.

- Shared Supabase SSR/browser clients own application identity context and session refresh.
- Protected customer routes require a valid Supabase session.
- `/auth/sign-in` and related account entry surfaces use the native Supabase Auth flow.
- Authenticated requests to `api.neptlium.com` use the current Supabase access token.
- Browser-safe Supabase configuration is limited to the project URL and publishable key; service-role credentials never belong in this application.

First authenticated entry provisions or resolves the stable Neptlium principal through the governed API boundary. Existing canonical ownership is preserved through the forward Supabase-auth cutover; new users receive normal account provisioning and continue to onboarding.

## Data boundary

`api.neptlium.com` is the customer product and financial authority consumed by this application. The server-only API client validates the current Supabase user/session, forwards the access token as a bearer token, adds request correlation, uses bounded timeouts, retries reads only, and never manufactures financial state.

Supabase Auth identifies the user. Neptlium server authorization determines what that user may do. Browser authentication never grants financial execution authority.

## Product truth

- Unknown is not zero.
- Pending is not settled.
- Provider observation is evidence, not canonical balance.
- Browser success is not financial execution.
- Consequential operations remain server-authorized, idempotent, audited, posted, and reconciled before they become canonical.

## Environment

See `.env.example`. Required identity variables are the browser-safe Supabase project URL and publishable key plus the canonical application/API origins.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app test
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md), [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md), and [`docs/16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](../../docs/16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).
