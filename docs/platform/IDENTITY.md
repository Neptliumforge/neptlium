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

### CURRENT — App Account entry and session return

`apps/app/app/(auth)/auth-utils.ts` owns the App return-destination contract. Producers write `next`. Account entry also accepts previously issued `redirect_url` links: a present `next` takes precedence, even if invalid or empty; duplicate occurrences of either parameter use the safe `/dashboard` default. No destination also uses that default.

Server entry pages, the App proxy, legacy entry aliases and the authentication callback use the same resolver. Sign-in/sign-up switching, errors/retries, session-expired entry, successful sign-in and both sign-up session/confirmation paths preserve the validated destination. Form rendering does not depend on a client-only search-parameter suspense region.

Only implemented App dashboard page paths and `/onboarding` are supported, with non-secret query state. External/protocol-relative URLs, malformed encodings, controls, backslashes, encoded path-separator ambiguity, auth/API destinations and unsupported pages fall back to `/dashboard`. Fragments are discarded. Authentication codes, credentials and session tokens are not return state. Cross-surface returns are not enabled by this contract. Route additions must update the resolver's page inventory and its behavioral coverage.

The App proxy overwrites the private request header `x-neptlium-account-return` before forwarding session refresh. Server guards use this validated navigation context to preserve the route if the session disappears between proxy and rendering/action execution. A caller-supplied header is never trusted, and the header never conveys principal or access authority.

Explicit onboarding entry may carry `next` to a dashboard destination; it is retained across authentication and used after successful provisioning or when already provisioned. An onboarding return cannot recursively target onboarding. Without that explicit destination, completion retains `/dashboard`. This does not add a mandatory onboarding gate or change provisioning policy.

The requested route remains subject to existing server session, principal, role, organization-membership, ownership and API policy enforcement. A valid return URL is navigation context, never authorization. Password-recovery implementation and provider email activation are outside this contract. Candidate source/build verification must remain separate from exact-deployment authenticated runtime acceptance.

## Admin application

`apps/admin` uses Supabase Auth for operator authentication. The API resolves the Supabase identity to a Neptlium principal, then enforces operator roles and domain authorization server-side.

Dashboard access requires explicit server-owned administrative authorization. Authentication alone is never sufficient.

## Neptlium Treasury

Neptlium Treasury uses Supabase Auth for user identity. Organization authority, treasury permissions, approvals, policy, and payment execution remain separate server-owned authorization domains.

## API

The API verifies Supabase access tokens, obtains the immutable authenticated subject, resolves the `SUPABASE_AUTH` subject through durable identity storage, and performs server-side authorization from the stable principal.

Missing mapping storage, invalid token, ambiguous mapping, suspended/retired principal, or unavailable identity infrastructure fails closed.

## Onboarding, profile and identity verification

Four account states are separate and none implies another: **authentication** (Supabase Auth session; proves identity of the session only), **onboarding** (profile setup), **account standing** (operator suspend/activate decisions) and **identity verification**. None of them authorizes regulated financial activity; financial routes keep their own authorization chain and do not consult these states.

### CURRENT

- `GET /v1/account/status` returns `onboarding` (`NOT_STARTED`/`IN_PROGRESS`/`COMPLETED`, derived from `profiles.provisioned_at` and the onboarding draft), `standing` (`RESTRICTED` only for `suspended`/`revoked`) and `identity_verification`.
- `profiles.compliance_status` is account standing. It defaults to `pending` for every account, `complete_account_onboarding` writes `pending`, and Admin writes `active`/`suspended`. It is never presented as a verification outcome.
- Identity verification status comes only from Neptlium verification records through the `IdentityVerificationRecordStore` boundary in `apps/api/src/identity-verification.ts`. Providers implement the domain-specific `IdentityVerificationProvider` contract. A provider without a durable record store is not offered. Starting a provider session is not a submission and changes no status.
- No provider or record store is reviewed, so the API runs `DisabledIdentityVerificationProvider` with `UnconfiguredIdentityVerificationRecords`: `capability: NOT_ENABLED`, `record: NOT_CONFIGURED`, `can_start: false`, and session start returns `503 identity_verification_not_enabled`. The App shows a truthful "isn't available yet" state with no status chip and no submission flow.
- `POST /v1/account/profile` updates `first_name`, `last_name` and `display_name` only. Legal-name changes are refused while a record is `PENDING`/`VERIFIED` and fail closed when records cannot be read.
- The App dashboard never redirects to onboarding. It shows a non-blocking setup prompt only when the API reports onboarding incomplete; unknown state shows nothing. Onboarding redirects only forward to the dashboard, so no redirect loop exists.
- Password recovery uses the dedicated `/auth/recovery` exchange (not `/auth/callback`). A short-lived httpOnly marker limits the no-current-password `/reset-password` form to recovery-link sessions; a successful reset signs out all sessions. In-session password changes re-verify the current password.

### TARGET (requires separate authorization)

- A reviewed `identity_verifications` record store (forward migration, append-only status history, service-role writes only) and a provider adapter that verifies provider evidence before normalizing it into records.
- A notification-preference store; until then the App states preferences are not configurable.

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

## TRANSITION — owner-approved Clerk development path

See [Clerk development](CLERK_DEVELOPMENT.md). Production behavior described above remains CURRENT. Clerk is opt-in for App/API development with test keys; it does not activate production or change Admin/Treasury authentication.
