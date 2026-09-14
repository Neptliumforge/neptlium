# Neptlium Platform Architecture

**Status:** Authoritative

## System boundaries

Neptlium is a multi-application capital operating platform. Current repository boundaries include public Web, authenticated App, Admin, API, and dedicated product-family applications where present.

Public Web has no privileged financial authority. App and Admin are authenticated interaction surfaces. API is the privileged authorization, product-state, provider, ledger, webhook, audit, and reconciliation boundary.

## Authentication and identity

Supabase Auth is the sole active runtime authentication/session provider for customer and operator surfaces.

App/Admin obtain Supabase sessions and send the current access token to API. API verifies the Supabase identity, resolves the verified `SUPABASE_AUTH` subject to a stable Neptlium principal, and performs Neptlium-owned authorization from that principal.

Historical identity rows and migrations may remain as migration evidence. They are not runtime authentication authority and must not be rewritten merely to erase history.

## Authenticated application

`apps/app` contains Supabase authentication, dashboard/onboarding, role-aware navigation, API-client infrastructure, and product workspaces including Capital, Treasury, Portfolio, Companies and Allocation.

The browser does not determine canonical balances or privileged financial consequence.

## Admin

`apps/admin` authenticates operators with Supabase Auth and delegates role/financial authorization to API. Admin is for investigation, review, approval, reconciliation exceptions, security operations, capability visibility, and other governed workflows.

An authenticated operator is not automatically an administrator. An admin status update alone never proves execution or settlement.

## API

`apps/api` owns:

- Supabase bearer-token verification;
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

Supabase provides durable PostgreSQL/persistence infrastructure, migrations, repositories, RLS/constraints, audit, provider inboxes, identity mapping storage, financial records, and reconciliation.

The service-role key is infrastructure authority, never a user credential and never browser-visible.

## Identity persistence

Stable Neptlium principal UUIDs separate authentication identity from financial ownership. Existing ownership UUIDs must be preserved during identity migrations.

Forward migrations are append-only and reviewed. Historical migrations that reference retired authentication architecture remain evidence; current runtime behavior is defined by current application/API source plus the latest approved forward migration.

## Financial truth

Provider observations are evidence, not automatically canonical state. Canonical financial state must preserve precise units, idempotency, append-only history, authorization, reservations/holds where appropriate, balanced postings where applicable, and reconciliation.

The platform distinguishes observed, modeled, proposed, approved, submitted, provider-observed, pending, settled and reconciled state rather than collapsing them.

## Deposit architecture

Deposit is a first-class Capital Account workflow. The governing architecture is [`16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](./16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).

Target crypto asset/network combinations and USD funding are capability-controlled architecture. They are not production claims until the server capability registry, provider integration, compliance, posting and reconciliation path are certified.

## Provider architecture

Circle, Alchemy, Stripe and future providers are adapters. Supabase Auth provides identity and Supabase provides persistence. None replaces Neptlium's authorization, ownership, ledger, lifecycle, audit, or reconciliation model.

## Trust boundaries

- **Browser:** untrusted for privileged financial authority.
- **App/Admin server:** authenticated presentation/orchestration within explicit responsibilities.
- **API:** privileged financial-command boundary.
- **Database:** durable constrained state.
- **Provider:** external capability/evidence.
- **Operator:** privileged actor subject to authentication, authorization and audit.

## Architectural invariants

1. Supabase Auth is the sole active authentication system.
2. Stable provider-independent Neptlium principals.
3. Explicit ownership and authorization.
4. Server-side privileged operations.
5. Provider evidence separate from canonical state.
6. Idempotent financial commands.
7. Append-only financial history.
8. Reconciliation before settled truth where required.
9. Auditable administrative actions.
10. Target capability never presented as live solely because source architecture exists.
