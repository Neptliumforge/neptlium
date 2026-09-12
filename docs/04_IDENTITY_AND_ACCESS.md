# Identity and Access

## Authoritative authentication model

Clerk is Neptlium's sole authentication, browser-session, recovery, and MFA provider for customer and operator surfaces.

This applies to:

- `app.neptlium.com`
- `admin.neptlium.com`
- bearer-token authentication at `api.neptlium.com`

There is no supported Supabase Auth customer or operator session path. Neptlium applications must not create, refresh, validate, or link Supabase Auth sessions; must not call Supabase `/auth/v1/*`; and must not require a Supabase password as proof of account ownership.

## Identity model

Authentication and business identity remain separate concepts.

1. **Clerk subject** — provider-issued authenticated identity.
2. **Neptlium principal** — stable internal UUID used for ownership, authorization, policy, audit, and ledger attribution.
3. **Identity mapping** — active `CLERK` subject to Neptlium principal mapping.
4. **Authorization** — Neptlium-owned roles, organization membership, compliance state, entitlements, policy, and resource ownership.

A valid Clerk session proves authentication. It does not by itself authorize a treasury, allocation, administrative, or financial operation.

## Existing-account continuity

Existing principal UUIDs and financial ownership must be preserved. The Clerk-only cutover is forward-only and must not rewrite balances, ledger entries, audit records, provider evidence, or ownership UUIDs.

For an existing profile without an active Clerk mapping, bootstrap may attach the current Clerk subject only when all of the following are true:

- Clerk has server-verified the subject.
- Clerk has server-verified the primary email.
- the normalized verified email matches exactly one active Neptlium profile/principal;
- that principal does not already have a different active Clerk subject.

Ambiguity or conflicting Clerk ownership fails closed. No second authentication provider is requested from the user.

Historical `SUPABASE_AUTH` identity-mapping rows may remain as inert migration/audit evidence. They are not accepted runtime credentials.

## Customer application

`apps/app` uses `ClerkProvider`, Clerk middleware, Clerk sign-in/sign-up components, and server-side Clerk session APIs. Its API client obtains the current Clerk token and sends it to `apps/api` as a bearer token.

Account bootstrap and onboarding may read/write Neptlium business state through `apps/api`, but API availability must not be confused with Clerk session validity.

## Admin application

`apps/admin` uses Clerk for operator authentication. The API resolves the Clerk identity to a Neptlium principal, then enforces operator roles and domain authorization server-side.

## API

The API verifies Clerk tokens and authorized parties, resolves the `CLERK` subject through durable identity storage, and performs server-side authorization from the stable principal. Missing mapping storage, invalid token, ambiguous mapping, or suspended/retired principal fails closed.

The old `SUPABASE`, `DUAL`, and legacy password-link authentication modes are retired. Runtime authentication is Clerk-only.

## Persistence boundary

Supabase may remain a server-side database/persistence platform behind `apps/api`. That does not make Supabase an authentication provider.

Allowed persistence uses include repositories, RPCs, rate limiting, provider inboxes, identity mapping tables, audit, and ledger-related data. Service-role credentials are server-only and never become user credentials.

## Security invariants

- Never log Clerk tokens, cookies, session identifiers, service-role keys, or recovery material.
- Email is an identifier and bootstrap continuity signal, not a general authorization mechanism.
- Every privileged action requires server-side role, policy, ownership, and state validation.
- Browser controls are defense in depth, not financial authorization.
- Session loss, mapping ambiguity, storage failure, or provider outage fails closed for privileged operations.
- Identity migration never changes canonical financial ownership UUIDs.
