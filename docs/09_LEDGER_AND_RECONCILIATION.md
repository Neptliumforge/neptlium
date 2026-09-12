# NEPTLIUM Ledger and Reconciliation — Remediation Mode

## Accounting authority

The canonical ledger is the accounting source of truth. Legacy transaction status, portfolio totals, provider responses, and UI projections are not accounting authority.

## Canonical model

Financial state should be represented through immutable journals/postings plus durable lifecycle records and provider evidence.

Each canonical journal must:

- reference a stable source operation;
- contain at least two postings;
- balance debits and credits per asset;
- use the correct owner or treasury accounts;
- match asset/network identity;
- be idempotent/only-once for its source;
- be corrected through reversals/compensating entries, never destructive edits.

## Reconciliation authority

Reconciliation compares canonical internal state against external/provider/treasury evidence. A transaction is not operationally complete merely because the provider reports success or a journal exists.

Expected discrepancy classes include:

- missing provider reference;
- provider missing transaction;
- amount mismatch;
- asset/network mismatch;
- status mismatch;
- settlement without ledger;
- ledger without provider evidence;
- stale submitted/pending state;
- duplicate provider transaction/event.

## Current production state

At the 2026-09-12 audit, canonical ledger journals/postings and reconciliation tables contained no lifecycle rows. Integrity queries returned no defects, but this was not proof of runtime correctness because the financial chain had not yet been exercised.

## Required proof

Gates 09-14 require controlled funding and withdrawal lifecycles that produce:

- matching provider evidence;
- settlement evidence;
- balanced journals;
- matched reconciliation items;
- zero unresolved discrepancy codes;
- correct final backing state.

Tests must also cover duplicates, replay, reversal, provider delay/failure, and intentional mismatch detection.

## Final rewrite

After successful production-equivalent lifecycle evidence and release completion, rewrite this document with final account taxonomy, reconciliation cadence, discrepancy operations, retention, and reporting rules.
