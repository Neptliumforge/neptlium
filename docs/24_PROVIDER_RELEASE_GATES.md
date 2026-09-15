# Provider Release Gates

Provider work reaches production only through explicit gates. Passing an earlier gate never implies a later gate.

## Gate P0 — architecture

Provider responsibility fits the canonical doctrine and does not create a shadow ledger, browser authority or provider-owned domain model.

## Gate P1 — configuration

Required server-side configuration is present, validated, environment-correct and secret-safe. No live-capability claim is made.

## Gate P2 — connectivity

The exact provider/environment/network or rail is reachable and identity/configuration checks pass. Connectivity does not certify economic behavior.

## Gate P3 — evidence ingress

Official webhook/signature or observation contract is verified, durable/idempotent processing is demonstrated and replay/invalid evidence fails closed.

## Gate P4 — capability certification

The exact provider + environment + operation + network/rail + asset/currency contract passes implementation, policy, failure-mode and reconciliation validation.

## Gate P5 — execution authorization

For externally mutating economic operations, explicit execution enablement is separately authorized after capability certification. Alchemy observation never receives financial execution authority.

## Gate P6 — reconciliation

End-to-end settlement evidence maps deterministically into governed reconciliation and canonical ledger behavior, including failures, refunds/reversals and ambiguous outcomes.

## Gate P7 — production observation

After an authorized release, monitor provider errors, signature failures, ambiguous submissions, reconciliation lag and capability degradation. Roll back/disable the affected capability without corrupting canonical state.

## Validation vocabulary

Engineering reports use only `PASS`, `FAIL`, `BLOCKED` or `NOT RUN` for each executed gate/check, consistent with repository `AGENTS.md`.
