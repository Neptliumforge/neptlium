# Provider Production Readiness

Production readiness is capability-specific and evidence-based.

For each provider capability, record: provider; environment; operation; network/rail; asset/currency; configuration status; connectivity result; evidence/webhook verification result; idempotency/replay result; failure/ambiguous-timeout result; authorization/policy/approval result; settlement/reconciliation result; execution gate state; deployment SHA; validation status using PASS/FAIL/BLOCKED/NOT RUN; and material limitations.

A provider may be production-connected while having zero execution-enabled financial capabilities. This is valid and should be represented truthfully.

Do not label Circle, Alchemy or Stripe globally `live` when only a subset of granular capabilities has been certified.
