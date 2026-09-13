# @neptlium/admin

Role-gated internal operations console for `admin.neptlium.com`.

## Authentication and authorization

Supabase Auth is the sole operator authentication and session authority. Admin browser code uses the shared Supabase browser client; server code validates the current Supabase session and sends its bearer token to `api.neptlium.com`.

The API resolves the Supabase Auth subject to a stable Neptlium principal and then applies Neptlium-owned role, organization, policy, ownership, and operation-specific authorization. An authenticated session alone never authorizes an administrative or financial action.

Administrative authority remains explicit and server-owned. Browser role state, email identity, and user-editable metadata are never sufficient authorization.

## Environment

See `.env.example`. The Admin application requires the browser-safe Supabase project URL and publishable key plus `NEPTLIUM_API_URL` and `NEXT_PUBLIC_SITE_URL`. Provider, database service-role, and signing credentials remain server-side in the API boundary.

## Commands

```sh
pnpm --filter @neptlium/admin dev
pnpm --filter @neptlium/admin typecheck
pnpm --filter @neptlium/admin lint
pnpm --filter @neptlium/admin build
```

Architecture: [`docs/12_ADMIN_OPERATIONS.md`](../../docs/12_ADMIN_OPERATIONS.md) and [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md).
