# Neptlium Authenticated Application

**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## Purpose

The authenticated application is Neptlium's customer operating environment for capital state, Portfolio, Capital Account, Treasury, Allocation, Companies, records, and account controls. It presents authoritative state and requests governed operations; it is not an independent source of financial truth.

## Identity boundary

Clerk is the sole customer authentication, browser-session, recovery, and MFA authority.

- Root/auth surfaces use Clerk components.
- Clerk middleware protects authenticated routes.
- Server components and actions use Clerk server session APIs.
- The API client sends the current Clerk bearer token to `api.neptlium.com`.
- No Supabase Auth client, cookie refresh, password endpoint, legacy session proof, or dual-session linking flow is part of the application.

First authenticated completion calls the Clerk-backed API bootstrap. Existing principal continuity is resolved from server-verified Clerk identity and the forward Clerk-only identity migration; new users continue to onboarding.

## API and authorization boundary

`apps/api` owns privileged financial authority: token verification, principal resolution, ownership, roles, idempotency, provider isolation, canonical ledger operations, policy, audit, and reconciliation.

Clerk authenticates. It does not become the canonical financial owner, role database, compliance authority, or ledger authority. Those remain Neptlium domain concerns attached to the stable principal.

Supabase may remain behind the API as server-side persistence infrastructure only. It is not a customer authentication authority.

## Product-state contract

Loading, confirmed zero, unavailable, error, pending, restricted, reserved, provider-observed, canonical, settled, and reconciled states are distinct.

- Unknown is not zero.
- Pending is not settled.
- Authorization is not execution.
- Provider confirmation is not ledger posting or reconciliation.
- A browser success screen is not proof that funds moved.

If evidence is unavailable, the UI renders a truthful unavailable/unknown state instead of inventing a value.

## Navigation and dashboard direction

The next dashboard design phase uses a premium consumer-finance clarity standard inspired by leading exchange/custody products without copying their UI. The Neptlium expression remains white + green in light mode and deep charcoal + green in dark mode.

Core authenticated hierarchy:

- Overview
- Assets / Capital Account
- Deposit
- Treasury
- Portfolio
- Companies
- Allocation
- Activity
- Documents
- Settings

The Overview should prioritize total assets, available liquidity, quick actions, asset state, portfolio structure, attention, and recent activity rather than backend-status diagnostics.

## Deposit architecture

Deposit is a first-class workflow. The target experience and server contracts are defined in [`16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](./16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md).

The product must never expose a crypto address, fiat funding method, asset/network combination, or Stripe flow unless the API reports a verified capability for the current user and environment.

## Governing rule

`apps/app` is an interaction surface. Consequential financial state becomes canonical only after server authentication, authorization, durable evidence, posting, and reconciliation.
