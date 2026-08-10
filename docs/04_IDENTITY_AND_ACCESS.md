# Identity and Access

Status labels in this document are normative: **CURRENT** describes verified repository behavior, **TRANSITION** describes migration constraints, and **TARGET** describes intended architecture that is not yet implemented.

## CURRENT

Supabase Auth is the live identity and session provider for `apps/app` and `apps/admin`.

- Browser and server clients use Supabase sessions. Server guards call `supabase.auth.getUser()` before allowing authenticated routes.
- The authenticated app loads `profiles.id = auth.users.id`; role resolution uses `user_roles.user_id`.
- Admin access requires a valid Supabase user plus an `admin`-or-higher role loaded through the server-only admin client. UI visibility is not authorization.
- Sign-up, sign-in, email confirmation, password reset, session expiry, trusted-device, login-history, and Supabase MFA groundwork exist in live application/schema code.
- RLS policies commonly use `auth.uid()`, and many tables directly reference `auth.users(id)`.
- User creation/provisioning functions and triggers currently depend on `auth.users` identifiers.

### Current app-to-API token flow

1. `apps/app` validates the user with `supabase.auth.getUser()`.
2. Its server-only API client obtains the current Supabase access token from the session.
3. It sends that token to `apps/api` as `Authorization: Bearer <token>` over the configured API origin.
4. `apps/api` validates the bearer token against Supabase Auth's `/auth/v1/user` boundary and derives the owner identifier from the returned user.
5. Repositories enforce ownership again when loading or mutating user-scoped resources.

Tokens must not be logged, stored in application tables, exposed to browser bundles, or treated as authorization without server validation.

## CURRENT coupling to `auth.users`

The migration history includes direct foreign keys or identity joins from profiles, organizations, portfolios, wallets, wallet transactions, custody addresses, onboarding drafts, documents, roles, audit records, ledger actors, approvals, idempotency records, and provider-wallet ownership paths. This is real migration debt, not an abstract concern. Replacing the login UI alone would not remove it.

The canonical financial records must not permanently use an authentication-provider subject as their business identity. Today, however, the current owner IDs are Supabase Auth user UUIDs and must continue to resolve during transition.

## TRANSITION

Identity migration must be additive, reversible, auditable, and separate from financial-state migration.

1. Introduce a provider-independent Neptlium principal with a stable internal identifier.
2. Add an identity mapping keyed by provider and provider subject; never overload email as identity.
3. Backfill mappings from existing Supabase users without rewriting ledger history.
4. Resolve both current Supabase subjects and future Clerk subjects to the same Neptlium principal during a controlled overlap.
5. Move ownership joins and authorization checks from provider subjects to the principal in reviewed increments.
6. Preserve attribution for historical actor IDs and record mapping provenance.
7. Cut over sessions only after app, API, admin, RLS, service-role, onboarding, recovery, MFA, and incident runbooks have been verified.
8. Retire Supabase Auth coupling only after referential, ownership, and audit reconciliation succeeds.

No destructive rewrite of applied migrations is allowed. New migrations must preserve existing identifiers and financial history.

## TARGET

Clerk is the target authentication, session, and MFA provider. **Clerk is not live and no Clerk SDK, middleware, schema migration, or environment change is part of Phase 0.**

The target identity model separates four concerns:

- **Neptlium principal:** stable internal identity used by ownership, policy, audit, and ledger attribution.
- **Identity mapping:** `(provider, provider_subject) -> principal_id`, with uniqueness, status, timestamps, and migration provenance.
- **Authentication session:** provider-issued proof validated at the application/API boundary.
- **Authorization:** Neptlium-owned roles, organization membership, entitlements, compliance state, and resource ownership.

Clerk will authenticate; it will not become the canonical financial owner, role database, compliance system, or ledger authority. MFA assurance and session metadata may inform authorization policy but never replace resource-level checks.

## Invariants

- Authentication provider observation is not Neptlium authorization.
- Email, wallet address, and provider subject are identifiers, not the canonical principal.
- Every privileged action requires server-side role and ownership validation.
- Service-role credentials remain server-only and narrowly scoped.
- Session failure, mapping ambiguity, or provider outage fails closed for privileged operations.
- Identity migration must not alter balances, ledger entries, provider evidence, or reconciliation history.
