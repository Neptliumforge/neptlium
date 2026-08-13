# Neptlium — Capital Operating Platform Design Doctrine

**Status:** Authoritative
**Scope:** `neptlium.com`, `app.neptlium.com`, `admin.neptlium.com`, and shared product expression
**Category:** Capital Operating Platform
**Primary expression:** Capital, organized around you.

This document is the single design authority for Neptlium. It replaces the previous design doctrine rather than adding another visual or product layer. Historical design documents may explain implementation lineage, but they do not override this doctrine.

## 1. Identity and position

Neptlium is a **governance-first digital capital operating platform**: institutional, controlled, and policy-driven. Its category is **Capital Operating Platform**.

The platform organizes capital around the operator without presenting itself as a retail exchange, speculative trading venue, or generic software dashboard. Marketing establishes the institution and its operating thesis. The authenticated product turns that thesis into a precise operating environment.

## 2. Marketing experience

The homepage uses exactly six major compositions:

1. **Hero — Capital, organized around you.** The category statement is **Digital Capital Operating Infrastructure**.
2. **Capital Operating Thesis**
3. **Product Operating System**
4. **Treasury · Allocation · Connectivity**
5. **Governance + Technical Foundation**
6. **Conversion**

The hero carries the canonical expression **“Capital, organized around you.”** The page explains a controlled operating system for capital; it must not imitate an authenticated dashboard or manufacture product, customer, provider, or financial evidence.

## 3. Visual system

Neptlium uses a calm institutional design defined by precision and restraint. The quality bar is the clarity, hierarchy, and finish associated with leading platform companies such as Apple, Stripe, and NVIDIA—not imitation of their components or brand assets.

- Use a white-first, light architectural foundation with controlled dark sections for authority, contrast, and technical depth.
- Establish hierarchy primarily through typography, scale, rhythm, alignment, and negative space.
- Keep compositions information-rich but visually minimal.
- Prefer sections, structured rows, system diagrams, hairline separators, and compositional planes over collections of cards.
- Use color as a controlled signal for action, focus, selection, and meaningful system paths rather than decoration.
- Avoid crypto-exchange aesthetics: no candlesticks, token-logo walls, neon, speculative tickers, glowing geometry, or fabricated live-market cues.
- Avoid generic SaaS card-heavy layouts, excessive rounded containers, ornamental gradients, glass tiles, and repeated feature grids.
- Motion must explain hierarchy or system relationships. Scrolling remains native, reduced-motion preferences are respected, and financial values never animate in a way that implies progress or execution.

Marketing may use broader grids, larger typography, greater negative space, restrained editorial motion, and deliberately placed dark sections. Authenticated surfaces are quieter, denser, faster, and more operational. Both remain one institutional identity.

## 4. Authenticated product alignment

Canonical primary navigation is:

1. **Overview**
2. **Portfolio**
3. **Capital Account**
4. **Treasury**
5. **Allocation**

Each area has a distinct operating responsibility:

- **Overview** — verified capital state, truthful activity visibility, and current operational context.
- **Portfolio** — holdings structure, exposure, concentration, and classification, shown only where canonical data and required valuation evidence exist.
- **Capital Account** — canonical balances, verified funding capability, deposits, withdrawals, and activity history.
- **Treasury** — liquidity organization, operating capacity, and reserve structure.
- **Allocation** — observed state, modeled policy, and authorized decisions. Execution remains explicitly closed.

Product UI must be information-first, mobile-excellent, and operationally quiet. Use strong numeric alignment, explicit state hierarchy, concise copy, restrained surfaces, and clear action placement. Unknown values remain unknown; a confirmed zero may render as zero, but absence of evidence must never be rendered as `$0.00`.

## 5. Core product principles

- **No fabricated balances.** Canonical balances derive from governed ledger state, not placeholder values or provider observations.
- **No fake provider capability.** Show a rail, action, or provider-backed function only when its capability is verified and available for the relevant user and environment.
- **No fake activity.** Empty, loading, unavailable, and error states remain truthful; they never invent transactions, holdings, events, or operational history.
- **No fake execution state.** Modeling, authorization, submission, provider confirmation, settlement, and reconciliation are distinct and must never be collapsed into a successful outcome.
- **Capability shown only when verified.** Missing configuration, eligibility, durable storage, verification, or policy fails closed.

A visible control without a functioning, authorized backend must remain financially inert. Consequential forms preserve the sequence **input → review → authorization → outcome**; a click or status mutation does not prove execution.

## 6. Capital operating model

The product explains how capital is organized across its operating surfaces:

```text
Source
  ↓
Connectivity
  ↓
Portfolio
  ↓
Treasury
  ↓
Policy
  ↓
Allocation
  ↓
Authorization
  ↓
Operational Record
```

Each stage must preserve provenance and state boundaries. Connectivity and provider observation supply evidence. They do not replace authorization, canonical posting, or reconciliation.

## 7. Capital lifecycle governance

Financial state advances through an evidence-bearing governance sequence:

```text
Provider Evidence
→ Validation
→ Canonical Ledger
→ Reconciliation
→ Available Capital
→ Governed Operations
```

- **Provider Evidence** is an external observation or execution artifact, never canonical financial truth by itself.
- **Validation** verifies authenticity, integrity, ownership, asset, network, environment, amount, destination, and replay/idempotency conditions as applicable.
- **Canonical Ledger** records the balanced, append-only financial effect only after the required authority and evidence gates are satisfied.
- **Reconciliation** compares expected state, provider evidence, settlement evidence, and ledger effect; disagreement remains an explicit discrepancy.
- **Available Capital** exists only after the lifecycle's posting and reconciliation requirements have been satisfied.
- **Governed Operations** consume canonical available capital through authorization, policy, reservation, audit, execution, and reconciliation controls as applicable.

No stage may be inferred from the existence of a previous stage. Provider observation is not validation, validation is not posting, posting is not reconciliation, and availability is not execution authority.

## 8. Governance architecture

Governance is part of the operating architecture, not a decorative badge or marketing claim:

1. **Identity** — establish the authenticated actor.
2. **Authorization** — enforce ownership, role, policy, and action authority server-side.
3. **Canonical Ledger** — record balanced, append-only financial truth.
4. **Provider Evidence** — retain external observations and execution evidence without promoting them to ledger truth.
5. **Reconciliation** — compare expected state, provider evidence, settlement, and ledger effect; preserve discrepancies for review.

Corrections use reversals or compensating entries. Neither database status changes nor provider responses alone prove financial execution.

## 9. Allocation doctrine

The locked allocation model exposed by the product is:

```text
Observed
   ↓
Modeled
   ↓
Authorized
   ↓
Execution CLOSED
```

Authorization approves a governed plan; it does not reserve capital, call a provider, move assets, post a ledger entry, or prove settlement. Allocation execution remains unavailable until the full governed domain, verified provider eligibility, durable reservation, explicit execution enablement, ledger effects, and reconciliation controls are intentionally opened and proven.

There is no implied execution step after authorization. Plans must remain visibly authorized—not pending, executing, executed, or completed—until a future verified operational capability is intentionally designed, implemented, authorized, and proven.

## 10. Financial safety

### Funding

```text
CREATED
→ AUTHORIZED
→ PROVIDER_SUBMITTED
→ PENDING
→ PROVIDER_CONFIRMED
→ LEDGER_POSTED
→ RECONCILED
→ AVAILABLE
```

Provider confirmation cannot credit available capital. Availability requires canonical ledger posting followed by matched reconciliation.

### Withdrawal

```text
REQUESTED
→ AUTHORIZED
→ RESERVED
→ SUBMITTED
→ SETTLED
→ RECONCILED
```

Authorization does not prove submission, submission does not prove settlement, and settlement does not prove reconciliation. Durable reservation must precede provider submission. Terminal failure, cancellation, return, reversal, and discrepancy paths must preserve their evidence and history.

## 11. Administrative authority boundary

`apps/admin` is an identity and session interface only. It may authenticate the operator and call authenticated administrative endpoints, but it must not hold canonical financial authority, access governed tables directly, or contain a Supabase service-role credential.

`apps/api` is the privileged authority boundary for server authentication, authorization, ownership, idempotency, policy enforcement, provider isolation, audit, ledger operations, and reconciliation. Supabase service-role authority belongs only behind this controlled server boundary and is never exposed to `apps/admin` or the browser.

An administrative approval or database status mutation does not prove provider execution, settlement, ledger posting, or reconciliation.

## 12. Truthful states and interaction

- Unknown is not zero; unavailable is not empty; pending is not settled.
- Unavailable balances must never appear available, unsupported providers must never appear enabled, simulated activity must never appear real, authorization must never appear as execution, and a plan must never appear as a completed operation.
- Loading states reserve space without inventing values.
- Empty states communicate what is verified and what the user can safely do next.
- Errors are concise and actionable in customer interfaces; sensitive provider and reconciliation details remain in controlled diagnostics.
- Status, capability, and action labels must reflect the actual server-authoritative state.
- Accessibility, visible focus, semantic structure, sufficient contrast, keyboard operation, and mobile touch targets are mandatory.

## 13. Governing expression

> White establishes clarity.
> Controlled dark sections establish authority.
> Typography establishes hierarchy.
> Verified state establishes trust.

> Marketing explains the capital operating institution.
> The authenticated product operates it.
> The API preserves its authority.
