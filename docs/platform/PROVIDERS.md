# Provider Architecture

Providers are replaceable infrastructure/capability adapters. Neptlium owns stable principal identity, authorization, policy, intents, canonical ledger, reservations, lifecycle, audit, and reconciliation.

## Supabase Auth — identity provider

Supabase Auth is the sole active runtime authentication and browser-session provider for customer and operator surfaces.

`apps/app`, `apps/admin`, and authenticated Neptlium Treasury surfaces use shared Supabase browser/server/session primitives. `apps/api` verifies Supabase bearer tokens and resolves the verified `SUPABASE_AUTH` subject to a stable Neptlium principal before authorization.

Historical identity-provider mappings may remain as migration/audit evidence, but they are not active runtime authentication paths.

## Supabase — persistence provider

Supabase is server-side data infrastructure where configured: PostgreSQL persistence, migrations, repositories, constraints/RLS, rate limiting, provider inboxes, audit, identity mapping storage, financial state, and reconciliation.

Supabase service-role access is infrastructure authority only. It is never a customer/operator browser credential or financial authorization mechanism.

## Circle

Circle Developer-Controlled Wallets is a capital-provider adapter in the API architecture.

Implemented source may include wallet/address lookup and provider observations. Configuration or source support does not establish customer-facing production eligibility. Provider balance/transaction observations are evidence and remain non-canonical until governed posting/reconciliation.

Circle credentials and entity secrets are server-only.

## Alchemy

Alchemy is observation/RPC infrastructure where configured. It may normalize chain observations into settlement evidence, but it cannot authorize capital movement, create canonical availability, or replace ledger/reconciliation authority.

Production use requires explicit verified capability and secure webhook/observation contracts.

## Stripe

Current Stripe source supports governed subscription-billing webhook ingress. It does **not** establish live customer capital funding.

Target USD deposit funding may use Stripe only after a separately reviewed Payments/funding contract is implemented and certified, including customer eligibility, payment creation, signed webhook ingestion, failure/refund handling, ledger posting and reconciliation.

## Crypto deposit providers and networks

A target deposit catalog may include multiple reviewed asset/network pairs. A catalog is not itself a provider-capability claim.

Each pair requires a reviewed address provider, chain observer, webhook/polling strategy, confirmation policy, compliance handling and reconciliation adapter. The API capability registry decides what is exposed to each customer.

## Adapter rules

Every provider adapter must:

- expose Neptlium domain types rather than leak SDK responses into product pages;
- advertise capability by asset, network/rail, environment and operation;
- validate configuration and fail closed;
- preserve Neptlium idempotency and provider idempotency where available;
- verify official webhook/signature contracts before accepting evidence;
- preserve safe provider references and timestamps;
- distinguish submission, observation, settlement and canonical reconciliation;
- normalize errors without leaking secrets;
- support controlled lookup after ambiguous timeouts;
- never silently enable mainnet, execution or unsupported assets.

## Selection rule

Provider selection is capability- and policy-driven, never hard-coded as financial truth in the UI. A configured provider can still be unavailable, degraded, restricted or ineligible for a specific principal, jurisdiction, asset, amount or operation.


## Execution-provider boundary

Execution venues use a separate API-owned execution domain; they do not implement or extend the custody/funding-oriented `CapitalProvider` contract. Execution provider identity is not capability. Provider orders, fills, positions, collateral, account state, stream events, and submission responses remain provider evidence until the applicable Neptlium authorization, reservation, normalization, reconciliation, and canonical financial workflows establish their effect.

The current execution foundation is domain-only and fail-closed. It contains no provider adapter, network transport, credential, signer, execution router, testnet activation, or production execution capability. See [Execution](../financial/EXECUTION.md).

## Canonical provider doctrine

A provider is infrastructure beneath a Neptlium-owned domain. Provider identity never defines product identity, navigation, account ownership, capability, customer state, or canonical financial truth.

```text
Provider
!= Product
!= Capability
!= Account
!= Financial truth
```

Current and planned provider classification is:

| Provider | Category | Repository state |
| --- | --- | --- |
| Supabase Auth | Identity Infrastructure | Current; sole active runtime authentication/session provider |
| Supabase/PostgreSQL | Persistence Infrastructure | Current |
| Stripe | Payment / Billing Infrastructure | Current subscription-billing webhook ingress; not live Capital funding |
| Circle | Custody / Wallet Infrastructure | Current adapter/source support; capability remains gated |
| Alchemy | Blockchain Observation Infrastructure | Current observation/RPC infrastructure where configured |
| Resend | Communication Infrastructure | Unsupported; no current integration |
| Mercury | Banking Infrastructure | Unsupported; no current integration |
| Hyperliquid | Execution Infrastructure | Planned; no current integration |
| Aster | Execution Infrastructure | Planned; no current integration |
| Vercel | Deployment / Operations Infrastructure | Current deployment infrastructure; not financial authority |

Planned or unsupported providers MUST NOT be documented or presented as integrated solely because they are architectural candidates.

## Domain-specific provider boundaries

Neptlium MUST preserve domain semantics rather than create a universal provider interface.

```text
CapitalProvider
!= ExecutionProvider
!= CommunicationProvider
!= ChainObservationProvider
!= BankingProvider
```

A future provider metadata registry MAY describe provider identity, category, environments, capability declarations, certification, health, disclosure requirements and evidence sources. Such a registry MUST NOT collapse domain-specific contracts or make provider metadata financial authority.

The customer experience follows:

```text
Neptlium UI
    ↓
Neptlium Domain
    ↓
Capability / Router
    ↓
Provider
```

Provider SDKs and provider-native errors MUST NOT become direct customer-component dependencies.

## Capability authority

Every provider-backed capability is fail-closed. The following states are distinct and MUST NOT be inferred from one another:

```text
EXISTS
!= CONFIGURED
!= REACHABLE
!= CAPABLE
!= CERTIFIED
!= ELIGIBLE
!= AUTHORIZED
!= EXECUTED
!= RECONCILED
!= CANONICAL
```

Configuration presence, credentials, provider reachability, a successful observation, or provider-native success never grants financial authority by itself.

## Provider evidence and financial authority

The canonical direction is:

```text
Provider
    ↓
Provider Evidence
    ↓
Normalization
    ↓
Matching / Policy
    ↓
Governed Financial Workflow
    ↓
Reconciliation
    ↓
Canonical Financial Core
    ↓
Customer Projection
```

Common evidence principles MAY include provider, provider category, environment, domain, operation/source, provider reference, Neptlium correlation identity, observed/received timestamps, provider-native state/reason, payload digest/reference, schema version, and explicit non-canonical authority. Domain-specific evidence remains domain-specific; communication delivery evidence, chain observations, funding evidence and execution evidence are not semantically interchangeable.

The following are explicit invariants:

- Stripe state is not Capital truth.
- Circle balance is not a Neptlium Capital balance.
- Alchemy observation is not a ledger posting.
- A future Mercury bank balance is not a Neptlium Treasury ledger.
- Hyperliquid or Aster collateral is not Neptlium Capital.
- Execution-provider positions are not canonical portfolio ownership.
- Execution fills are not ledger settlement.
- `FILLED != RECONCILED`.

Provider evidence can affect canonical financial state only through the applicable governed workflow.

## Provider disclosure

Provider identity is customer-visible only when materially necessary for legal, custody, execution-venue, payment-method, transaction-record, or equivalent disclosure. Required disclosure MUST remain accurate but MUST NOT create provider-branded product architecture.

Authorized Admin/operator experiences MAY expose richer provider diagnostics such as provider, environment, capability, health, provider account/reference, native state/reason, evidence state, correlation IDs and reconciliation state.

Ordinary customer experiences receive normalized Neptlium state. Provider-native state/error flows through domain normalization and an internal Neptlium state/error before customer presentation. The ordinary customer-state vocabulary is `AVAILABLE`, `EMPTY`, `PENDING`, `RESTRICTED`, `UNAVAILABLE`, `FAILED`, plus loading where appropriate.

## Provider-neutral experience invariant

Replacing a provider MUST NOT require a new Neptlium identity, account model, primary navigation, customer financial-state vocabulary, visual system, or financial-truth model.

Provider brand colors and visual grammar MUST NOT become Neptlium application theme semantics. Provider identity may appear in a materially required disclosure or entity context without becoming the surrounding product identity.
