# Neptlium repository-wide alignment and Clerk transition register

**Status:** WORKING AUDIT — not deployment approval.
**Prepared:** 2026-10-24
**Base:** `audit/authenticated-app-funding-target`
**Clerk implementation:** draft PR [#142](https://github.com/Neptliumforge/neptlium/pull/142), `feat/clerk-custom-auth-development`

## Owner-approved direction and verified current state

**TARGET (owner direction):** Clerk owns authentication, registration, sessions, verification and user management. Supabase owns PostgreSQL and backend data, not customer login. Neptlium's API owns durable principal resolution, authorization, financial invariants, ledger and governed commands.

**CURRENT (repository evidence):** `AGENTS.md`, `docs/platform/IDENTITY.md`, `docs/engineering/ENVIRONMENT.md`, and the audit branch App/API still specify Supabase Auth. The newest tracked auth migration, `20260913123000_supabase_auth_only_cutover.sql`, explicitly removes active Clerk mapping functions. Do not label the Clerk target as already deployed.

**TRANSITION:** PR #142 implements a development-only, opt-in Clerk path in App and API, not a production cutover. It explicitly leaves Admin/Treasury on existing authentication and refuses production credentials. Its implementation cannot be merged blindly over the audit branch.

## Verified comparison

- Audit and Clerk branches are **diverged**: Clerk ahead by 2 commits and behind by 24 as inspected on 2026-10-24.
- PR #142 remains **open/draft**, with genuine Clerk provider acceptance and full migration-chain validation blocked according to its PR record.
- Clerk branch introduces `apps/api/src/clerk-authentication.ts`, `apps/app/app/(auth)/components/ClerkAuthForm.tsx`, auth middleware and token adapters, Clerk-specific tests, development environment templates, `docs/platform/CLERK_DEVELOPMENT.md`, and `supabase/development/clerk-auth.sql`.
- The audit branch's unauthenticated App smoke suite passed 30/30 across configured Playwright projects in the Codespace on 2026-10-24. This **does not** establish Clerk end-to-end acceptance.
- The isolated development Supabase project `ntbaoylcrwkowqqvzkno` was inspected read-only: zero public application tables and zero recorded migrations. No schema deployment has been performed.
- A previous project `udghxwlhztwxvkjaefjh` is named in PR #142 as a **new** Supabase project, not verified here as the currently authorized production target. The owner has stated production was replaced. **Do not infer environment roles from project age or prior chat descriptions.** Verify project ID, environment assignment and access controls through an explicit environment inventory before any remote writes.

## Documentation authority and corrections

| Authority | Observed conflict or task | Required correction |
| --- | --- | --- |
| `AGENTS.md` | Mandates Supabase Auth only | After approved integration, distinguish CURRENT deployed auth, TRANSITION Clerk in dev, TARGET Clerk; preserve server-owned financial authorization |
| `docs/platform/IDENTITY.md` | Supabase-only principal/session model | Specify immutable Clerk subject -> stable Neptlium principal mapping, account continuity and fail-closed behavior |
| `docs/engineering/ENVIRONMENT.md` | Browser and API keys assume Supabase Auth | Define Clerk dev/test/production credential ownership separately from Supabase persistence; prohibit mixing environments |
| `docs/architecture/ARCHITECTURE.md` and `docs/architecture/API.md` | Require detailed auth-boundary review | Align issuer/JWKS/session verification, API bearer contracts, principal mapping, Admin/Treasury transition |
| `docs/operations/DEPLOYMENT.md` | Deployment provider migration not verified | Add explicit promotion, rollback, monitoring, credential rotation and environment gates |
| `docs/README.md` | Routes current Supabase-only authority | Link the transition plan with explicit non-production status |
| `supabase/README.md` and migrations | Existing migration history includes competing Clerk/Supabase cutovers | Preserve append-only history; design forward-only compatibility migration, never edit applied migrations |
| `apps/app/README.md`, `apps/api/README.md` | Need runbook review | Update local startup, identity testing and expected error paths after implementation is validated |

Archived documentation is historical evidence only; do not rewrite archives to manufacture a new current authority.

## Ordered engineering execution

1. **Inventory:** Verify main, active branches, open PR overlaps, workflow checks, deployed surface contracts, application dependencies, all tracked migrations, docs and configuration. Capture a reproducible file/branch/commit manifest.
2. **Environment ownership:** Explicitly verify current production Supabase project ID, isolated development project ID, Clerk development instance, Vercel scopes and runtime credentials without disclosing secrets. No production writes.
3. **Authentication integration:** Reconcile Clerk PR #142 against the latest audit branch in a dedicated integration branch; keep existing PR intact. Map all App/API entry points, session refresh, redirects, callbacks, password recovery, account settings and logout. Resolve Admin/Treasury scope separately.
4. **Identity authority:** Preserve existing principal UUIDs, ownership, compliance and ledger attribution; verify JWT issuer, audience/authorized party, signature, expiry, live session, revoked/banned user behavior, verified email, duplicate identity and link-proof requirements.
5. **Database:** Run full historical migration chain on a disposable local database first; identify conflicts with the current Supabase Auth-only cutover; author an append-only forward migration if required; inspect RLS, grants, triggers, privileged functions, advisors and failure rollback. Only then request explicit approval for isolated development remote migration.
6. **Test:** App/API unit, integration, typecheck, lint, build, full Playwright viewport matrix, real Clerk email/social/wallet acceptance with development credentials and test users, onboarding idempotency, cross-user access denial, session revocation and account return continuity.
7. **Financial isolation:** Funding, Treasury, ledger and provider capabilities remain disabled or simulated during auth acceptance. Never infer balances, settlement, custody, or authority from a successful login.
8. **Docs convergence:** Update canonical authorities in the same change as verified implementation; mark CURRENT, TRANSITION, TARGET; link a single operational runbook and maintain a decision log and evidence matrix.
9. **Promotion gates:** Independent security/code review, all required CI green, development acceptance, explicit migration approval, rollback exercise, owner approval for production promotion. No implicit merge or deploy.

## Evidence status

| Gate | Status |
| --- | --- |
| Repository tree and canonical documentation sampled | PARTIAL — broad tree indexed; not a line-by-line read of all 1,163 entries |
| Clerk PR metadata and branch comparison | VERIFIED |
| Development DB public tables and migration inventory | VERIFIED read-only |
| Audit-branch unauthenticated browser smoke | PASS — user-run 30/30 |
| Clerk live provider sign-in, verification, wallet | NOT VERIFIED |
| Full historical Supabase migration chain | NOT VERIFIED |
| Current production project/environment mapping | REQUIRES OWNER/ENVIRONMENT VERIFICATION |
| Full monorepo CI and production parity | NOT VERIFIED |
| Merge, remote schema write, deployment | NOT AUTHORIZED |

## Non-negotiable boundaries

No production database changes, no production environment or DNS edits, no production deployment, no financial-provider activation, no merge to main, no secrets committed. This document records evidence and next actions; it does not certify repository completeness or production readiness.


## Detailed Clerk code reconciliation — follow-up inspection

Inspected Clerk branch source: `apps/app/lib/auth/provider.ts`, `apps/app/lib/auth/session.ts`, `apps/api/src/clerk-authentication.ts`, `supabase/development/clerk-auth.sql`.

- `clerkDevelopmentEnabled` is an explicit opt-in that requires test keys, development environment, and a loopback API. Its default remains `supabase`; this is deliberate development isolation, **not** the approved final provider configuration.
- App session lookup switches to Clerk `currentUser()` in the development mode; business profile state still resolves through the API. Do not conflate the external Clerk user ID with Neptlium's internal principal UUID.
- API verifies JWT signature and exact issuer/authorized party, requires active live Clerk session and user, verified primary email, and resolves an active `CLERK` subject mapping. Review timeout/error handling and token/session caching under real load before production.
- Development SQL creates service-only bootstrap, refuses email-based automatic account linking, enforces normalized email uniqueness, and introduces one-time onboarding evidence. This is **not** a complete schema and intentionally cannot be applied by normal migrations.
- The tracked `20260913123000_supabase_auth_only_cutover.sql` revokes active Clerk subjects and drops Clerk helper functions. The forward-only reconciliation must demonstrate why new development Clerk bootstrap is compatible with this history and how a production cutover would avoid historical principal loss.
- Explicit acceptance cases: returning Supabase-era customer cannot acquire a second principal merely by using the same email; unlinked Clerk user fails closed; API must never trust a browser-supplied principal ID; onboarding must not mint capital, balances or financial authority.

### Open PR inventory — preliminary

Six open PRs were returned by GitHub search at the inspection checkpoint: marketing styling/accessibility/SEO; Clerk development auth (#142); investment catalog publication; controlled platform release reconciliation; canonical balances v2; and Supabase profile-write containment (#109). Detailed cross-PR diff and check-status review remains outstanding. Do not merge these by chronology alone.

### Documentation convergence method

Maintain one current router (`docs/README.md`), one working transition register (this document), subject-owned canonical documents, and archived historical evidence. Avoid a second competing architecture constitution. When runtime changes land, update the corresponding subject authority and tests in the same integration PR; do not rewrite CURRENT claims in advance of implementation.
