# Provider Release Gates

## Gate 1 — Architecture

PASS requires provider responsibility and Neptlium authority to be explicit, with no shadow ledger or provider-owned product domain model.

## Gate 2 — Configuration

PASS requires complete server-side configuration, environment/network consistency, secret isolation and fail-closed partial configuration.

## Gate 3 — Observation

PASS requires authenticated read/event ingress, normalized evidence, duplicate/out-of-order safety and operational telemetry.

## Gate 4 — Intent and authorization

PASS requires persisted Neptlium intent identity, ownership resolution, authorization, policy/risk and approval enforcement before consequential submission.

## Gate 5 — Idempotency and recovery

PASS requires deterministic retry semantics and lookup/recovery after ambiguous provider outcomes.

## Gate 6 — Settlement

PASS requires an explicit rail/network settlement definition supported by verified external evidence.

## Gate 7 — Ledger and reconciliation

PASS requires governed canonical posting and deterministic reconciliation, including exception handling.

## Gate 8 — Operations

PASS requires monitoring, audit, capability-scoped disable controls and an incident path.

## Gate 9 — Eligibility

PASS requires any applicable customer, organization, asset, network, rail and jurisdiction constraints to be enforceable.

## Gate 10 — Production execution authorization

PASS is an explicit release decision for one narrowly scoped capability. It cannot be inherited from another provider, network, asset, rail or operation.

Until Gate 10 is PASS, production credentials may be used only for the previously certified non-execution scope.
