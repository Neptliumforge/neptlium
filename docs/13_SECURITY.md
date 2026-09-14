# Security

Security is a cross-application and financial-correctness boundary. This document describes repository controls, not a certification or guarantee.

## Identity and session security

Supabase Auth is the sole active authentication and session provider for customer and operator surfaces.

- `apps/app`, `apps/admin`, and authenticated VaultRail surfaces use Supabase browser/server/session primitives.
- `apps/api` verifies Supabase access tokens and resolves the verified `SUPABASE_AUTH` subject to a stable Neptlium principal before authorization.
- Historical identity rows may remain as audit/migration evidence only.
- Service-role credentials are never part of browser authentication.

Authentication is not authorization. Every privileged action also requires Neptlium-owned role, policy, ownership, compliance, organization, and state validation.

## Persistence/service-role boundary

`SUPABASE_SERVICE_ROLE_KEY` bypasses database row-level controls and is therefore confined to server-only API/repository infrastructure. It is never a customer credential, never a browser authentication token, and never exposed to browser bundles or logs.

Service-role possession is not permission to bypass Neptlium authorization. Actor, role, ownership, amount, policy, allowed transition, idempotency, and audit checks remain mandatory.

## Existing-account identity continuity

The Supabase Auth cutover preserves existing Neptlium principal UUIDs and canonical ownership. Active `auth.users.id` subjects must resolve deterministically to the preserved principal. Ambiguity, conflicting mappings, missing identity state, suspended principals, or retired principals fail closed.

Identity migration must not modify canonical financial ownership, balances, ledger entries, provider evidence, settlement evidence, or audit attribution.

## Secrets and configuration

- Commit examples with empty values only; real `.env*` files remain untracked.
- Supabase service-role values, provider keys, signing keys, entity secrets, and payment-provider secrets are server-only.
- Only genuinely browser-safe values use `NEXT_PUBLIC_*`.
- Validate origin, URL, environment, and capability configuration at startup.
- Never log authorization headers, cookies, access/refresh tokens, secrets, private keys, recovery material, or raw sensitive payloads.

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

Missing authentication verification, identity mapping, database storage, provider configuration, capability eligibility, webhook verification, authorization, or reconciliation evidence must not degrade into anonymous access, simulated success, default approval, or fabricated financial state.
