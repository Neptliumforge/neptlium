# Security

Security is a cross-application and financial-correctness boundary. This document describes repository controls, not a certification or guarantee.

## Identity and session security

Clerk is the sole authentication, session, recovery, and MFA provider for customer and operator surfaces.

- `apps/app` and `apps/admin` use Clerk browser/server primitives.
- `apps/api` verifies Clerk bearer tokens and resolves the verified `CLERK` subject to a stable Neptlium principal before authorization.
- Supabase Auth tokens are not accepted by customer or admin API authentication.
- Supabase `/auth/v1/*` endpoints are not part of Neptlium's runtime identity flow.
- Historical legacy identity rows may remain as audit/migration evidence only.

Authentication is not authorization. Every privileged action also requires Neptlium-owned role, policy, ownership, compliance, and state validation.

## Persistence/service-role boundary

Supabase may remain a server-side persistence platform. `SUPABASE_SERVICE_ROLE_KEY` bypasses database row-level controls and is therefore confined to server-only API/repository infrastructure. It is never a customer credential, never an authentication token, and never exposed to browser bundles or logs.

Service-role possession is not permission to bypass Neptlium authorization. Actor, role, ownership, amount, policy, allowed transition, idempotency, and audit checks remain mandatory.

## Existing-account identity cutover

The Clerk-only bootstrap may attach a Clerk subject to a preserved existing principal only from a server-verified Clerk primary email when the match is unique and there is no conflicting active Clerk mapping. Ambiguity fails closed. No legacy password is requested.

Identity cutover must not modify canonical financial ownership, balances, ledger entries, provider evidence, settlement evidence, or audit attribution.

## Secrets and configuration

- Commit examples with empty values only; real `.env*` files remain untracked.
- Clerk secret/JWT/webhook keys, database service-role values, provider keys, signing keys, and Stripe secrets are server-only.
- Only genuinely browser-safe values use `NEXT_PUBLIC_*`.
- Validate origin, URL, environment, and capability configuration at startup.
- Never log authorization headers, cookies, tokens, secrets, private keys, recovery material, or raw sensitive payloads.

## Webhook security

- Verify the exact raw body using the provider's official signature contract before processing.
- Enforce replay/timestamp tolerance when supported.
- Require stable provider event IDs and idempotent durable claims.
- Persist a private inbox before asynchronous processing.
- Store only safe headers/references and isolate sensitive payload access.

## Financial-operation security

- Validate ownership, supported capability, amount, destination, available canonical balance, restrictions, compliance and policy server-side.
- Separate proposal, review, approval, execution, posting and reconciliation.
- Reserve capital atomically when required before submission.
- Use exact units, balanced append-only postings, idempotency, request correlation and audit.
- Treat ambiguous provider results as pending/unknown until lookup and reconciliation.
- User-submitted deposit hashes or receipts are evidence only and can never self-credit an account.

## Fail-closed behavior

Missing Clerk verification, identity mapping, database storage, provider configuration, capability eligibility, webhook verification, authorization, or reconciliation evidence must not degrade into anonymous access, simulated success, default approval, or fabricated financial state.
