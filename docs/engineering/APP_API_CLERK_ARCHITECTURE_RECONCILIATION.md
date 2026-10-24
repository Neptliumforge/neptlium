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
