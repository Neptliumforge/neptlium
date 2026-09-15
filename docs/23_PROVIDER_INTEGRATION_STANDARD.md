# Provider Integration Engineering Standard

Any new or materially changed Circle, Alchemy or Stripe integration must satisfy this standard before production execution is enabled.

## Contract

- Neptlium domain request/response types exist.
- Provider SDK/HTTP types remain behind the adapter.
- Capability metadata is explicit.
- Exact money/asset/network identity is preserved.
- Provider references are stored safely.

## Configuration

- Required variables are documented in `.env.example` without values.
- Production/test environment mismatch fails closed.
- Partial configuration fails closed where it would create ambiguous behavior.
- Secrets remain server-only.
- Configuration does not imply capability or execution authorization.

## Authentication and authorization

- Caller principal is verified before consequential intent creation.
- Ownership/scope is resolved server-side.
- Policy/risk/approval requirements are evaluated before execution.
- Provider credentials never substitute for Neptlium authorization.

## Idempotency and recovery

- Stable Neptlium operation identity exists.
- Provider idempotency is used where supported.
- Duplicate requests are safe.
- Ambiguous timeout lookup/recovery exists before resubmission.

## Events

- Official signatures are verified.
- Duplicate and out-of-order delivery are tested.
- Event identity is durable.
- Consequential processing is replay-safe.

## Ledger and reconciliation

- Provider observations cannot directly become available balance without the governed posting contract.
- Settlement definition is explicit.
- Reconciliation is deterministic and auditable.
- Corrections preserve append-only financial history through reversals/compensating entries where required by the ledger model.

## Operations

- Structured logs/metrics exist without secrets.
- Capability can be disabled independently.
- Provider degradation has a fail-closed product behavior.
- Manual review/exception state exists for unresolved evidence conflicts.

## Validation

Validation outcomes use exactly:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT RUN`

Production execution is not enabled while any required gate is `FAIL`, `BLOCKED`, or `NOT RUN`.
