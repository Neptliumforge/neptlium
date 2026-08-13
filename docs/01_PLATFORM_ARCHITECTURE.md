# Neptlium Platform Architecture

**Status:** Authoritative  
**Scope:** System boundaries, implementation state, architectural direction

## 1. Architecture model

Neptlium is a four-application capital operating platform:

- `apps/web` → `neptlium.com`
- `apps/app` → `app.neptlium.com`
- `apps/admin` → `admin.neptlium.com`
- `apps/api` → `api.neptlium.com`

These are deliberate trust and product boundaries.

Neptlium must not collapse privileged financial operations into the customer browser or treat provider systems as canonical financial authority.

## 2. Architecture-state convention

Architecture documentation distinguishes:

### CURRENT

Verified implementation that exists in the repository.

### TRANSITION

Architecture already partially implemented or being migrated.

### TARGET

Approved architectural direction that is not yet complete.

A TARGET capability must never be represented as CURRENT merely because it appears in this document.

## 3. Current repository topology

The repository is a pnpm workspace containing applications under `apps/*` and shared packages under `packages/*`.

Current application packages include:

- `@neptlium/web`
- `@neptlium/app`
- `@neptlium/admin`
- `@neptlium/api`

The customer, admin, and marketing applications use Next.js.

The API is an independent TypeScript server/runtime with its own build, test, serverless, provider, persistence, security, reconciliation, treasury, and worker architecture.

## 4. Public web

**Boundary:** `apps/web`

**Domain:** `neptlium.com`

### CURRENT

The web application contains public product and company experiences including:

- platform
- capital account
- treasury
- allocation
- capital universe
- portfolio intelligence
- research
- security
- trust
- company
- legal surfaces
- Neptlium Link positioning

It is independently deployable from the authenticated application.

### TARGET

The web application remains the public communication layer.

It must describe product capabilities truthfully and must not convert target architecture into claims of production availability.

It contains no authority over customer financial state.

## 5. Authenticated application

**Boundary:** `apps/app`

**Domain:** `app.neptlium.com`

### CURRENT

The application contains:

- authentication/session infrastructure
- authenticated dashboard
- onboarding
- role-aware navigation/security utilities
- API client infrastructure
- allocation service
- deposit service
- transfer service
- wallet service
- withdrawal service
- portfolio module
- treasury module

Current authentication infrastructure remains Supabase-based.

The presence of a service or UI module does not prove the corresponding financial capability is production-ready.

### TARGET

The authenticated application is the customer capital operating environment.

Canonical desktop navigation:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

Canonical mobile navigation:

1. Home
2. Portfolio
3. Capital
4. Allocation

The browser is an interaction surface, not the authoritative financial control plane.

Privileged financial mutations should converge through the Neptlium API.

## 6. Admin application

**Boundary:** `apps/admin`

**Domain:** `admin.neptlium.com`

### CURRENT

The admin application contains authenticated operational infrastructure and data modules for areas including:

- users
- allocations
- deposits
- withdrawals
- transactions
- security

It has independent authentication guards and administrative shell/navigation infrastructure.

### TARGET

Admin becomes the governed operational control plane for review, investigation, approvals, reconciliation exceptions, security operations, and other privileged workflows.

An admin status mutation must never itself be interpreted as proof that an external financial operation executed or settled.

Financial operations should converge through controlled API commands and canonical state transitions.

## 7. API

**Boundary:** `apps/api`

**Domain:** `api.neptlium.com`

### CURRENT

The API application exists and contains implemented foundations for:

- API runtime
- configuration
- domain models
- provider abstraction
- security
- observability
- durable Supabase persistence
- Circle integration
- reconciliation
- treasury logic
- worker infrastructure
- server and serverless runtimes
- automated API tests

The API must therefore not be documented as future-only.

### TARGET

The API is Neptlium's privileged capital-operation boundary.

Responsibilities converge here for:

- authenticated financial commands
- ownership validation
- authorization
- policy enforcement
- idempotency
- reservations
- provider orchestration
- execution intents
- webhook processing
- reconciliation
- canonical ledger interaction
- audit events

Provider credentials remain server-side.

## 8. Data platform

### CURRENT

Supabase provides PostgreSQL-backed persistence and currently participates in authentication and authorization architecture.

Repository migrations contain foundations for:

- user/profile infrastructure
- onboarding
- RBAC
- compliance acknowledgment
- capital operations
- security containment
- API persistence
- ledger accounts
- ledger entries
- ledger postings
- wallet deposits
- wallet withdrawals
- provider webhook events
- API idempotency
- audit/state infrastructure
- reconciliation runs
- reconciliation items
- account provisioning
- account onboarding
- Circle provider-wallet state
- reconciliation state

Applied migrations are historical system evidence and must not be rewritten merely to simplify current architecture.

### TARGET

Supabase remains a core data platform for:

- PostgreSQL
- RLS
- migrations
- persistence
- canonical financial records
- reconciliation
- audit
- storage where appropriate

Authentication becomes separable from the financial ownership model.

## 9. Identity architecture

### CURRENT

Supabase Auth remains integrated into the customer application and current database ownership model.

Some financial persistence currently references Supabase `auth.users`.

This is implementation truth and must not be hidden by future architecture documentation.

### TRANSITION

Neptlium will introduce a provider-independent internal principal/profile boundary.

Financial ownership must migrate deliberately rather than by replacing identifiers unsafely.

### TARGET

Clerk is the intended authentication/session/MFA provider.

The target relationship is:

External identity provider
→ Neptlium principal
→ financial ownership and authorization

The Neptlium principal is the stable product identity boundary.

Changing authentication providers must not require rebuilding canonical financial history.

## 10. Ledger architecture

### CURRENT

The repository contains a durable ledger foundation including:

- ledger accounts
- ledger entries
- ledger postings
- supported asset/network constraints
- balanced-entry enforcement
- references between wallet operations and ledger entries
- durable persistence

The database includes enforcement intended to prevent unbalanced ledger entries by asset and network.

### TARGET

Canonical financial state is derived from governed ledger and reconciliation architecture rather than directly from provider balances.

The ledger must preserve:

- append-only history
- precise asset quantities
- balanced financial movement where applicable
- durable references
- idempotency
- reservations/holds
- auditable state transitions
- compensating/reversal entries
- reconciliation

Historical financial records must not be destructively rewritten.

## 11. Provider architecture

Providers extend Neptlium capabilities but do not become Neptlium's domain authority.

### Circle — CURRENT FOUNDATION

The repository contains Circle Developer-Controlled Wallets integration and a Circle provider persistence migration.

Current architecture includes concepts for:

- Circle provider wallets
- provider wallet identifiers
- wallet sets
- blockchain/address observations
- provider status
- reconciliation state
- provider observations

Circle data remains provider evidence until reconciled into Neptlium financial truth.

Current implementation and environment determine whether any specific operation is actually available.

### Stripe Treasury — CURRENT GATED CODE; Stripe Onramp — TARGET

The repository contains a server-side Stripe Treasury adapter for eligibility- and execution-gated USD ACH inbound-transfer submission. Stripe Onramp remains target architecture.

Potential responsibilities include:

- supported fiat funding
- supported payment/bank rails
- USD/EUR/GBP where actually available
- Stripe Onramp where approved and available
- webhook ingestion
- provider evidence
- reconciliation

Adapter presence does not prove live Treasury eligibility, deployed configuration, provider execution, canonical availability, ledger posting, or reconciliation.

### Alchemy — NOT CANONICAL AUTHORITY

Alchemy may support chain/RPC/observation infrastructure where adopted.

It must never become ledger or authorization authority.

### Equities — FUTURE

A brokerage/equities provider has not been established as canonical architecture by implementation evidence.

Provider selection requires technical, operational, legal, jurisdictional, and API capability review.

No equity execution capability may be claimed before that review and implementation.

## 12. Reconciliation

### CURRENT

The API and database contain reconciliation infrastructure.

Current Circle persistence explicitly distinguishes reconciliation states including concepts such as:

- unreconciled
- matched
- mismatch
- review required

### TARGET

All provider-backed financial operations must converge on explicit reconciliation.

Provider observation
→ normalization
→ matching
→ reconciliation classification
→ canonical financial consequence

A provider reporting a balance or transaction does not by itself establish Neptlium ledger truth.

## 13. Treasury

### CURRENT

The API contains treasury logic and the authenticated application contains a treasury module.

This proves architectural groundwork, not necessarily complete customer-facing Treasury capability.

### TARGET

Treasury represents reconciled operational capital state including:

- Available
- Reserved
- Committed
- Pending
- Restricted
- Reserve requirement
- Reserve coverage
- Liquidity state

Treasury consumes canonical/reconciled state.

It is not merely a provider-balance projection.

## 14. Capital operations

The architecture separates customer intent from financial consequence.

Target pattern:

Customer action
→ authenticated request
→ Neptlium API
→ ownership validation
→ authorization/policy
→ idempotent intent
→ reservation where required
→ internal ledger operation or provider submission
→ provider observation
→ reconciliation
→ canonical financial state
→ customer/admin read models

Not every operation requires every stage, but no stage may be silently assumed when financial correctness depends on it.

## 15. Allocation

Allocation is a governed capital-intelligence layer.

Modeling is separate from execution.

Target progression:

Observed
→ Modeled
→ Proposed
→ Under Review
→ Approved
→ Reserved
→ Submitted
→ Settling
→ Settled

Allocation execution must use the same authorization, reservation, provider, ledger, reconciliation, and audit architecture as other financial operations.

AI may assist interpretation and modeling.

AI must not silently authorize or move capital.

## 16. Transfer architecture

The authenticated application already contains transfer service groundwork.

This does not establish complete alias-transfer capability.

Target flow:

alias
→ recipient resolution
→ recipient verification
→ asset/network validation
→ available-capital validation
→ transfer intent
→ authorization
→ reservation
→ internal ledger movement or reviewed provider execution
→ reconciliation
→ activity history

Internal and external transfers must be distinguishable.

## 17. Trust boundaries

### Browser

Untrusted for privileged financial authority.

### Authenticated app server

Trusted only within explicitly implemented server-side responsibilities.

### API

Primary privileged financial-command boundary.

### Database

Durable system state protected through server authorization, constraints, RLS where applicable, and controlled privileged access.

### Provider

External system supplying capability or evidence.

Never canonical merely because the provider reports an event.

### Admin

Privileged operational actor subject to authorization, audit, and financial-state rules.

## 18. Architectural invariants

Neptlium architecture must preserve:

1. Financial truth over UI convenience.
2. Provider evidence separate from canonical state.
3. Server-side privileged operations.
4. Explicit ownership validation.
5. Idempotent financial commands.
6. Append-only financial history.
7. Reconciliation before settled truth where required.
8. Auditable administrative actions.
9. Provider-independent product/domain modeling.
10. Current capability clearly separated from target architecture.

## 19. Evolution rule

New providers, assets, funding rails, identity systems, and execution capabilities should extend stable Neptlium primitives rather than redefine them.

The desired long-term dependency direction is:

Experience
→ Neptlium domain
→ Neptlium financial controls
→ provider adapters

not:

Experience
→ provider-specific financial model

This separation is fundamental to Neptlium's ability to evolve safely.
