# NEPTLIUM Platform Architecture — Remediation Mode

## Canonical production architecture

NEPTLIUM must converge on one financial authority chain:

```text
Web/App/Admin
  -> API authentication + authorization
  -> durable domain command
  -> canonical database state
  -> provider execution/observation
  -> authenticated provider event
  -> settlement evidence
  -> canonical ledger
  -> reconciliation
  -> user/operator projection
```

Anything that bypasses this chain is transitional or legacy and must lose production authority.

## Surface boundaries

### Web
Public information only. It never owns identity, financial state, provider execution, or privileged credentials.

### App
Customer interaction surface. It consumes canonical API projections and issues authenticated commands through the API. It must not write financial tables directly.

### Admin
Operator surface. Privileged actions must flow through governed API commands with role checks, step-up controls where required, reason/audit capture, and durable state transitions.

### API
Primary trust boundary. It owns command validation, ownership, role/policy enforcement, idempotency, provider isolation, durable orchestration, ledger interaction, and reconciliation.

### Supabase
Persistent production data-plane. New financial authority tables should remain server-only/default-deny to browser roles unless a reviewed exception exists.

### Providers
Circle, Stripe, Alchemy, and future providers are external execution/evidence systems. Their responses do not become canonical accounting truth until persisted, validated, linked, posted, and reconciled.

## Current production transition

The newer canonical schema is deployed, but legacy Supabase Edge Functions remain active and the canonical financial tables had not processed a production lifecycle at the 2026-09-12 audit. Therefore architecture is in transition rather than complete.

Legacy paths to eliminate or contain include:

- direct withdrawal completion through `process-withdraw`;
- direct deposit/balance mutation through `process-deposit`;
- direct Stripe webhook writes to legacy transaction/portfolio tables;
- placeholder crypto webhook behavior;
- client-side financial transaction creation;
- Admin workflow writes that bypass governed API commands.

## Required execution sequence

Architecture work follows gates 01-16 in `docs/15_PRODUCTION_READINESS_AUDIT.md`. Do not add a second financial authority path to solve a missing capability.

## Failure model

All irreversible external effects must be recoverable from durable state. In particular, provider acceptance followed by local persistence failure must not permit an unknown or duplicate transfer. Idempotency keys, provider references, webhook dedupe, and reconciliation must close this gap.

## Final architecture rewrite

After all remediation gates are complete, rewrite this document again to reflect only the final deployed production architecture and mark all retired legacy paths as historical.
