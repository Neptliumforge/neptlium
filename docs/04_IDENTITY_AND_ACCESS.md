# Identity and Access

Status labels in this document are normative: **CURRENT** describes verified repository behavior and audited production state, **TRANSITION** describes migration constraints and partially implemented architecture, and **TARGET** describes the intended end state that must not be reported as live until production verification succeeds.

## CURRENT

Neptlium currently has a mixed identity state across source and production.

- `apps/app` and `apps/admin` source are implemented around Clerk browser authentication/session primitives and require `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` plus `CLERK_SECRET_KEY` at runtime.
- `apps/api` source supports `API_AUTH_MODE=SUPABASE|DUAL|CLERK`; the default is `SUPABASE`.
- The production Supabase database remains the active data platform and still contains the full Supabase Auth schema and current user records.
- Production migration history currently stops before the provider-independent identity and Clerk cutover migrations. Public financial/domain ownership is therefore still materially coupled to `auth.users`.
- Production Vercel configuration has not yet completed Clerk runtime configuration for App/Admin, and the API production environment has not yet completed durable Supabase credential configuration. Runtime configuration state must be verified separately from source implementation.

### Current API authentication compatibility

When `API_AUTH_MODE=SUPABASE`, `apps/api` validates bearer tokens through Supabase Auth and may use the verified Supabase subject UUID directly as the internal principal identifier when the provider-independent identity resolver is not yet available.

`DUAL` and `CLERK` modes require the provider-independent identity storage introduced by the later migrations. They must not be enabled against a production schema that lacks `identity_principals` and `identity_provider_subjects`.

Tokens must not be logged, stored in application tables, exposed to browser bundles, or treated as authorization without server validation.

## CURRENT coupling to `auth.users`

Production still contains direct public foreign keys and identity joins to `auth.users`. This is real migration debt, not an abstract concern. Replacing a login UI alone does not remove it.

The canonical financial records must not permanently use an authentication-provider subject as their business identity. Existing Supabase Auth UUIDs must continue to resolve correctly throughout transition so balances, ledger ownership, provider evidence, approvals, transfers, settlement, reconciliation, and audit history are not rewritten merely to change authentication providers.

## TRANSITION

Identity migration is additive, auditable, and separate from financial-state migration.

The reviewed sequence is:

1. Apply the provider-independent identity foundation while Supabase Auth remains active.
2. Preserve every existing profile UUID as the canonical Neptlium principal.
3. Backfill an auditable `(provider, provider_subject) -> principal_id` mapping for existing Supabase Auth subjects.
4. Introduce controlled Clerk subject linking for existing users during a dual-session bridge.
5. Synchronize Clerk lifecycle evidence through server-controlled commands.
6. Re-parent reviewed public ownership/actor foreign keys from `auth.users` to the provider-independent principal without changing the UUID values they carry.
7. Enable Clerk-only bootstrap for new principals only after the cutover migration and runtime configuration are coordinated.
8. Move App, Admin, and API authentication modes together with schema state; do not activate `DUAL` or `CLERK` against a pre-foundation schema.
9. Verify onboarding, roles, ownership, treasury authorization, audit attribution, recovery, MFA, RLS, webhook handling, and incident procedures before retiring Supabase Auth customer-session dependence.

No destructive rewrite of applied migrations is allowed. New migrations must preserve existing identifiers and financial history.

## TARGET

Clerk is the browser authentication, session, and MFA authority for customer and operator surfaces.

Supabase remains the production data platform and persistence authority; it does not remain the canonical business identity authority.

The target identity model separates four concerns:

- **Neptlium principal:** stable internal UUID used by ownership, policy, audit, and ledger attribution.
- **Identity mapping:** `(provider, provider_subject) -> principal_id`, with uniqueness, status, timestamps, and migration provenance.
- **Authentication session:** provider-issued proof validated at the application/API boundary.
- **Authorization:** Neptlium-owned roles, organization membership, entitlements, compliance state, policy, and resource ownership.

Clerk authenticates; it does not become the canonical financial owner, role database, compliance system, or ledger authority. MFA assurance and session metadata may inform authorization policy but never replace resource-level checks.

## Invariants

- Authentication provider observation is not Neptlium authorization.
- Email, wallet address, and provider subject are identifiers, not the canonical principal.
- Every privileged action requires server-side role, policy, and ownership validation.
- Service-role credentials remain server-only and narrowly scoped.
- Session failure, mapping ambiguity, missing identity storage, or provider outage fails closed for privileged operations.
- Identity migration must not alter balances, ledger entries, provider evidence, settlement evidence, or reconciliation history.
- `SUPABASE`, `DUAL`, and `CLERK` runtime modes are deployment states, not interchangeable labels; each requires a compatible schema and environment configuration.
