# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

## CURRENT

- Supabase Auth remains the current session/identity mechanism.
- `api.neptlium.com` is the only customer product/financial data authority consumed by this application.
- The server-only API client validates the current Supabase session, forwards its bearer token, adds a request ID, applies an eight-second timeout, retries GET requests once, and never automatically retries mutations.
- Overview, Portfolio, Capital Account, Treasury, Allocation, Capital Activity, notifications, documents, onboarding business state, account context, and role presentation are read through `apps/api`.
- Customer product mutations such as onboarding draft persistence and notification/document operations also cross `apps/api`.
- Circle-backed testnet Capital Account observation remains provider evidence and is kept separate from canonical financial state.
- Missing canonical state is returned explicitly by the API as `EMPTY`, `NOT_CONFIGURED`, `UNAVAILABLE`, or `PENDING`; the UI does not manufacture zero balances or numeric placeholders.

## Supabase exception

Direct Supabase usage in `apps/app` is temporary and limited to the current authentication/session system where the Supabase Auth SDK is required, including sign-in/sign-up, OTP/session exchange, password recovery/update, MFA, session revocation, bearer-token extraction, and closely coupled session-security recording.

`apps/app` must not query or mutate financial/product tables directly, use Supabase Storage directly for customer documents, or receive privileged Supabase/provider credentials. Those operations belong behind `apps/api`.

Clerk identity and additional funding providers are TARGET only. The browser is not the financial control plane, and modeling or UI status never proves execution.

## Environment

See `.env.example`. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` are browser-safe authentication configuration. `NEPTLIUM_API_URL` is server-side API routing. This app must not receive the Supabase service-role key or provider secrets.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app test
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md) and [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md).
