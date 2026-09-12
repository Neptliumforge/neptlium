# Neptlium Platform Architecture

**Status:** Authoritative

## System boundaries

Neptlium is a four-application capital operating platform:

- `apps/web` → `neptlium.com`
- `apps/app` → `app.neptlium.com`
- `apps/admin` → `admin.neptlium.com`
- `apps/api` → `api.neptlium.com`

These are deliberate trust boundaries. Public Web has no privileged financial authority. App and Admin are authenticated interaction surfaces. API is the privileged authorization, product-state, provider, ledger, webhook, audit, and reconciliation boundary.

## Authentication and identity

Clerk is the current and only runtime authentication/session/recovery/MFA provider for customer and operator surfaces.

App/Admin send Clerk bearer tokens to API. API verifies Clerk, resolves the verified `CLERK` subject to a stable Neptlium principal, and performs Neptlium-owned authorization from that principal.

Supabase Auth is not part of runtime authentication. Supabase may remain server-side persistence infrastructure. Historical legacy identity rows/migrations are retained as migration evidence and must not be rewritten.

## Authenticated application

`apps/app` contains Clerk authentication, dashboard/onboarding, role-aware navigation, API-client infrastructure, and product workspaces including Capital Account, Treasury, Portfolio, Companies and Allocation.

The target customer hierarchy is:

1. Overview
2. Assets / Capital Account
3. Deposit
4. Treasury
5. Portfolio
6. Companies
7. Allocation
8. Activity / Documents / Settings

The browser does not determine canonical balances or privileged financial consequence.

## Admin

`apps/admin` authenticates operators with Clerk and delegates role/financial authorization to API. Admin is for investigation, review, approval, reconciliation exceptions, security operations, capability visibility, and other governed workflows.

An admin status update alone never proves execution or settlement.

## API

`apps/api` owns:

- Clerk bearer-token verification;
- stable-principal resolution;
- ownership and role authorization;
- product/business state;
- idempotency;
- policy and compliance enforcement;
- reservations;
- provider adapters and evidence;
- execution intents;
- signed webhook ingestion;
- canonical ledger interaction;
- reconciliation;
- audit.

Provider credentials remain server-side.

## Persistence

Supabase is used where configured as durable server-side PostgreSQL/persistence infrastructure: migrations, repositories, RPCs, RLS/constraints, audit, provider inboxes, identity mapping storage, financial records, and reconciliation.

Its service-role key is infrastructure authority, not a user credential. Browser/server Supabase Auth session clients are not part of the current application authentication architecture.

## Identity persistence

Stable Neptlium principal UUIDs separate external authentication identity from financial ownership. Existing ownership UUIDs must be preserved during identity migrations.

Forward migrations are append-only/reviewed. Historical migrations that reference older authentication architecture remain historical evidence; current runtime behavior is defined by current application/API source plus the latest approved forward migration.

## Financial truth

Provider observations are evidence, not automatically canonical state. Canonical financial state must preserve precise units, idempotency, append-only history, authorization, reservations/holds where appropriate, balanced postings where applicable, and reconciliation.

The platform distinguishes observed, modeled, proposed, approved, submitted, provider-observed, pending, settled and reconciled state rather than collapsing them.

## Deposit architecture

Deposit is a first-class Capital Account workflow. The governing architecture is [`16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](./16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).

Target crypto asset/network combinations and Stripe USD funding are capability-controlled architecture. They are not production claims until the server capability registry, provider integration, compliance, posting and reconciliation path are certified.

## Provider architecture

Circle, Alchemy, Stripe and future providers are adapters. Clerk is identity infrastructure. Supabase is persistence infrastructure. None of them replaces Neptlium's authorization, ownership, ledger, lifecycle, audit, or reconciliation model.

## Trust boundaries

- **Browser:** untrusted for privileged financial authority.
- **App/Admin server:** authenticated presentation/orchestration within explicit responsibilities.
- **API:** privileged financial-command boundary.
- **Database:** durable constrained state.
- **Provider:** external capability/evidence.
- **Operator:** privileged actor subject to authentication, authorization and audit.

## Architectural invariants

1. Clerk-only runtime authentication.
2. Stable provider-independent Neptlium principals.
3. Explicit ownership and authorization.
4. Server-side privileged operations.
5. Provider evidence separate from canonical state.
6. Idempotent financial commands.
7. Append-only financial history.
8. Reconciliation before settled truth where required.
9. Auditable administrative actions.
10. Target capability never presented as live solely because source architecture exists.
