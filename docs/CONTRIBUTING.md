# Contributing to NEPTLIUM — Production Remediation Mode

NEPTLIUM is currently executing the production-remediation plan in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

## Before making changes

1. Read root `AGENTS.md`.
2. Read the active execution ledger.
3. Read the domain document for the subsystem you will change.
4. Inspect current `origin/main`, overlapping pull requests, tests, migrations, and live state where relevant and authorized.
5. Identify which remediation gate the change closes or supports.

## Scope

Prefer work that closes the next open remediation gate. Do not mix unrelated feature work, broad refactors, visual cleanup, or speculative provider expansion into production-remediation changes.

## Financial changes

For any money, provider, identity, ledger, or reconciliation change:

- preserve durable/idempotent state transitions;
- fail closed on missing auth/policy/evidence/configuration;
- do not add browser/direct-Supabase financial authority;
- do not expose secrets;
- include positive, negative, replay/idempotency, and failure-path tests as applicable;
- record runtime/durable evidence before declaring the gate complete.

## Validation

Run the relevant workspace checks plus repository-level checks required by the change. Report checks as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`.

A merged change is not automatically a completed remediation gate. Update `docs/15_PRODUCTION_READINESS_AUDIT.md` only when the gate's implementation, deployment/configuration, runtime exercise, and evidence requirements are satisfied.

## Documentation

While any remediation gate remains open, documentation stays in execution mode. After all gates close, README, `AGENTS.md`, and current docs will be rewritten again to describe the final production system.
