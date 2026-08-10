# Neptlium Product Constitution

**Status:** Authoritative  
**Scope:** Product identity, boundaries, principles, and long-term platform direction

## 1. Product

Neptlium is a capital operating platform.

It exists to make capital understandable, governable, fundable, transferable, allocatable, and operationally controlled through one coherent system.

Neptlium is not defined by a single asset class, provider, blockchain, authentication vendor, or execution venue.

The platform architecture must remain capable of evolving without requiring its core financial model to be rebuilt around a provider.

## 2. Product principle

> Complex capital, rendered with absolute clarity.

Neptlium should reduce fragmentation between capital position, funding, custody/provider observations, treasury state, allocation policy, transfers, execution, reconciliation, and operational control.

The product must distinguish what is known from what is merely observed, proposed, pending, or unavailable.

## 3. Capital universe

Neptlium may support multiple capital classes as infrastructure and verified provider capability mature.

### Digital assets

Current and planned architecture may include:

- USDC
- BTC
- ETH

Asset, network, custody, execution, deposit, and withdrawal availability must be represented from actual implementation and provider capability.

### Fiat

Target funding architecture may include:

- USD
- EUR
- GBP
- additional currencies only where provider, jurisdiction, product, and operational support are verified

Stripe is the intended primary architecture for supported fiat funding and Stripe Onramp capabilities where available and approved.

### Equities

Equities are part of the future Neptlium capital universe.

No brokerage, stock-trading, custody, execution, or specific equity-provider capability may be represented as implemented until the integration and applicable provider/legal capability have been verified.

## 4. Canonical product surfaces

Neptlium is separated into four application boundaries:

- `apps/web` → `neptlium.com`
- `apps/app` → `app.neptlium.com`
- `apps/admin` → `admin.neptlium.com`
- `apps/api` → `api.neptlium.com`

### Web

Public product, company, educational, and marketing experience.

### App

Authenticated customer capital operating environment.

Canonical primary desktop navigation:

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

### Admin

Internal operational and control environment.

Admin interfaces must not manufacture financial truth merely by changing application status.

### API

Privileged backend and provider-orchestration boundary.

Sensitive financial operations must converge toward controlled server-side execution rather than browser authority.

## 5. Capital Account

Capital Account is the primary funding and capital-movement surface.

Target product structure:

- Overview
- Deposit
- Withdraw
- Transfer
- Activity

Funding, provider observations, transfers, and execution must ultimately reconcile with canonical financial state before being represented as settled truth.

## 6. Treasury

Treasury represents operational liquidity and capital readiness.

Target concepts include:

- Available
- Reserved
- Committed
- Pending
- Restricted
- Reserve requirement
- Reserve coverage
- Liquidity state

Treasury is not the transfer engine and is not a provider-balance screen.

It consumes reconciled financial state.

## 7. Allocation

Allocation is the governed intelligence and capital-organization layer.

It may observe capital, model policy, calculate drift, generate scenarios, produce proposals, support approvals, reserve capital, and coordinate authorized execution.

Modeling does not move capital.

AI must never silently control customer capital.

Target classifications include:

- Reserve
- Core
- Growth
- Opportunity
- Restricted

Target lifecycle:

Observed
→ Modeled
→ Proposed
→ Under Review
→ Approved
→ Reserved
→ Submitted
→ Settling
→ Settled

Additional terminal or interruption states may include:

- Rejected
- Cancelled
- Expired
- Failed
- Partially Settled
- Reversed

## 8. Transfers

Neptlium may support governed internal and provider-backed transfers.

Target alias-transfer direction:

alias
→ verified recipient resolution
→ asset/network validation
→ available-capital validation
→ transfer intent
→ authorization
→ reservation
→ ledger movement or reviewed provider execution
→ reconciliation
→ activity history

An alias is a resolution mechanism, not proof of ownership or authorization.

## 9. Financial truth

Neptlium must never fabricate:

- balances
- holdings
- returns
- transactions
- customers
- execution
- settlement
- reconciliation
- provider capability
- custody
- regulatory status

The platform must distinguish at minimum:

- canonical
- provider-observed
- unreconciled
- pending
- reserved
- restricted
- unavailable

Provider observations are evidence.

They are not automatically canonical Neptlium ledger truth.

## 10. Ledger principles

The financial architecture must preserve:

- append-only financial history
- precise asset amounts
- idempotency
- durable business references
- authorization
- reservations and holds
- auditable state transitions
- reversals or compensating entries instead of destructive financial-history edits
- provider evidence separated from canonical financial truth
- reconciliation

Double-entry accounting principles should govern canonical financial movements where applicable.

## 11. Identity

Neptlium financial ownership must converge on a stable, provider-independent internal principal.

Authentication providers establish identity and sessions.

They must not permanently define the financial domain model.

Current implementation may still depend on Supabase Auth.

The target identity architecture uses Clerk for authentication/session/MFA while preserving a Neptlium-owned principal between external identity and financial ownership.

Supabase remains a data platform.

Current and target state must always be documented separately until migration is complete.

## 12. Provider principle

Providers are infrastructure dependencies, not Neptlium's domain authority.

Examples may include:

- Stripe
- Circle
- Supabase
- Alchemy
- future reviewed brokerage or market providers

Provider APIs may supply observations, payment rails, wallet infrastructure, execution capability, chain data, or other services.

Neptlium remains responsible for its own authorization, policy, financial state, reconciliation, auditability, and product truth.

## 13. Security principle

Financial convenience must never override financial correctness.

Neptlium must fail closed where authority, ownership, provider state, reconciliation, or execution state cannot be established safely.

Never expose privileged provider credentials to clients.

Never weaken authorization or RLS merely to make functionality work.

Never treat a database status change as evidence that an external financial operation occurred.

## 14. Design doctrine

Neptlium uses the **Capital Precision** design doctrine.

The experience is governed by:

**Precision · Restraint · Depth · Certainty**

The product should be:

- premium
- composed
- information-first
- mobile-excellent
- operationally clear
- non-retail
- non-exchange-like

Visual sophistication must improve comprehension rather than decorate financial complexity.

## 15. Product evolution

Neptlium should evolve by extending stable financial primitives rather than repeatedly rebuilding the platform around new providers or features.

Current implementation and target architecture must remain explicitly distinguishable.

No roadmap item becomes a production capability merely because it appears in documentation.

## 16. Governing rule

Every Neptlium product decision should improve at least one of:

- understanding
- control
- financial correctness
- operational capability
- security
- auditability

without silently weakening another.

Neptlium should make complex capital feel ordered, legible, and controlled.
