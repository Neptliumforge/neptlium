# NEPTLIUM Capital Account — Remediation Mode

## Authority

The Capital Account is canonical only when balances and availability derive from durable funding state, settlement evidence, ledger postings, and reconciliation. Legacy `portfolios.total_value`, legacy transaction rows, or provider observations are not sufficient authority.

## Canonical funding lifecycle

```text
funding intent
  -> provider route/submission or on-chain observation
  -> authenticated provider event
  -> provider confirmation
  -> durable settlement evidence
  -> pending ledger posting
  -> reconciliation
  -> available capital
```

Availability must never precede reconciliation.

## Current production state

At the 2026-09-12 audit, the canonical funding tables had not processed a production lifecycle. Legacy deposit/Stripe paths remained deployed and could mutate legacy transaction/portfolio data directly. Therefore funding is not production-certified.

## Required remediation

Capital Account readiness depends on gates 03, 04, 05, 06, 08, 09, 11, 12, 13, and 14 in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

The implementation must prove:

- deterministic deposit attribution;
- provider event authentication and dedupe;
- exact asset/network/atomic amount matching;
- durable settlement evidence;
- only-once ledger credit;
- matched reconciliation before availability;
- omnibus backing after state transitions;
- explicit handling for duplicate events, delayed events, unsupported assets, wrong routes, and provider failure.

## Legacy prohibition

Do not extend or rely on:

- `process-deposit` direct transaction/portfolio mutation;
- Stripe webhook direct balance mutation;
- UI-computed balances;
- missing-data-as-zero behavior.

## Final rewrite

After the controlled funding lifecycle reconciles successfully and all production gates close, rewrite this document with the final supported rails, provider contracts, balance model, and operational limits.
