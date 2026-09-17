# Neptlium Authenticated Application

**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## Purpose

The authenticated application is the individual Neptlium Capital experience. It presents the customer's portfolio, available capital, supported investment discovery, activity and account controls while preserving the authority and evidence boundaries beneath the interface.

The browser is an interaction and projection surface. It is never an independent source of financial truth.

## Identity boundary

Supabase Auth is the sole active customer authentication and browser-session authority.

- Root/auth surfaces use Neptlium-owned Supabase Auth forms and session helpers.
- Session refresh protects authenticated routes.
- Server components and actions use Supabase server-session APIs.
- The API client sends the current Supabase access token to `api.neptlium.com`.
- Service-role credentials never enter the browser.
- No retired-provider session bridge is part of the active application.

First authenticated entry resolves the verified Supabase Auth subject to the stable Neptlium principal. Existing principal continuity is preserved by forward migration; new users continue through governed provisioning/onboarding.

## API and authorization boundary

`apps/api` owns privileged financial authority: token verification, principal resolution, ownership, roles, idempotency, provider isolation, canonical ledger operations, policy, audit, and reconciliation.

Supabase Auth authenticates. It does not become the canonical financial owner, role database, compliance authority, or ledger authority. Those remain Neptlium domain concerns attached to the stable principal.

## Product-state contract

Loading, confirmed zero, unavailable, error, pending, reserved, allocated, provider-observed, settled, and reconciled states are distinct.

- Unknown is not zero.
- Unavailable is not `$0`.
- Pending is not settled.
- Authorization is not execution.
- Provider confirmation is not ledger posting or reconciliation.
- Executed is not necessarily reconciled.
- A browser success screen is not proof that funds moved.

If evidence is unavailable, the UI renders a truthful unavailable/unknown state instead of inventing a value, chart, position, return, allocation, or provider status.

## Authenticated product system

The authenticated product is deliberately restrained and information-first. Product UI does not use decorative financial curves, neon crypto styling, or marketing-scale typography to imply financial truth.

The dashboard layout owns one shared authenticated bootstrap projection. Overview, Portfolio, Invest, Activity and supporting account surfaces consume that shared snapshot so navigation is immediate and one unavailable projection does not blank unrelated account state. The snapshot refreshes in the background while the customer remains active.

Desktop hierarchy:
- Overview
- Portfolio
- Invest
- Activity
- More
- Account: Help & Support, Settings

Mobile primary navigation:
- Overview
- Portfolio
- Invest
- Activity
- More

`More` exposes personal Capital actions, Allocation, Companies, Documents, Notifications and Settings. Treasury is not part of individual navigation; its separate organization onboarding may be offered contextually.

## Surface responsibilities

### Overview
Answers: "What is my capital position? What can I invest? What changed?" It prioritizes portfolio value when available, available capital, performance, investments and recent activity. Deposit, Invest, Transfer and Withdraw remain explicit actions. Funding or movement routes remain capability-driven and fall back to review states when availability is unknown.

### Capital
Presents canonical customer capital and its available, reserved, and pending states. Asset values remain separated when there is no authoritative cross-asset conversion basis.

### Portfolio
Presents reconciled investment valuation and positions when the canonical portfolio projection supports them. Missing valuation, performance history, allocation, or positions remain explicitly unavailable; the UI never substitutes decorative charts or fabricated zeros.

The individual Portfolio information architecture is **Overview → Positions → Allocation → Performance → Income → Documents**. Capital balances are not automatically investment positions, public research coverage is not ownership, and a recorded position is not a valuation without required pricing and reconciliation evidence.

### Allocation
Presents the governed lifecycle as distinct MODEL → REVIEW → APPROVE → RESERVE → EXECUTE → RECONCILE responsibilities. Modeled or approved state never implies execution or reconciliation.

### Invest
Provides the individual discovery entry point and exposes only opportunities, terms, documents, risks and eligibility supported by current product data.

### Records and Settings
Activity, Documents, Notifications, and Settings preserve API authority while sharing the authenticated bootstrap. Mutation actions retain governed server/action boundaries.

## Deposit architecture

Deposit is a first-class workflow. Server contracts remain defined in [`16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](./16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).

The product must never expose a crypto address, fiat funding method, asset/network combination, or Stripe flow unless the API reports a verified capability for the current user and environment.

### Funding-to-activity vertical

The canonical individual journey is:

`Overview/Capital → Add money → choose an enabled method → create funding intent → receive account-specific instructions → Activity → verified financial state`

Creating instructions is not a deposit, settlement, reconciliation or balance credit. A successfully created intent is permitted to appear as pending account activity, while canonical capital changes only after the existing server-side evidence, posting, settlement and reconciliation requirements are satisfied.

After a funding intent is created, the application revalidates Overview, Capital, Activity and funding surfaces so the investor can follow the lifecycle without relying on stale browser state. Failure to verify funding capabilities fails closed and no address is issued.

Customer-facing funding copy should describe the action and outcome in investor language. Provider topology and internal lifecycle terminology are exposed only where required to prevent a misleading financial state.

## Governing rule

`apps/app` communicates state and requests governed work. Consequential financial state becomes canonical only after server authentication, authorization, durable evidence, posting, settlement where applicable, and reconciliation.
