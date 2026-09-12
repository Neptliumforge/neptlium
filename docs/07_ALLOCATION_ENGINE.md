# NEPTLIUM Allocation Engine — Remediation Mode

## Purpose

The allocation engine models, authorizes, and records allocation decisions. It does not independently prove financial execution.

## Truth boundary

Preserve these distinctions:

- modeled != authorized;
- authorized != executable;
- executable != submitted;
- submitted != settled;
- settled != reconciled.

Allocation plans and movements are planning/governance artifacts until they are intentionally connected to the canonical transfer/execution lifecycle.

## Current production posture

Allocation schema and governed functions are deployed. During financial remediation, allocation work must not create a new execution path around the canonical transfer/provider/ledger/reconciliation chain.

## Required behavior

Allocation commands must retain:

- stable owner/principal identity;
- policy versioning;
- idempotency;
- immutable event history;
- explicit authorization state;
- exact target-total validation;
- no provider or money movement side effects unless routed through the canonical execution domain.

## Remediation priority

Allocation is not a blocker ahead of gates 01-16 unless an allocation behavior directly creates or bypasses financial authority. Any future allocation execution must reuse canonical transfer execution, provider submission, settlement evidence, ledger, and reconciliation.

## Final rewrite

After the production financial chain is certified, rewrite this document with the final relationship between allocation plans and executable capital movements.
