# Security

Security is a cross-application and financial-correctness boundary. This document describes repository controls, not a certification or guarantee.

## CURRENT identity and authorization

- Supabase Auth is the current session provider for app and admin.
- Server guards call `getUser()`; browser checks are never sufficient authorization.
- Supabase RLS scopes user-readable resources with `auth.uid()` and denies direct access to private API/ledger/provider/operations tables.
- Admin combines authenticated session, server-side role lookup, and role thresholds.
- The API validates Supabase bearer tokens server-side before owner-scoped routes.
- Ownership is derived from the verified user and revalidated in repositories/RPCs; callers cannot select an arbitrary owner.

The schema still has substantial `auth.users` coupling. Clerk is TARGET only; no Clerk security boundary exists yet.

## Service-role boundary

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and is therefore confined to server-only admin/API clients and narrow operations. It must never appear in `NEXT_PUBLIC_*`, browser bundles, client logs, provider metadata, or tracked files.

Service-role possession is not permission to bypass Neptlium authorization. Code must validate actor, role, ownership, allowed transition, amount, policy, and idempotency before privileged writes.

## Migration containment

The production-security containment migration preserves and disables legacy functions that could simulate funding, withdrawal, balance crediting, provider events, or allocation execution. It revokes broad function/table privileges, hardens search paths, makes views security-invoker, and archives affected legacy state for reviewed rollback.

Applied migrations are append-only evidence. Never rewrite or delete them; corrective changes use new reviewed migrations. The rollback SQL under `docs/security` is an operational reference, not an instruction to execute without approval.

## Secrets and configuration

- Commit examples with empty values only; real `.env*` files remain untracked.
- Browser-safe values alone use `NEXT_PUBLIC_*`.
- API keys, service-role keys, Circle entity secret, signing keys, and future Clerk/Stripe secrets are server-only.
- Validate environment, origin, URL, and capability configuration at startup.
- Never log authorization headers, cookies, tokens, secrets, private/recovery material, or raw sensitive payloads.
- Remote environment changes require explicit instruction and review; Phase 0 makes none.

## Webhook security

- Verify the exact raw body using the provider's reviewed official signature contract before parsing/processing.
- Enforce size and timestamp/replay tolerance where the provider contract supports it.
- Require stable provider event IDs and compare payload digests on duplicates.
- Persist a private inbox before asynchronous processing.
- Store only safe headers and references; isolate raw sensitive payload access.
- Process idempotently through durable jobs and record failures/dead letters.

Alchemy and Coinbase routes fail closed without injected verifiers. Circle webhook ingestion is explicitly disabled. The test HMAC verifier is not production verification.

## Financial-operation security

- Validate ownership, supported capability, amount, destination/recipient, available canonical balance, restrictions, and policy server-side.
- Separate proposer, approver, and executor duties; prohibit self-approval.
- Reserve capital atomically before submission.
- Use exact units, balanced append-only postings, idempotency, request correlation, and audit.
- Treat ambiguous provider results as pending/unknown until lookup and reconciliation.
- Reconcile provider evidence to canonical state and restrict discrepancies when policy requires.
- Correct posted history only with reversal/compensating entries.

## Fail-closed behavior

The API rejects production memory repositories and requires a distributed rate limiter. Missing auth configuration denies authentication; missing provider configuration returns unavailable; Circle mainnet is rejected; unsupported assets/networks are denied; absent webhook verification prevents ingestion; disabled execution stays disabled.

Unavailable security dependencies must not degrade into anonymous access, simulated success, default approval, or fabricated financial state.

## TARGET identity security

Clerk is the target authentication/session/MFA provider. Migration requires provider-independent principals, subject mappings, preserved audit attribution, verified app/API/admin token handling, role/ownership separation, session revocation, recovery, MFA policy, and controlled overlap with Supabase Auth.

No Clerk SDK, middleware, database migration, or environment configuration is authorized in Phase 0.

## Security review minimum

- Threat model trust boundaries and abuse cases.
- Verify RLS and service-role call paths.
- Test cross-owner and role escalation denial.
- Test replay, duplicate, timeout, retry, and race behavior.
- Test ledger balance, append-only, reservation, and reversal invariants.
- Verify logs and responses contain no secrets or sensitive provider payloads.
- Review provider contracts and operational recovery before enabling capability.
