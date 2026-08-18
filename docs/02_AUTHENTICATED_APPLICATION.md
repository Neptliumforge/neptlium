# Neptlium Authenticated Application

**Status:** Authoritative  
**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## 1. Purpose

The authenticated application is Neptlium's customer interaction surface for Overview, Portfolio, Capital Account, Treasury, and Allocation. It presents verified state and requests governed operations; it is not an independent source of financial truth.

## 2. Architecture-state convention

- **CURRENT** — verified repository implementation.
- **TRANSITION** — architecture being migrated or consolidated.
- **TARGET** — approved destination architecture that is not yet current.

Source presence does not prove deployment, provider eligibility, live capability, migration application, or financial execution.

## 3. CURRENT identity and API boundary

Supabase Auth provides the current authenticated identity/session infrastructure where configured. Identity/session infrastructure is distinct from financial authorization.

The application has a server-side Neptlium API client that obtains the authenticated session token and calls `apps/api`. Current governed Capital Account reads obtain funding capabilities, canonical balances, funding activity, transfer capabilities/activity, and aliases through `apps/app/lib/api/*`. Funding and allocation server actions call the Neptlium API/domain boundary rather than directly manufacturing canonical financial state.

`apps/api` owns privileged financial authority: server-side authentication and authorization, ownership enforcement, idempotency, provider isolation, canonical ledger operations, policy enforcement, audit, and reconciliation.

Browser checks, route guards, hidden controls, and authenticated UI state are defense-in-depth only. They do not authorize a financial mutation.

## 4. Supabase usage

Supabase may remain identity/session infrastructure and application-data infrastructure where current source uses it. That does not grant the browser canonical financial authority.

Direct browser/server application access may remain only for data explicitly designed for that access under effective RLS and ownership controls. Privileged financial reads/writes, service-role authority, provider credentials, ledger posting, reconciliation, and administrative financial mutations belong behind `apps/api`.

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to browser code.

## 5. Canonical financial truth

- Provider observations are evidence, not canonical state.
- Canonical balances derive from governed ledger state.
- Unknown is not zero.
- Pending is not settled.
- Authorization is not provider submission or execution.
- Provider confirmation is not ledger posting or reconciliation.
- A database status mutation is not proof that money moved.

If required evidence is unavailable, render an explicit unavailable, unknown, pending, or error state rather than a fabricated value.

## 6. Navigation

Canonical desktop primary navigation remains:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

Canonical persistent mobile navigation remains Home, Portfolio, Capital, and Allocation, with Treasury reachable contextually.

Capital Account currently retains the legacy internal route `/dashboard/wallet`; Allocation currently uses `/dashboard/allocations`. Route cleanup is separate product work and must preserve working flows.

## 7. Capital Account

Capital Account is the governed funding and movement surface. Current source routes canonical balance, capability, funding, transfer, and alias reads through the API layer. Funding intent creation is a governed API mutation with idempotency; deposit instructions are returned through the implemented capability path.

The application must not invent an address, rail, balance, provider capability, transaction, or settlement state. Transfer/withdrawal experiences must fail closed when durable authorization, reservation, provider capability, or reconciliation requirements are unavailable.

## 8. Portfolio and Treasury

Portfolio represents canonical holdings/composition only where sufficient canonical and valuation evidence exists. Provider-observed balances or market information must not masquerade as owned/reconciled holdings.

Treasury represents liquidity organization, availability, reservation, restriction, and reserve structure. It consumes canonical or appropriately reconciled state; it is not another provider-balance page.

## 9. Allocation

Allocation separates observed evidence, modeling, policy, plan authorization, and execution. Current application actions create/update/authorize policy, model capital, create review plans, authorize plans, and record decisions through the API layer.

Plan authorization does not reserve capital, call a provider, move assets, post a ledger entry, or prove settlement. Execution remains unavailable unless a separately verified operational capability is intentionally opened.

## 10. Authorization and ownership

Every consequential financial request must be authenticated and server-authorized. The server establishes the acting principal and enforces ownership, role, and policy from authoritative state; client-supplied ownership claims are never trusted by themselves.

Missing capability, configuration, eligibility, durable storage, verification, or policy fails closed.

## 11. Product-state contract

Loading, confirmed zero, unavailable, error, pending, restricted, reserved, provider-observed, canonical, and reconciled states are distinct. Components must not collapse them for visual convenience.

A visible control without a functioning and authorized backend remains financially inert. The UI may explain unavailable capability and the evidence required to proceed, but it must not imply that an unavailable backend is live.

## 12. Design alignment

The application is operational, precise, quiet, governed, and composed. Typography, spacing, alignment, and explicit state hierarchy establish structure before borders or containers. Avoid card-heavy dashboards, exchange-like interfaces, repeated unavailable values, decorative financial animation, and motion that implies execution before canonical confirmation.

Mobile is a first-class operating environment. Accessibility, keyboard operation, visible focus, safe-area handling, reduced-motion support, and truthful loading/error states are mandatory.

## 13. CURRENT / TRANSITION / TARGET

**CURRENT:** Supabase-backed identity/session infrastructure where implemented; governed financial reads and mutations routed through the Neptlium API/domain layer where current source establishes that boundary; canonical financial authority remains server-owned; provider execution remains capability-gated and closed where not proven.

**TRANSITION:** Remaining legacy or non-canonical application data paths may be classified and narrowed as API-backed equivalents become authoritative. Working architecture must not be removed before its replacement is proven.

**TARGET:** Provider-independent identity/domain evolution and further API convergence may proceed under their respective authority documents. Target architecture is not current implementation until source, migrations, tests, and runtime evidence establish it.

## 14. Governing rule

`apps/app` is an interaction surface, not a ledger and not a provider authority. It may request governed operations and render their authoritative state; it cannot manufacture canonical financial truth.
