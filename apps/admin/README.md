# @neptlium/admin

Internal governed operations console for `admin.neptlium.com`.

> **Production remediation mode:** Admin is not allowed to treat direct database status mutation as financial execution. Privileged financial commands must converge on `apps/api` and the canonical ledger/reconciliation lifecycle.

## Current authority

Admin exists for operator visibility, approvals, exception handling, security review, and auditability. Clerk is present in current source architecture; legacy documentation that describes Clerk as unimplemented is obsolete.

Some legacy direct Supabase workflow mutation code still exists behind fail-closed guards. That code is transitional and must be removed or migrated to API-backed governance before production completion.

## Required remediation

Admin work must support the execution ledger in `../../docs/15_PRODUCTION_READINESS_AUDIT.md`, especially:

- no direct financial-table mutation authority;
- no manual status change that impersonates provider submission/settlement/reconciliation;
- server-side principal/role/compliance authorization;
- separation of duties for governed transfer approval;
- operator visibility into provider references, webhook state, settlement evidence, journals, reconciliation, discrepancy codes, request IDs, and audit history;
- complete Clerk operator-access certification before Supabase Auth retirement.

## Data path

Target production path:

```text
Admin -> Neptlium API -> governed command -> provider/ledger/reconciliation -> audited projection
```

Not:

```text
Admin browser -> direct Supabase financial mutation
```

## Environment

Browser-safe identity/public origin values may be exposed intentionally. Supabase service-role credentials, provider secrets, webhook secrets, and signing/KMS material are server-only and must never reach client code or logs.

## Commands

```sh
pnpm --filter @neptlium/admin dev
pnpm --filter @neptlium/admin typecheck
pnpm --filter @neptlium/admin lint
pnpm --filter @neptlium/admin test
pnpm --filter @neptlium/admin build
```

Architecture: [`docs/12_ADMIN_OPERATIONS.md`](../../docs/12_ADMIN_OPERATIONS.md)  
Execution ledger: [`docs/15_PRODUCTION_READINESS_AUDIT.md`](../../docs/15_PRODUCTION_READINESS_AUDIT.md)
