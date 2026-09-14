# Neptlium Authenticated Application

**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## Purpose

The authenticated application is Neptlium's governed capital operating environment. It presents authoritative customer state across Capital, Treasury, Portfolio, Allocation, Companies, Activity, Documents, Notifications, and Settings, while keeping intent, authority, provider evidence, ledger state, settlement, and reconciliation distinct.

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

The dashboard layout owns one shared authenticated bootstrap projection. Overview, Capital, Treasury, Portfolio, Allocation, Activity, Documents, Notifications, and Settings consume that shared snapshot so navigation is immediate and one unavailable projection does not blank unrelated account state. The snapshot refreshes in the background while the customer remains active.

Desktop hierarchy:

- Overview
- Capital
  - Capital
  - Treasury
- Invest
  - Portfolio
  - Allocation
  - Companies
- Records
  - Activity
  - Documents
  - Notifications
- Account
  - Settings

Mobile primary navigation:

- Home
- Capital
- Portfolio
- Activity
- More

`More` exposes Treasury, Allocation, Companies, Documents, Notifications, and Settings. The mobile product does not duplicate the desktop sidebar as a drawer.

## Surface responsibilities

### Overview

Answers the immediate question: "What is the state of my capital?" It prioritizes canonical capital, liquidity state, reconciled portfolio availability, contextual next actions, allocation state, and recent governed activity. High-value actions render only when the API reports the corresponding capability.

### Capital

Presents canonical customer capital and its available, reserved, and pending states. Asset values remain separated when there is no authoritative cross-asset conversion basis.

### Treasury

Presents liquidity readiness, verified funding routes, destinations, movements, settlement, and reconciliation. Capability retrieval failure is distinct from an authoritative empty or disabled capability set.

### Portfolio

Presents reconciled investment valuation and positions when the canonical portfolio projection supports them. Missing valuation, performance history, allocation, or positions remain explicitly unavailable; the UI never substitutes decorative charts or fabricated zeros.

### Allocation

Presents the governed lifecycle as distinct MODEL → REVIEW → APPROVE → RESERVE → EXECUTE → RECONCILE responsibilities. Modeled or approved state never implies execution or reconciliation.

### Companies

Represents authenticated investment entities and customer exposure only when authoritative account context exists. Public company research remains separate so research coverage cannot be mistaken for a portfolio relationship.

### Records and Settings

Activity, Documents, Notifications, and Settings preserve API authority while sharing the authenticated bootstrap. Mutation actions such as downloads, notification acknowledgement, and authentication controls retain their governed server/action boundaries.

## Deposit architecture

Deposit is a first-class workflow. The server contracts are defined in [`16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](./16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).

The product must never expose a crypto address, fiat funding method, asset/network combination, or Stripe flow unless the API reports a verified capability for the current user and environment.

## Governing rule

`apps/app` communicates state and requests governed work. Consequential financial state becomes canonical only after server authentication, authorization, durable evidence, posting, settlement where applicable, and reconciliation.
