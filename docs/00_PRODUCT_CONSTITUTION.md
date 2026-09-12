# NEPTLIUM Product Constitution — Remediation Mode

## Status

NEPTLIUM is a capital operating platform under active production remediation. Product language, engineering decisions, and release claims must remain consistent with the execution ledger in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

## Product promise during remediation

The platform may present its intended operating model, but it must not represent unproven financial capability as live. In particular, do not imply that deposits, withdrawals, provider execution, settlement, reconciliation, custody, or balances are production-complete until the corresponding remediation gates are closed with evidence.

## Product authority hierarchy

- Web explains the product.
- App lets customers interact with governed product state.
- Admin lets operators inspect and control governed operations.
- API owns privileged commands and financial state transitions.
- Providers supply external evidence and execution rails.
- The canonical ledger and reconciliation process determine accounting truth.

No browser, marketing page, legacy Edge Function, or provider response is allowed to override canonical financial truth.

## Financial truth principles

NEPTLIUM must preserve these distinctions:

- `UNKNOWN != ZERO`
- `CONFIGURED != LIVE`
- `REQUESTED != APPROVED`
- `APPROVED != SUBMITTED`
- `SUBMITTED != SETTLED`
- `SETTLED != RECONCILED`
- `PROVIDER OBSERVATION != CANONICAL LEDGER`
- `MODELED != EXECUTED`
- `UI STATE != DOMAIN TRUTH`

A user-visible completed state must always be explainable by durable domain records and evidence.

## Launch boundary

Real-money launch remains closed until gates 01-16 in `docs/15_PRODUCTION_READINESS_AUDIT.md` are complete. This includes retirement of legacy mutation paths, canonical provider ingress, proven funding/withdrawal lifecycles, ledger/reconciliation/backing verification, identity cutover, and production environment audit.

## Product execution priorities

Until remediation completes, prioritize:

1. containment of legacy financial authority;
2. durable provider orchestration;
3. signed/authenticated webhook ingress;
4. canonical settlement evidence;
5. balanced ledger posting;
6. reconciliation and omnibus backing;
7. identity cutover;
8. production environment certification.

New features, broader asset support, new providers, and nonessential product expansion should not displace these priorities.

## Completion definition

The platform is not production-complete because pages render, CI passes, or schemas exist. Production completion requires the end-to-end chain to be executed, evidenced, and reconciled.

When all remediation gates close, this document must be rewritten again as the final production product constitution.
