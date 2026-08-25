# Deployment

Neptlium has four independently deployable application boundaries and one coordinated production-integration phase. This document records repository and release authority; it does not convert source configuration into verified production capability.

## Applications

| Application  | Domain               | Boundary                                                                              |
| ------------ | -------------------- | ------------------------------------------------------------------------------------- |
| `apps/web`   | `neptlium.com`       | Public institutional marketing and information; no privileged financial authority.   |
| `apps/app`   | `app.neptlium.com`   | Authenticated customer capital operating application.                                |
| `apps/admin` | `admin.neptlium.com` | Role-gated internal operations, risk, control, and audit console.                     |
| `apps/api`   | `api.neptlium.com`   | API, authorization, provider, repository, webhook, financial-control, and audit boundary. |

The API application exists now. Its Vercel configuration builds the TypeScript service and routes requests through `api/index.js`; it is not a future-only component.

## Production execution program

Production reconstruction proceeds in five explicit executions:

1. **Web** — reconstruct and certify `apps/web` on `neptlium.com`, with `www.neptlium.com` converging on the canonical apex domain; complete institutional design, SEO, metadata, accessibility, performance, and claim truth.
2. **App** — complete `apps/app` authentication, sign-up/sign-in, onboarding, dashboard, canonical customer navigation, state handling, and production build using the same Neptlium design identity with operational composition.
3. **Admin** — complete `apps/admin` as the governed operator surface for users/principals, organizations, compliance, capital operations, transfers, treasury, allocation governance, reconciliation, provider evidence, and audit.
4. **API** — complete `apps/api` as the shared application/domain authority for App and Admin, with compatible identity mode, durable Supabase persistence, authorization, idempotency, audit, provider isolation, webhooks, reconciliation, and fail-closed capability gates.
5. **Production integration and certification** — coordinate Clerk, Supabase, provider credentials/capabilities, domains, environment variables, migrations, observability, security, controlled deployment, smoke testing, rollback readiness, and release provenance.

A successful build in any earlier execution does not authorize or imply completion of Execution 5.

## CURRENT repository deployment model

- Canonical repository authority is `Neptliumforge/neptlium`.
- Each app has its own package and Vercel project root: `apps/web`, `apps/app`, `apps/admin`, and `apps/api`.
- Web, App, and Admin are Next.js applications; API is a Node.js/TypeScript serverless service.
- All four Vercel projects are intended to source from the canonical repository while preserving independent root directories and release health.
- Supabase migrations are a separately reviewed, append-only deployment stream. Application deployment must not silently apply migrations.
- Production environment state is verified independently from source. Missing or stale environment variables remain production defects even when source builds successfully.

## Environment boundaries

### Public Web

Public Web should require no privileged runtime secret. If environment values are introduced, only genuinely browser-safe values may use `NEXT_PUBLIC_*`. Public Web never receives service-role or provider credentials.

### Authenticated App

Clerk is the intended browser authentication/session authority in current application source. Runtime configuration includes the Clerk publishable key and server-side Clerk secret plus App/API routing values. App does not receive Supabase service-role credentials or provider execution secrets.

### Admin

Admin uses the same Clerk identity authority while preserving separate operator authorization and server-side API boundaries. Clerk authentication is not sufficient authorization for administrative or financial actions. Admin never exposes Supabase service-role or provider secrets to client components or logs.

### API

API is server-only and owns durable data/provider configuration. Current source supports:

- `API_AUTH_MODE=SUPABASE|DUAL|CLERK`, defaulting to `SUPABASE`;
- durable Supabase URL, anon/publishable compatibility key, and service-role access;
- Clerk verification and authorized-party configuration for `DUAL`/`CLERK` modes;
- Circle, Alchemy, and Stripe Treasury configuration with explicit capability and execution gates;
- allowed-origin, logging, webhook-tolerance, and mainnet controls.

`DUAL` or `CLERK` API mode must not be enabled against a production schema that lacks the provider-independent identity foundation and corresponding mappings.

## Identity deployment sequencing

The production database may remain on Supabase Auth compatibility while App/Admin source has moved toward Clerk. Treat this as a transition state, not as permission to mix incompatible runtime modes.

The controlled identity sequence is:

1. Restore API durable Supabase connectivity and keep `API_AUTH_MODE=SUPABASE` while production lacks provider-independent identity tables.
2. Apply and verify the provider-independent identity foundation under separate migration authorization.
3. Apply and verify Clerk linking/lifecycle commands during the controlled bridge.
4. Verify existing principal mappings and App/Admin Clerk runtime configuration.
5. Apply the Clerk application cutover migration only as a coordinated release with compatible App/Admin/API behavior.
6. Switch API auth mode deliberately and verify authentication, ownership, roles, onboarding, treasury authorization, audit, and rollback behavior.

Application deployment and migration application remain separate approvals.

## Provider principles

- Configuration presence does not prove capability.
- Capability verification does not itself authorize live execution.
- Live execution requires explicit reviewed enablement, compatible provider environment, authorization, durable state, posting/reconciliation design, and operational evidence.
- Keep Stripe Treasury, Circle, and Alchemy execution/capability flags fail-closed until their respective production checks are complete.
- Preview/staging must not point at production financial execution by convenience.
- Provider environment and database environment must agree; mixed testnet/production configurations fail closed.
- Rotate and revoke credentials through provider/platform controls, not source edits.

## Domain and canonical-host policy

The intended production domains are:

- `https://neptlium.com` — canonical public marketing origin.
- `https://www.neptlium.com` — redirect/alias to the canonical apex origin, not a separate SEO authority.
- `https://app.neptlium.com` — customer application.
- `https://admin.neptlium.com` — operator application.
- `https://api.neptlium.com` — API origin.

Canonical URLs, sitemap URLs, structured-data URLs, Open Graph URLs, redirects, DNS/Vercel domain bindings, and cross-surface links must agree with this model.

## Build and release gates

At minimum, run repository-supported formatting/diff checks, lint, typecheck, tests, and builds proportionate to the change. Financial/provider changes additionally require:

- migration dry-run and review;
- ownership/RLS and negative authorization tests;
- idempotency, concurrency, replay, timeout, and retry tests;
- balanced-ledger and append-only tests where applicable;
- provider sandbox/testnet verification;
- webhook official-contract verification;
- reconciliation and rollback/compensation rehearsal;
- observability and secret-redaction review.

No capability is advertised as live from a successful build alone.

### Completion-to-main gate

For each of the five production executions, local success is only an intermediate state. An execution may be reported **complete** only when all of the following are true:

1. The execution's required source, UX, accessibility, SEO/security/domain, and production-readiness checks have passed or have an explicitly accepted non-applicable status.
2. Every intended repository change is committed; no required change exists only as an uncommitted local modification.
3. The completed change set is pushed to `Neptliumforge/neptlium` and is reviewable from GitHub.
4. The completed change set is integrated into canonical `main` through the repository's normal merge path; validated execution work must not be left permanently on a feature branch.
5. GitHub `main` is fetched/re-read after integration and its SHA is verified to contain the execution's completed changes.
6. The working environment is synchronized back to `origin/main`, with unrelated local work preserved explicitly rather than silently discarded.
7. The final report records the canonical `main` SHA and identifies any remaining `FAIL`, `BLOCKED`, or `NOT RUN` production checks separately from repository completion.

If validation fails or an external prerequisite blocks the execution, do not merge merely to remove branch divergence. The execution remains open until the defect is fixed or the blocker is resolved. Conversely, once an execution satisfies its completion gates, leaving the validated result only local, only committed locally, only pushed to a feature branch, or otherwise absent from GitHub `main` is itself an incomplete release state.

This completion-to-main authorization covers repository commit/push/PR/merge actions for the five-execution reconstruction program. It does not grant implicit authority for production deployments, database migration application, environment-variable mutation, provider configuration, production data mutation, payment/financial execution, or capability-flag enablement; those remain separate controlled actions.

## Release coherence

A production release is coherent only when the following identify the same reviewed state:

- canonical Git SHA and branch;
- Vercel project/root and deployment IDs;
- domain/canonical-host routing;
- environment variable set and provider mode;
- applied database migration version;
- identity model and API auth mode;
- provider capability/execution gates;
- smoke tests, runtime errors/logs, and observability;
- rollback-compatible code/schema state.

Report each check as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. A READY deployment is not by itself a production-health PASS.

## Database migrations

- Do not modify applied migration files.
- Add forward-only corrective migrations with explicit review.
- Review privilege, RLS, locking, data backfill, reversibility, and environment scope.
- Apply staging/branch proof first when appropriate and verify invariants before production.
- Application deploy and migration apply are separate approvals.

## Rollback

Code rollback must remain compatible with the deployed schema. Financial events already accepted are not erased by rollback. Use forward fixes, disabled capability flags, compensating entries, reconciliation, and provider lookup as appropriate.

The containment rollback reference under `docs/security` must not be executed automatically.
