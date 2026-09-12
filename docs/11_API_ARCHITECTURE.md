# NEPTLIUM API Architecture — Remediation Mode

## API authority

`apps/api` is the privileged execution boundary. App/Admin may request actions; the API determines whether they are authenticated, authorized, policy-compliant, durable, idempotent, auditable, and safe to execute.

## Required production responsibilities

The API must own or coordinate:

- Clerk/session verification and principal resolution;
- role/compliance/ownership authorization;
- durable command creation;
- idempotency and request identity;
- capital reservation and approval enforcement;
- provider submission and durable provider-reference persistence;
- provider webhook ingestion/processing;
- settlement evidence;
- canonical ledger posting;
- reconciliation;
- explicit error/failure/retry states;
- observability and audit events.

## Current remediation boundary

The API already contains substantial contracts and newer financial-domain logic, but production readiness remains open because legacy Edge Functions can still bypass it and the canonical financial lifecycle has not yet been exercised end-to-end.

## Prohibited architecture

Do not allow:

- browser -> Supabase financial-table writes;
- Admin -> direct privileged workflow mutation when an API command should exist;
- Edge Function -> `transactions`/`portfolios` mutation as canonical money movement;
- provider response -> immediate settled/available user state;
- in-memory/process-local state as production financial authority.

## Error semantics

Financial endpoints must fail closed when authentication, ownership, provider capability, durable persistence, policy, evidence, or reconciliation prerequisites are missing.

Unknown provider outcome must be represented as unknown/recoverable—not converted into success or safe retry without idempotency evidence.

## Validation

API remediation requires mandatory tests for:

- auth/authorization;
- idempotency/replay;
- provider contracts;
- webhook verification/deduplication;
- ledger invariants;
- reconciliation;
- failure/retry/crash windows;
- customer/admin E2E paths.

The authoritative order is in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

## Final rewrite

After all remediation gates close, rewrite this document with the final route catalog, authentication mode, provider orchestration, worker model, deployment/runtime contract, and operational SLOs.
