# NEPTLIUM Authenticated Application — Remediation Mode

## Purpose

`apps/app` is the authenticated customer interaction surface. It is not a financial authority and must not manufacture or directly mutate accounting truth.

## Current identity state

Clerk is the source architecture for browser authentication/session handling. Canonical Neptlium principal UUIDs remain the ownership identity in the platform. Production identity is still transitional because Supabase Auth remains active for legacy users and only part of the population has active Clerk mappings.

The one-time legacy identity bridge may exist only to prove continuity between a legacy Supabase session and a Clerk session. It must not become a general product-data path.

## Current application obligations

The App must:

- read customer product/financial state through `apps/api`;
- issue mutations through authenticated API commands;
- treat `EMPTY`, `PENDING`, `UNAVAILABLE`, and `NOT_CONFIGURED` distinctly;
- never infer balances or completion from missing records;
- never use browser-safe Supabase access to create canonical transaction truth;
- never receive service-role credentials or provider secrets;
- present provider observations as evidence until canonical ledger/reconciliation state exists.

## Remediation requirements

The App portion of the production remediation is complete only when:

1. no customer flow calls legacy `process-withdraw`, `process-deposit`, or direct financial-table mutation paths;
2. funding and withdrawal UI state is projected from the canonical API lifecycle;
3. transaction history is durable and ledger-backed rather than placeholder/empty-array data;
4. portfolio and treasury repository stubs are replaced with authoritative API data;
5. existing-user and new-user Clerk flows are exercised successfully;
6. Supabase legacy-auth dependency is removed from ordinary product access after identity gate completion.

## Financial UX state mapping

Customer-facing labels must preserve domain truth. Examples:

- approved does not mean submitted;
- submitted does not mean settled;
- settled does not mean reconciled;
- a pending provider event is not available capital;
- an absent balance is not zero.

## Execution authority

The ordered remediation plan lives in `docs/15_PRODUCTION_READINESS_AUDIT.md`. App work should close or support the next applicable gate instead of creating parallel financial behavior.

## Final rewrite

When all remediation gates are complete, rewrite this document again with the final Clerk-only identity contract, final API projection model, final funding/withdrawal UX states, and final production environment requirements.
