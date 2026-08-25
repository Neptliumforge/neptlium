# Identity and Access

Status labels in this document are normative: **CURRENT SOURCE** describes verified repository behavior, **CURRENT PRODUCTION SCHEMA** describes audited database state, **CURRENT PRODUCTION RUNTIME** describes deployed runtime state, **TRANSITION** describes migration constraints and partially implemented architecture, and **TARGET** describes the intended end state that must not be reported as live until production verification succeeds.

## CURRENT SOURCE

Neptlium source is Clerk-first at the customer and operator surfaces.

- `apps/app` and `apps/admin` source use Clerk browser authentication/session primitives and require `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` plus `CLERK_SECRET_KEY` at runtime.
- `apps/api` supports `API_AUTH_MODE=SUPABASE|DUAL|CLERK` and resolves authenticated provider subjects to stable Neptlium principals before authorization when provider-independent identity storage is configured.
- `apps/app` routes product/business state through `apps/api`; its only direct Supabase request is the temporary legacy-session proof used during existing-account identity linking.
- Existing-account linking requires both a valid legacy Supabase session and a valid Clerk session. `apps/api` verifies both before invoking a service-only link command.
- Clerk bootstrap distinguishes `created`, `existing`, and `link_required`; an existing verified email does not create a second principal.

Tokens must not be logged, stored in application tables, exposed to browser bundles, or treated as authorization without server validation.

## CURRENT PRODUCTION SCHEMA

The provider-independent identity foundation and Clerk application identity cutover are applied to the production Supabase database.

Verified invariants:

- The 16 existing profile UUIDs are preserved as 16 active `identity_principals`.
- All 16 existing Supabase Auth subjects remain mapped to those same principals as transition evidence.
- Public financial/domain ownership and actor foreign keys no longer reference `auth.users`; they reference `identity_principals` without changing stored UUID values or delete behavior.
- Existing verified profile emails without a Clerk mapping return `link_required`; bootstrap does not create a duplicate principal.
- Clerk mappings are created only by authenticated link/bootstrap operations; no mapping was manufactured by the schema migration itself.
- Supabase Auth records remain present so existing users can prove legacy ownership during the transition. Their presence does not make `auth.users` the canonical business identity authority.

The provider-independent model separates:

- **Neptlium principal:** stable internal UUID used by ownership, policy, audit, and ledger attribution.
- **Identity mapping:** `(provider, provider_subject) -> principal_id`, with uniqueness, status, timestamps, and migration provenance.
- **Authentication session:** provider-issued proof validated at the application/API boundary.
- **Authorization:** Neptlium-owned roles, organization membership, entitlements, compliance state, policy, and resource ownership.

## CURRENT PRODUCTION RUNTIME

Production runtime is not yet certified merely because the schema is ready.

- App and Admin require valid Clerk publishable/secret runtime configuration.
- API requires durable Supabase server credentials, Clerk verification configuration, authorized-party configuration, and a deliberate compatible `API_AUTH_MODE`.
- Runtime probes currently fail closed where these credentials are absent. A build that succeeds without runtime credentials is not production authentication certification.

`API_AUTH_MODE=DUAL` is the next transition runtime after those credentials are installed. `CLERK`-only mode is not authorized by schema presence alone.

## TRANSITION

Identity migration remains additive, auditable, and separate from financial-state migration.

The completed schema sequence is:

1. Establish provider-independent principals while preserving every existing profile UUID.
2. Backfill `(SUPABASE_AUTH, subject) -> principal_id` mappings and append-only identity evidence.
3. Add controlled Clerk subject linking.
4. Add service-only dual-session linking so `apps/api` can validate both provider sessions before binding identities.
5. Re-parent reviewed public ownership/actor foreign keys from `auth.users` to `identity_principals` without changing UUID values.
6. Add Clerk bootstrap and onboarding authority against stable principals.
7. Guard bootstrap so an existing verified email returns `link_required` instead of creating a duplicate principal.

The remaining runtime sequence is:

1. Install App/Admin Clerk runtime credentials and API durable Supabase/Clerk credentials through the secret store.
2. Enable API `DUAL` mode.
3. Certify an existing user: Clerk login -> `link_required` -> legacy proof -> same principal -> dashboard.
4. Certify a new user: Clerk signup -> one new principal -> onboarding -> dashboard.
5. Verify roles, ownership, treasury authorization, audit attribution, recovery, MFA, webhook lifecycle, error handling, and incident procedures.
6. Observe existing-user migration and maintain the legacy Supabase identity path while it is still required for continuity.
7. Consider `CLERK`-only mode only after the transition has been explicitly certified.

No destructive rewrite of applied migrations is allowed. Identity transition must not alter balances, ledger entries, provider evidence, settlement evidence, reconciliation history, or customer ownership.

## TARGET

Clerk is the browser authentication, session, and MFA authority for customer and operator surfaces.

Supabase remains the production data platform and persistence authority; it does not remain the canonical business identity authority.

Clerk authenticates; it does not become the canonical financial owner, role database, compliance system, or ledger authority. MFA assurance and session metadata may inform authorization policy but never replace resource-level checks.

## Invariants

- Authentication provider observation is not Neptlium authorization.
- Email, wallet address, and provider subject are identifiers, not the canonical principal.
- Email equality may trigger `link_required`, but never authorizes the identity link by itself.
- Every privileged action requires server-side role, policy, and ownership validation.
- Service-role credentials remain server-only and narrowly scoped.
- Session failure, mapping ambiguity, missing identity storage, or provider outage fails closed for privileged operations.
- Identity migration must not alter balances, ledger entries, provider evidence, settlement evidence, reconciliation history, or canonical owner UUIDs.
- `SUPABASE`, `DUAL`, and `CLERK` runtime modes are deployment states, not interchangeable labels; each requires compatible schema and environment configuration.
