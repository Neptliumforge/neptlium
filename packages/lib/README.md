# @neptlium/lib

Shared runtime infrastructure for Neptlium applications.

The package exposes request-appropriate Supabase clients, role helpers, onboarding validation, notification utilities, and custody-provider abstractions. Service-role access is server-only; browser consumers must rely on publishable credentials and Row Level Security.

```sh
pnpm --filter @neptlium/lib typecheck
pnpm --filter @neptlium/lib lint
pnpm --filter @neptlium/lib build
```

Import supported APIs from `@neptlium/lib` or from the documented Supabase subpaths in `package.json`.
