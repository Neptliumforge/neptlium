# Neptlium Authenticated Application

**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## Purpose

The authenticated application is Neptlium's governed capital operating environment. It presents authoritative customer state across Capital, Treasury, Portfolio, Allocation, Companies, Activity, Documents, Notifications, and Settings, while keeping intent, authority, provider evidence, ledger state, settlement, and reconciliation distinct.

The browser is an interaction and projection surface. It is never an independent source of financial truth.

## Identity boundary

Clerk is the sole customer authentication, browser-session, recovery, and MFA authority.

- Root/auth surfaces use Clerk components.
- Clerk middleware protects authenticated routes.
- Server components and actions use Clerk server session APIs.
- The API client sends the current Clerk bearer token to `api.neptlium.com`.
- No Supabase Auth client, cookie refresh, password endpoint, legacy session proof, or paired-session identity bridge is part of the application.

First authenticated completion calls the Clerk-backed API bootstrap. Existing principal continuity is resolved from server-verified Clerk identity and the forward Clerk-only identity migration; new users continue to onboarding.

## API and authorization boundary

`apps/api` owns privileged financial authority: token verification, principal resolution, ownership, roles, idempotency, provider isolation, canonical ledger operations, policy, audit, and reconciliation.

Clerk authenticates. It does not become the canonical financial owner, role database, compliance authority, or ledger authority. Those remain Neptlium domain concerns attached to the stable principal.

Supabase may remain behind the API as server-side persistence infrastructure only. It is not a customer authentication authority.

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

The authenticated product is deliberately dark and restrained: near-black canvas, low-contrast carbon surfaces, hairline structure, high-contrast typography, tabular financial numerals, and Neptlium Mineral Teal as a limited action/authority accent. It does not use decorative financial curves, neon crypto styling, pervasive glass, or marketing-scale typography.

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

Activity, Documents, Notifications, and Settings preserve API authority while sharing the authenticated bootstrap. Mutation actions such as downloads, notification acknowledgement, and authentication controls retain their existing governed server/action boundaries.

## Deposit architecture

Deposit is a first-class workflow. The server contracts are defined in [`16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](./16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).

The product must never expose a crypto address, fiat funding method, asset/network combination, or Stripe flow unless the API reports a verified capability for the current user and environment.

## Governing rule

`apps/app` communicates state and requests governed work. Consequential financial state becomes canonical only after server authentication, authorization, durable evidence, posting, settlement where applicable, and reconciliation.
