# Identity and Access

## Authoritative authentication model

Supabase Auth is Neptlium's sole active authentication and browser-session provider for customer and operator surfaces.

This applies to:

- `app.neptlium.com`
- `admin.neptlium.com`
- bearer-token authentication at `api.neptlium.com`
- authenticated Neptlium Treasury surfaces where applicable

Browser applications use only the Supabase project URL and publishable client key. Service-role credentials remain server-only.

## Identity model

Authentication and business identity remain separate concepts.

1. **Supabase Auth subject** — authenticated `auth.users.id` UUID.
2. **Neptlium principal** — stable internal UUID used for ownership, authorization, policy, audit, and ledger attribution.
3. **Identity mapping** — active `SUPABASE_AUTH` subject to Neptlium principal mapping.
4. **Authorization** — Neptlium-owned roles, organization membership, compliance state, entitlements, policy, and resource ownership.

A valid Supabase session proves authentication. It does not by itself authorize a treasury, allocation, administrative, organization, provider-execution, or financial operation.

## Existing-account continuity

Existing principal UUIDs and financial ownership must be preserved. Authentication migration is forward-only and must not rewrite balances, ledger entries, audit records, provider evidence, or ownership UUIDs.

For existing accounts, the active Supabase Auth subject must resolve deterministically to the preserved Neptlium principal. Ambiguous, conflicting, missing, suspended, or retired mappings fail closed.

Historical identity-provider mapping rows may remain as inert migration/audit evidence. They are not accepted runtime credentials unless the current runtime explicitly supports that provider; currently only `SUPABASE_AUTH` is supported.

Email may assist account communication and onboarding but must not be used as privileged authorization or as a substitute for immutable subject identity.

## Customer application

`apps/app` uses shared Supabase browser/server clients, session refresh, Neptlium-owned sign-in/sign-up UI, and server-side session APIs. Its API client obtains the current Supabase access token and sends it to `apps/api` as a bearer token.

Account provisioning and onboarding read/write Neptlium business state through `apps/api`; API availability must not be confused with authentication-session validity.

## Admin application

`apps/admin` uses Supabase Auth for operator authentication. The API resolves the Supabase identity to a Neptlium principal, then enforces operator roles and domain authorization server-side.

Dashboard access requires explicit server-owned administrative authorization. Authentication alone is never sufficient.

## Neptlium Treasury

Neptlium Treasury uses Supabase Auth for user identity. Organization authority, treasury permissions, approvals, policy, and payment execution remain separate server-owned authorization domains.

## API

The API verifies Supabase access tokens, obtains the immutable authenticated subject, resolves the `SUPABASE_AUTH` subject through durable identity storage, and performs server-side authorization from the stable principal.

Missing mapping storage, invalid token, ambiguous mapping, suspended/retired principal, or unavailable identity infrastructure fails closed.

## Persistence boundary

Supabase is both the active authentication provider and a server-side database/persistence platform, but these are distinct authorities.

Allowed persistence uses include repositories, RLS/constraints, provider inboxes, identity mapping tables, audit, ledger-related data, and reconciliation. Service-role credentials are infrastructure authority, server-only, and never become user credentials.

## Security invariants

- Never log access tokens, refresh tokens, cookies, session identifiers, service-role keys, recovery material, or provider secrets.
- Never authorize privileged behavior from user-editable `user_metadata`.
- Email is an identifier/contact attribute, not privileged authorization.
- Every privileged action requires server-side role, policy, ownership, and state validation.
- Browser controls are defense in depth, not financial authorization.
- Session loss, mapping ambiguity, storage failure, or identity-provider outage fails closed for privileged operations.
- Identity migration never changes canonical financial ownership UUIDs.
- No browser application may receive the Supabase service-role key.
