# Provider Audit Checklist

Use this checklist when reviewing provider changes or activation readiness.

- [ ] Provider responsibility matches the canonical doctrine.
- [ ] Privileged integration is contained behind API/server boundaries.
- [ ] No provider SDK response leaks into product-domain truth.
- [ ] No privileged provider secret is browser-visible or committed.
- [ ] Canonical chain/rail/asset identity is explicit.
- [ ] Configuration fails closed.
- [ ] Connectivity verification is distinct from capability certification.
- [ ] Capability scope includes environment, operation and network/rail/asset where applicable.
- [ ] Provider operation ownership is enforced.
- [ ] Provider evidence begins non-canonical/unreconciled.
- [ ] Official webhook/signature validation exists where applicable.
- [ ] Idempotency and replay behavior are defined.
- [ ] Ambiguous timeout recovery uses controlled lookup before retry.
- [ ] Provider health is separate from financial truth.
- [ ] Execution requires explicit authorization beyond configuration/certification.
- [ ] Settlement and reconciliation are explicit.
- [ ] Corrections preserve append-only financial history.
- [ ] Safe observability exists without secret leakage.
- [ ] Relevant tests/build/lint/typecheck are executed.
- [ ] Documentation reflects CURRENT / TRANSITION / TARGET truth.
- [ ] Production mutation or financial execution has separate authorization when applicable.
