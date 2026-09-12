# NEPTLIUM Transfer Architecture — Remediation Mode

## Canonical withdrawal chain

```text
request
  -> validation/policy
  -> transfer_execution
  -> capital reservation
  -> pending approval
  -> approved
  -> provider submission
  -> durable provider reference
  -> submitted
  -> authenticated provider settlement event
  -> settlement evidence
  -> canonical settlement journal
  -> reconciliation
```

Every state is distinct. Do not collapse approval, submission, settlement, and reconciliation into a single `completed` status.

## Current production state

The governed transfer schema and reservation/approval/settlement functions are deployed, but the canonical production tables contained no transfer lifecycle rows at the 2026-09-12 audit. Legacy `process-withdraw` remained active and could mark a withdrawal complete without external payout execution. That legacy authority must be removed first.

## Circle execution requirement

Circle outbound submission must:

- enforce the supported provider/environment/network/asset contract;
- convert exact atomic amounts without float ambiguity;
- use deterministic idempotency;
- persist the provider reference durably;
- transition to `submitted` only with a matching provider reference;
- normalize provider rejection/failure without pretending settlement occurred.

The provider-accepted/local-persist-failed crash window must be recoverable without duplicate transfer submission.

## Settlement requirement

A submitted transfer may become settled only when matching settlement evidence proves provider completion for the same transfer, environment, asset, network, and amount. Canonical reserved capital is settled through a balanced ledger journal, then reconciled.

## Failure handling

- pre-submission failure/cancel may release the reservation;
- a submitted transfer cannot be locally treated as cancelled merely because the application lost track of it;
- provider failure/reversal requires evidence and explicit compensating state;
- retries must be idempotent.

## Completion gates

Transfer production readiness is defined by gates 01, 05, 06, 07, 08, 10, 11, 12, 13, and 14 in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

## Final rewrite

After the controlled withdrawal lifecycle reconciles successfully and all production gates close, rewrite this document with the final provider, approval, limits, recovery, and operational contracts.
