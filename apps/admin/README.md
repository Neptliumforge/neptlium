# @neptlium/admin

Role-gated internal operations console for `admin.neptlium.com`.

## Authentication and authorization

Clerk is the sole operator authentication, session, recovery, and MFA authority. Admin server code obtains the current Clerk session and sends its bearer token to `api.neptlium.com`.

The API resolves the Clerk subject to a stable Neptlium principal and then applies Neptlium-owned role, organization, policy, ownership, and operation-specific authorization. A Clerk session alone never authorizes an administrative or financial action.

Supabase is not an operator authentication provider. Where Supabase is used by the API, it is server-side persistence infrastructure only and service-role credentials never reach the browser.

## Environment

See `.env.example`. The Admin application requires Clerk configuration plus `NEPTLIUM_API_URL` and `NEXT_PUBLIC_SITE_URL`. Provider and database service credentials remain server-side in the API boundary.

## Commands

```sh
pnpm --filter @neptlium/admin dev
pnpm --filter @neptlium/admin typecheck
pnpm --filter @neptlium/admin lint
pnpm --filter @neptlium/admin build
```

Architecture: [`docs/12_ADMIN_OPERATIONS.md`](../../docs/12_ADMIN_OPERATIONS.md) and [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md).
