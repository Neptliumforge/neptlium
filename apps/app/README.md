# @neptlium/app

Authenticated customer application for `app.neptlium.com`.

> **Production remediation mode:** App is an interaction surface, not financial authority. It must consume canonical API state and must not infer or create money truth in the browser.

## Current architecture

Clerk is implemented in current source as the browser/session authority. Canonical Neptlium principal UUIDs remain the ownership identity. Existing Supabase-era accounts may still use the temporary dual-session bridge for identity continuity while the Supabase-to-Clerk cutover remains incomplete.

`apps/api` is the only intended customer product/financial data authority for ordinary application behavior.

## Current remediation constraints

The App must not:

- call legacy `process-withdraw`, `process-deposit`, or placeholder crypto paths as canonical financial operations;
- write financial/product tables directly through Supabase;
- manufacture balances, portfolio positions, treasury state, or transaction history when canonical data is missing;
- collapse approved/submitted/settled/reconciled states;
- receive service-role, provider, webhook, signing, or KMS secrets.

## Required completion work

App readiness depends on the execution ledger in `../../docs/15_PRODUCTION_READINESS_AUDIT.md` and requires:

- authoritative portfolio and treasury repositories instead of empty/stub responses;
- funding UX backed by the canonical funding lifecycle;
- withdrawal UX backed by governed transfer execution;
- durable ledger-backed activity/history;
- explicit `EMPTY`, `PENDING`, `UNAVAILABLE`, `FAILED`, and `NOT_CONFIGURED` states;
- existing-user and new-user Clerk flows proven in production-equivalent conditions;
- removal of ordinary Supabase Auth dependency after identity cutover.

## Identity transition

The temporary Supabase bridge exists only to prove that a legacy Supabase session and a Clerk session refer to the same stable principal. It must not become a long-term data access path.

## Environment

Clerk public/browser configuration and public site origins may be browser-safe. `NEPTLIUM_API_URL` and any server-only application configuration must remain appropriately scoped. Supabase service-role and provider credentials are forbidden in this app.

## Commands

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app test
pnpm --filter @neptlium/app build
```

Architecture: [`docs/02_AUTHENTICATED_APPLICATION.md`](../../docs/02_AUTHENTICATED_APPLICATION.md)  
Identity: [`docs/04_IDENTITY_AND_ACCESS.md`](../../docs/04_IDENTITY_AND_ACCESS.md)  
Execution ledger: [`docs/15_PRODUCTION_READINESS_AUDIT.md`](../../docs/15_PRODUCTION_READINESS_AUDIT.md)
