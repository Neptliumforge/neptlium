# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

## CURRENT source architecture

- Clerk is the browser authentication/session authority in `apps/app` source.
- `ClerkProvider` owns the application auth context; `/auth/sign-in` and `/auth/sign-up` use Clerk components; `/dashboard` and `/onboarding` are protected by Clerk middleware.
- First authenticated entry flows through `/auth/complete`, which calls `POST /v1/auth/bootstrap` and resolves Neptlium account context before routing to onboarding or the provisioned dashboard.
- Existing Supabase-era accounts that are not yet linked to Clerk receive `link_required` and complete a one-time dual-session identity link before entering the account.
- `api.neptlium.com` is the only customer product/financial data authority consumed by this application.
- The server-only API client obtains the current Clerk session token, forwards it as a bearer token, adds a request ID, applies an eight-second timeout, retries GET requests once, and never automatically retries mutations.
- Overview, Portfolio, Capital Account, Treasury, Allocation, Capital Activity, notifications, documents, onboarding business state, account context, and role presentation are read through `apps/api`.
- Customer product mutations such as onboarding draft persistence and notification/document operations also cross `apps/api`.
- The only direct Supabase request in `apps/app` is the temporary existing-account identity bridge, which exchanges legacy credentials for a Supabase Auth session solely so `apps/api` can prove the old and new sessions refer to the same Neptlium principal. It does not query product tables or use privileged Supabase credentials.
- Circle-backed testnet Capital Account observation remains provider evidence and is kept separate from canonical financial state.
- Missing canonical state is returned explicitly by the API as `EMPTY`, `NOT_CONFIGURED`, `UNAVAILABLE`, or `PENDING`; the UI does not manufacture zero balances or numeric placeholders.

## CURRENT production schema state

The provider-independent identity foundation and Clerk application identity cutover have been applied to the production Supabase project.

- Existing profile UUIDs were preserved as canonical Neptlium principals.
- All 16 existing profiles have matching active principals and active legacy Supabase subject mappings.
- Public ownership/actor foreign keys have been re-parented from `auth.users` to `identity_principals` without changing the UUID values stored in those records.
- The existing-email bootstrap guard returns `link_required` instead of creating a second principal when a verified Clerk email already belongs to an existing account.
- No Clerk mapping is manufactured automatically; existing users must prove both sessions before the mapping is created.

Production runtime activation remains separate from schema readiness. App/Admin require valid Clerk runtime configuration, and API requires durable Supabase server credentials plus Clerk verification configuration and `API_AUTH_MODE=DUAL`. Missing runtime configuration must fail closed.

## Identity transition boundary

Existing Supabase-era profile UUIDs and every financial ownership/audit relationship remain canonical through the transition. Clerk authenticates the browser session; it does not become the canonical financial owner, role database, compliance authority, or ledger authority.

During the transition, the API may operate in `DUAL` mode only when both authentication paths are fully configured. Existing users can link their Clerk subject to the preserved principal by proving both their legacy Supabase session and their Clerk session. New verified emails may bootstrap a new stable principal after Clerk runtime is correctly configured.

`CLERK`-only mode is not production-certified until existing-user migration, new-user onboarding, operator access, recovery/MFA, webhook lifecycle, and authorization checks have all been exercised successfully in production.

## Supabase boundary

`apps/app` does not use Supabase as a product-data authority.

Supabase remains the production data platform behind `apps/api`. The temporary existing-account migration route may call Supabase Auth with a browser-safe publishable key to prove a legacy session, but it must not query or mutate financial/product tables, use Supabase Storage for customer documents, or receive the Supabase service-role key or provider credentials.

The browser is not the financial control plane, and modeling or UI status never proves execution.

## Environment

See `.env.example`.

Required application-side identity/runtime variables are Clerk configuration plus server-side `NEPTLIUM_API_URL` and `NEXT_PUBLIC_SITE_URL`. The optional transition variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are browser-safe and are used only by the one-time legacy identity bridge. This app must never receive the Supabase service-role key, provider secrets, or other privileged financial credentials.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app test
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md) and [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md).
