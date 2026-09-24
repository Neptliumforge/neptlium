# Neptlium Product Constitution

**Status:** Authoritative
**Scope:** Product identity, boundaries, principles, and long-term platform direction

## Product

Neptlium is a capital operating platform for individuals and institutions. It makes capital understandable, governable, fundable, transferable, allocatable, and operationally controlled through one coherent system.

> Every movement has authority. Every position has evidence.

The universal public proposition is **Capital, intelligently managed.** Audience language then becomes more specific: personal and action-oriented for individuals; operational and authoritative for institutions; technical only inside engineering and internal control boundaries.

Neptlium is not defined by a single asset class, blockchain, authentication vendor, database, custody provider, payment rail, or execution venue. Provider systems extend Neptlium capabilities; they do not become Neptlium's domain authority.

## Application boundaries

- `apps/web` → `neptlium.com` — public institutional marketing and information.
- `apps/app` → `app.neptlium.com` — authenticated customer capital operating environment.
- `apps/admin` → `admin.neptlium.com` — role-gated operations and control environment.
- `apps/api` → `api.neptlium.com` — authentication verification, authorization, product state, provider, ledger, webhook, audit, and reconciliation boundary.

The browser is an interaction surface, not the privileged financial control plane.

## Identity

Supabase Auth is the sole active authentication, browser-session, recovery, and account identity provider for customer and operator surfaces.

Neptlium financial ownership is attached to a stable internal principal:

Supabase Auth identity → Neptlium principal → authorization and financial ownership.

Changing or evolving authentication infrastructure must never rewrite canonical financial history, balances, ownership UUIDs, audit attribution, provider evidence, or ledger records.

Supabase service-role access remains server-side infrastructure authority and is never browser authentication or customer financial authority.

## Capital universe

Neptlium may support multiple capital classes as infrastructure and verified provider capability mature. Product architecture may include digital assets, fiat, private-company interests, public-market positions, and other capital classes.

No operational or public surface may claim a specific asset, network, custody rail, execution rail, deposit method, withdrawal method, or jurisdictional capability merely because it appears in target architecture.

## Capital Account

Capital Account is the primary funding and capital-movement workspace.

Target structure:

- Overview
- Deposit
- Withdraw
- Transfer
- Activity

Funding and movement become canonical only after server authorization, provider evidence where applicable, ledger posting, and reconciliation.

## Treasury

Treasury represents operational liquidity and capital readiness. It distinguishes available, reserved, committed, pending, restricted, and required capital. It consumes governed/reconciled state rather than simply mirroring provider balances.

## Portfolio and Intelligence

Portfolio and company intelligence organize ownership, exposure, concentration, operating context, and relationships. They should preserve the distinction between observed facts, modeled interpretation, and financial consequence.

## Allocation

Allocation is the governed capital-intelligence and decision layer. Modeling, proposal, review, approval, reservation, submission, settlement, and reconciliation remain distinct stages.

AI may assist interpretation and modeling. AI must never silently authorize or move customer capital.

## Financial truth

Neptlium must never fabricate factual claims about balances, holdings, returns, transactions, customers, execution, settlement, reconciliation, provider capability, custody, or regulatory status.

Operational state must distinguish at minimum where applicable:

- canonical
- provider-observed
- modeled
- proposed
- pending
- reserved
- restricted
- unavailable
- settled
- reconciled

Unknown is not zero. Pending is not settled. Provider evidence is not automatically canonical Neptlium financial truth.

## Ledger and control principles

Canonical financial operations must preserve:

- append-only financial history;
- precise asset amounts;
- idempotency;
- durable business references;
- authentication and authorization;
- ownership validation;
- reservations and holds where applicable;
- auditable lifecycle transitions;
- reversals or compensating entries instead of destructive financial-history edits;
- provider evidence separated from canonical state;
- reconciliation.

## Provider principle

Examples of infrastructure dependencies may include Supabase, Stripe, Circle, Alchemy, and future reviewed providers. They remain replaceable adapters around stable Neptlium primitives.

Configuration is not capability. Capability is not authorization. Provider success is not settlement. Browser completion is not canonical financial movement.

Providers supply rails. They never become Neptlium's canonical financial truth. Neptlium owns identity, the customer relationship, capital state, ledger consequence, portfolio context, treasury context, authority, activity, records, reconciliation and governance.

## Security principle

Financial convenience must never override financial correctness. Neptlium fails closed when identity, authority, ownership, provider state, policy, reconciliation, or execution evidence cannot be established safely.

Privileged credentials never belong in clients. Administrative status edits must not manufacture financial truth.

## Design doctrine

Neptlium uses the **Capital Precision** design doctrine:

**Precision · Restraint · Depth · Certainty**

Marketing can be cinematic and category-defining. The authenticated product should be calm, information-first, mobile-excellent, and operationally clear. Visual sophistication exists to improve comprehension rather than decorate financial complexity.

## Evolution rule

New assets, providers, funding rails, identity capabilities, and execution systems should extend stable Neptlium primitives rather than redefine them.

Every product decision should improve understanding, control, financial correctness, operational capability, security, or auditability without silently weakening another.
