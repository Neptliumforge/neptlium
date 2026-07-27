# @neptlium/admin

Internal operations console for authorized Neptlium staff.

The Next.js application uses the shared Supabase backend and `@neptlium/*` packages. It is operational tooling, not customer navigation. Access must remain role-gated and service-role operations must stay server-only.

```sh
pnpm --filter @neptlium/admin dev
pnpm --filter @neptlium/admin typecheck
pnpm --filter @neptlium/admin lint
```
