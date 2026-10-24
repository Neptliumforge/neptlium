# App and API architecture reconciliation — Clerk target

**Status:** In-progress source-backed engineering assessment; **not** a certification that every source line was reviewed.  
**Scope:** `apps/app` (202 tracked files, ~649 KB), `apps/api` (126 tracked files, ~739 KB) on `audit/authenticated-app-funding-target`; compared against Clerk PR #142. File counts are from the GitHub tree at the inspection checkpoint.

## Approved target, current implementation, transition

| Boundary | CURRENT audit branch | TRANSITION in PR #142 | TARGET |
| --- | --- | --- | --- |
| Browser identity | Supabase Auth SSR/browser session | Development-only Clerk custom flows | Clerk authentication and user management |
| App proxy | `refreshSupabaseSession` | Conditional Clerk middleware/guards | Single reviewed Clerk session path |
| App API bearer | Supabase access token | Clerk token in dev mode | Clerk-issued, API-verified bearer token |
| API verification | `/auth/v1/user` + Supabase subject | Clerk signature, issuer, authorized party, live session, verified email | Strict Clerk verification, revocation and fail-closed behavior |
| Principal | `SUPABASE_AUTH` subject -> internal UUID | `CLERK` subject -> internal UUID | Stable Neptlium principal independent of external provider |
| Database | Supabase/Postgres + service-only persistence | Disposable development Clerk SQL | Supabase for business data; no Supabase Auth as customer login |
| Authorization | API roles, policy, ownership, compliance | Preserved | Remains API/server-owned, never inferred from Clerk identity |
| Admin/Treasury | Supabase Auth | Explicitly not migrated in PR #142 | Requires separate scope and migration decision |

## Actual source contracts inspected

- `apps/app/README.md` currently says Supabase Auth is sole browser authority; its statements describe current audit code, not owner-approved target.
- `apps/app/proxy.ts` refreshes Supabase sessions, overwrites untrusted return headers, redirects protected `/dashboard` and `/onboarding` routes. Clerk integration must retain safe-return behavior and avoid trusting caller headers.
- `apps/app/lib/api/client.ts` is server-side API client; preserve bearer-token forwarding, request correlation, bounded timeouts, retry-only-reads, and financial truth.
- `apps/api/src/config.ts` currently types `ApiAuthMode = 'SUPABASE'` and hardcodes `AUTH_MODE` to Supabase; this is a real integration seam.
- `apps/api/src/authentication.ts` verifies Supabase bearer token via Supabase Auth `/auth/v1/user`, then maps `SUPABASE_AUTH` subject to a stable principal.
- `apps/api/src/identity-principal.ts` rejects non-Supabase provider at runtime. Clerk transition requires an explicit guarded provider mapping and continuity proof.
- `apps/api/src/app.ts` composes the principal authenticator and financial route handlers; it is a security-critical seam, not a place for unreviewed blanket auth replacement.
- `docs/architecture/ARCHITECTURE.md`, `docs/architecture/API.md`, `docs/platform/IDENTITY.md`, `apps/app/README.md` and `apps/api/README.md` need simultaneous implementation-linked updates.
- `docs/financial/FUNDING.md` currently says the server authenticates Supabase Auth sessions before deposit intents; replace provider-specific language only when Clerk runtime is actually integrated. Preserve all financial gates.

## Integration hazards to resolve

1. **Diverged branches:** Clerk PR #142 is two commits ahead, 24 behind audit branch; rebase/cherry-pick review must account for newer App routes and tests.
2. **Migration contradiction:** tracked Supabase Auth-only cutover revokes Clerk mappings. No live database application until a disposable full-chain compatibility exercise and forward-only migration review.
3. **Principal continuity:** Never create duplicate financial principals for existing accounts; email is not sufficient to link ownership. A verified account-linking ceremony must be separately designed.
4. **Surface scope:** App/API Clerk development code does not automatically migrate Admin and Treasury; their authentication and authorization boundaries must be mapped.
5. **Production isolation:** Connected Supabase is production. Never apply development SQL or write test identities to that connection. Do not presume a historic project ID is an approved development target.
6. **Runtime acceptance:** Existing 30/30 browser smoke covers unauthenticated rendering and redirects, not genuine Clerk sign-in, OAuth, email delivery, wallet signature, account provisioning or authenticated funding.
7. **Financial safety:** Login, onboarding, wallet linking and verified email do not create ledger balances, payment capability, custody or transfer permission.

## Review matrix for exhaustive follow-up

| Workstream | Files/subsystems | Required evidence |
| --- | --- | --- |
| Identity entry | auth pages, callbacks, proxy, return-context, guards, sessions | Redirect safety, token lifetime, logout, revocation, CSRF, cross-surface behavior |
| Account | onboarding wizard/actions, account profile/status, API account endpoints | Durable one-time provisioning, duplicate/ambiguous mapping denial, standing separation |
| API security | app composition, config, auth, identity-principal, security/rate-limit | Issuer, audience, principal ownership, denial tests, secret handling, fail-closed behavior |
| Financial UI | capital account, deposit, funding, portfolio, allocation | Capability truth, unknown vs zero, no fabricated financial outcomes |
| API finance | funding-domain, financial-routes, repositories, ledger, webhooks | Idempotency, posting authority, provider evidence, reconciliation |
| Platform integration | tests, env examples, CI, deployment, Supabase migration chain | Local reproducibility, branch parity, environment isolation, rollback |
| Documentation | App/API READMEs, identity, architecture, API, funding, security, deployment | CURRENT/TRANSITION/TARGET labels and code-evidence links |

## Sequencing

**First:** review every App/API source file and test in batches and record contract-level discrepancies. **Second:** create a dedicated code integration branch from the newest audited base and port Clerk selectively. **Third:** validate full migration chain in disposable local database. **Fourth:** run real Clerk development-provider acceptance. **Fifth:** update canonical architecture/README statements to match verified merged code, not aspirations.

This assessment is an initial focused reconciliation; no integration code, production DB, DNS, environment, or deployment changes were made.


## Deep file review — Batch 1: App identity, onboarding, funding; API profile and funding state

**Complete files read on audit base (10):** `apps/app/lib/auth/guards.ts`, `apps/app/lib/auth/session.ts`, `apps/app/lib/auth/return-context.ts`, `apps/app/app/(auth)/auth-utils.ts`, `apps/app/app/onboarding/actions.ts`, `apps/app/app/dashboard/capital-account/actions.ts`, `apps/api/src/account-profile.ts`, `apps/api/src/funding-domain.ts`, `apps/app/lib/funding/operation.ts`, `apps/app/lib/funding/scope.ts`.

### Findings and required tests

- **F1 — Provider subject leaks into funding operation scope (integration defect risk):** `fundingOperationScope(user.id)` hashes the external session user's ID. A Supabase -> Clerk transition changes the hash for the same underlying principal, potentially hiding or stranding in-flight per-tab funding operation records. Resolve a verified Neptlium principal from API context before deriving the scope; never accept an unverified client principal ID. Migration of preexisting browser records must not enable cross-account replay. Test existing pending intent recovery, switched users, session expiry and ambiguous POST replay.
- **F2 — Fallback profile ID is external identity:** `fallbackProfile(user)` sets `id: user.id`. Under Clerk, this is not a Neptlium UUID. Keep fallback strictly display-only or model it with a separate `externalSubject` and nullable `principalId`; prohibit passing fallback IDs to API ownership, funding, roles, or ledger attribution. Test API unavailable with authenticated Clerk user.
- **F3 — Role resolution uses external ID:** `getCurrentRole()` and `requireRole()` call `resolveRole(user.id)`. Inspect resolver and any server-side role mapping before Clerk enablement; use durable principal/role authority, not Clerk subject or email.
- **F4 — Auth return validation is a preserved invariant:** `auth-utils.ts` enforces allowlisted dashboard/onboarding routes, rejects dangerous redirects and sensitive query fields, and resolves duplicate/invalid return keys to safe defaults. Preserve across Clerk OAuth and email verification callbacks; test encoded paths, cross-origin returns, duplicated `next`, and session expiry.
- **F5 — Onboarding error handling:** draft read errors return empty state while save/submit errors return generic failures. Verify no silent overwrite of a valid server draft after transient API failures; ensure completion remains one-time and service-authorized.
- **F6 — Funding idempotency and session scope:** `capital-account/actions.ts` validates operation keys, checks account scope, creates one intent, and retrieves instructions separately. `funding/operation.ts` preserves per-tab records and refuses to treat inaccessible storage as empty. Preserve these distinctions during identity migration.
- **F7 — Funding domain financial truth:** `funding-domain.ts` requires reconciled/matched evidence before credit eligibility, uses explicit lifecycle transitions and checks omnibus backing. These are financial invariants, not Clerk-dependent state.
- **F8 — Profile and verification separation:** `account-profile.ts` distinguishes onboarding, standing and verification. Keep identity provider verification separate from regulatory identity verification and financial eligibility.

### Batch 1 completion scope

10 files read completely. 318 App/API tracked files remain outside this batch (some high-risk files were sampled in earlier rounds). Findings are source-review hypotheses until corresponding integration tests are executed. No code changes or runtime tests in this batch.
