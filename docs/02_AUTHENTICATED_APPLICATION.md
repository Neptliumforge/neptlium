# Neptlium Authenticated Application

**Status:** Authoritative  
**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## 1. Purpose

The authenticated application is Neptlium's customer interaction surface for Overview, Portfolio, Capital Account, Treasury, and Allocation. It presents verified state and requests governed operations; it is not an independent source of financial truth.

## 2. Architecture-state convention

- **CURRENT SOURCE** — verified repository implementation.
- **CURRENT PRODUCTION** — separately verified runtime/schema state.
- **TRANSITION** — architecture being migrated or consolidated.
- **TARGET** — approved destination architecture that is not yet production-certified.

Source presence does not prove deployment, provider eligibility, live capability, migration application, or financial execution.

## 3. CURRENT SOURCE identity and API boundary

`apps/app` source uses Clerk for browser authentication and sessions. `ClerkProvider` owns the root auth context, `/auth/sign-in` and `/auth/sign-up` use Clerk components, Clerk middleware protects `/dashboard` and `/onboarding`, and the first authenticated entry calls the Neptlium API identity bootstrap before onboarding or dashboard routing.

The application has a server-only Neptlium API client that obtains the Clerk session token and calls `apps/api`. Current governed customer reads and mutations cross that API boundary rather than directly manufacturing canonical financial state in the browser.

`apps/api` owns privileged financial authority: server-side authentication and authorization, identity resolution, ownership enforcement, idempotency, provider isolation, canonical ledger operations, policy enforcement, audit, and reconciliation.

Browser checks, route guards, hidden controls, and authenticated UI state are defense-in-depth only. They do not authorize a financial mutation.

## 4. CURRENT PRODUCTION identity boundary

Production remains in a mixed identity state until separately verified runtime and schema changes complete the cutover.

The production data platform still contains Supabase Auth history and direct ownership coupling that must be preserved while provider-independent identity storage is introduced. `apps/api` defaults to Supabase-compatible authentication until a compatible schema and runtime mode are intentionally coordinated.

`DUAL` or `CLERK` API auth must not be enabled before the provider-independent principal and provider-subject mappings exist and have been verified. A Clerk login UI by itself is not proof that production financial ownership has migrated.

Existing profile UUIDs remain canonical Neptlium principal identifiers through the transition. Authentication-provider subjects must map to those principals; they must not replace them or rewrite financial history.

## 5. Supabase boundary

`apps/app` source does not use Supabase as its browser-session implementation or as a direct product-data authority.

Supabase remains the production persistence platform behind `apps/api` and may retain legacy authentication records during transition. `apps/app` must not query or mutate privileged financial/product tables directly, use Supabase Storage directly for customer documents, or receive the Supabase service-role key or provider credentials.

## 6. Canonical financial truth

- Provider observations are evidence, not canonical state.
- Canonical balances derive from governed ledger state.
- Unknown is not zero.
- Pending is not settled.
- Authorization is not provider submission or execution.
- Provider confirmation is not ledger posting or reconciliation.
- A database status mutation is not proof that money moved.

If required evidence is unavailable, render an explicit unavailable, unknown, pending, or error state rather than a fabricated value.

## 7. Navigation

Canonical desktop primary navigation remains:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

Canonical persistent mobile navigation remains Home, Portfolio, Capital, and Allocation, with Treasury reachable contextually.

Capital Account currently retains the legacy internal route `/dashboard/wallet`; Allocation currently uses `/dashboard/allocations`. Route cleanup is separate product work and must preserve working flows.

## 8. Capital Account

Capital Account is the governed funding and movement surface. Current source routes canonical balance, capability, funding, transfer, and alias reads through the API layer. Funding intent creation is a governed API mutation with idempotency; deposit instructions are returned only through the implemented capability path.

The application must not invent an address, rail, balance, provider capability, transaction, or settlement state. Transfer/withdrawal experiences must fail closed when durable authorization, reservation, provider capability, or reconciliation requirements are unavailable.

## 9. Portfolio and Treasury

Portfolio represents canonical holdings/composition only where sufficient canonical and valuation evidence exists. Provider-observed balances or market information must not masquerade as owned/reconciled holdings.

Treasury represents liquidity organization, availability, reservation, restriction, and reserve structure. It consumes canonical or appropriately reconciled state; it is not another provider-balance page.

## 10. Allocation

Allocation separates observed evidence, modeling, policy, plan authorization, and execution. Current application actions create/update/authorize policy, model capital, create review plans, authorize plans, and record decisions through the API layer.

Plan authorization does not reserve capital, call a provider, move assets, post a ledger entry, or prove settlement. Execution remains unavailable unless a separately verified operational capability is intentionally opened.

## 11. Authorization and ownership

Every consequential financial request must be authenticated and server-authorized. The server establishes the acting Neptlium principal and enforces ownership, role, and policy from authoritative state; client-supplied ownership claims are never trusted by themselves.

Clerk authenticates the session. It does not become the canonical financial owner, role database, compliance system, or ledger authority.

Missing identity mapping, capability, configuration, eligibility, durable storage, verification, or policy fails closed.

## 12. Product-state contract

Loading, confirmed zero, unavailable, error, pending, restricted, reserved, provider-observed, canonical, and reconciled states are distinct. Components must not collapse them for visual convenience.

A visible control without a functioning and authorized backend remains financially inert. The UI may explain unavailable capability and the evidence required to proceed, but it must not imply that an unavailable backend is live.

## 13. Design alignment

The application is operational, precise, quiet, governed, and composed. Typography, spacing, alignment, and explicit state hierarchy establish structure before borders or containers. Avoid card-heavy dashboards, exchange-like interfaces, repeated unavailable values, decorative financial animation, and motion that implies execution before canonical confirmation.

Mobile is a first-class operating environment. Accessibility, keyboard operation, visible focus, safe-area handling, reduced-motion support, and truthful loading/error states are mandatory.

## 14. CURRENT / TRANSITION / TARGET

**CURRENT SOURCE:** Clerk-backed application sessions; governed customer reads and mutations routed through the Neptlium API; canonical financial authority remains server-owned.

**CURRENT PRODUCTION:** Mixed identity state until provider-independent identity migrations and coordinated App/Admin/API runtime configuration are verified. Production database history and existing ownership remain materially coupled to the legacy Supabase Auth era.

**TRANSITION:** Preserve every current principal UUID and financial/audit relationship while backfilling provider-subject mappings, linking Clerk subjects, re-parenting reviewed ownership foreign keys without UUID changes, and moving API auth mode only when schema/runtime compatibility is proven.

**TARGET:** Clerk is the browser authentication/session/MFA authority; Supabase remains the data platform; stable Neptlium principals remain the canonical ownership and audit identity; `apps/api` resolves provider sessions to those principals before authorization.

## 15. Governing rule

`apps/app` is an interaction surface, not a ledger and not a provider authority. It may request governed operations and render their authoritative state; it cannot manufacture canonical financial truth.
