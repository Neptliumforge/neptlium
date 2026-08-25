# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

## CURRENT source architecture

- Clerk is the browser authentication/session authority in `apps/app` source.
- `ClerkProvider` owns the application auth context; `/auth/sign-in` and `/auth/sign-up` use Clerk components; `/dashboard` and `/onboarding` are protected by Clerk middleware.
- First authenticated entry flows through `/auth/complete`, which calls `POST /v1/auth/bootstrap` and resolves Neptlium account context before routing to onboarding or the provisioned dashboard.
- `api.neptlium.com` is the only customer product/financial data authority consumed by this application.
- The server-only API client obtains the current Clerk session token, forwards it as a bearer token, adds a request ID, applies an eight-second timeout, retries GET requests once, and never automatically retries mutations.
- Overview, Portfolio, Capital Account, Treasury, Allocation, Capital Activity, notifications, documents, onboarding business state, account context, and role presentation are read through `apps/api`.
- Customer product mutations such as onboarding draft persistence and notification/document operations also cross `apps/api`.
- Circle-backed testnet Capital Account observation remains provider evidence and is kept separate from canonical financial state.
- Missing canonical state is returned explicitly by the API as `EMPTY`, `NOT_CONFIGURED`, `UNAVAILABLE`, or `PENDING`; the UI does not manufacture zero balances or numeric placeholders.

## Production transition boundary

Source implementation does not by itself prove production identity cutover.

Production remains in a mixed identity state until the provider-independent identity migrations, App/Admin Clerk runtime configuration, API durable Supabase configuration, and compatible API auth mode are all verified together. The API must not be switched to `DUAL` or `CLERK` against a schema that lacks the provider-independent principal and provider-subject mappings.

Existing Supabase-era profile UUIDs and every financial ownership/audit relationship must be preserved through the transition. Clerk authenticates the browser session; it does not become the canonical financial owner, role database, compliance authority, or ledger authority.

## Supabase boundary

`apps/app` does not use the Supabase browser SDK for customer authentication or product data.

Supabase remains the production data platform behind `apps/api` and may still contain the active legacy authentication schema and identity coupling until the reviewed migrations are applied. `apps/app` must not query or mutate financial/product tables directly, use Supabase Storage directly for customer documents, or receive privileged Supabase/provider credentials.

The browser is not the financial control plane, and modeling or UI status never proves execution.

## Environment

See `.env.example`.

Required application-side identity/runtime variables are Clerk configuration plus server-side `NEPTLIUM_API_URL` and `NEXT_PUBLIC_SITE_URL`. This app must never receive the Supabase service-role key, provider secrets, or other privileged financial credentials.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app test
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md) and [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md).
