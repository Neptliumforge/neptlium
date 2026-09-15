# Provider Test Strategy

Provider tests must prove Neptlium control-plane behavior without requiring unsafe live economic execution.

## Unit tests

Cover provider doctrine, operation ownership, capability scope/state transitions, deterministic selection, chain/endpoint mapping, evidence/outcome semantics, normalized errors, policy guards and release-gate ordering.

## Contract tests

Verify adapter normalization, official signature verification, idempotency/replay handling, provider reference preservation, timeout ambiguity and lookup recovery using test/sandbox fixtures where possible.

## Integration tests

Exercise server-side provider boundaries against non-production resources or controlled read-only production observation where separately authorized. Do not create live charges/transfers merely to satisfy CI.

## Reconciliation tests

Prove that provider evidence cannot directly create canonical financial truth, and that settlement/reconciliation behavior handles duplicates, out-of-order evidence, failures, refunds/reversals and ambiguous outcomes.

## Production verification

Production verification is a separately authorized operational gate. Report exact evidence and use PASS/FAIL/BLOCKED/NOT RUN. Never infer production capability from local tests or provider configuration presence.
