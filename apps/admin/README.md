# @neptlium/admin

Role-gated internal operations console for `admin.neptlium.com`.

## CURRENT

Supabase Auth, server guards, service-role data access, and role thresholds protect screens for users, allocations, deposits, withdrawals, transactions, security, and capabilities. Some actions update legacy workflow status directly.

Database status changes do not prove provider execution, balanced ledger posting, settlement, or reconciliation. These controls remain operational metadata until migrated to governed API commands.

## Environment

See `.env.example`. Supabase URL/publishable key and site URL are browser-safe. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never reach client components, logs, or tracked files.

## Commands

```sh
pnpm --filter @neptlium/admin dev
pnpm --filter @neptlium/admin typecheck
pnpm --filter @neptlium/admin lint
pnpm --filter @neptlium/admin build
```

Clerk is TARGET identity architecture only; no Clerk implementation exists.

Architecture: [`docs/12_ADMIN_OPERATIONS.md`](../../docs/12_ADMIN_OPERATIONS.md).
