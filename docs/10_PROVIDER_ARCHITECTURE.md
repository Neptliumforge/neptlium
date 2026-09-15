# Provider Architecture

Providers are replaceable infrastructure/capability adapters. Neptlium owns stable principal identity, authorization, ownership, policy, transaction intents, canonical ledger, reservations, lifecycle, audit, reconciliation, and the final interpretation of financial state.

The current strategic provider set is **Circle + Alchemy + Stripe**. This is a division of responsibility, not a transfer of Neptlium domain authority:

- **Circle = stablecoin, digital-money, wallet and settlement infrastructure.**
- **Alchemy = multi-chain blockchain connectivity, observation and intelligence infrastructure.**
- **Stripe = fiat, card, bank-payment and billing infrastructure.**
- **Neptlium Platform Core = authorization, policy, intents, canonical ledger, reconciliation and financial truth.**

No product surface may treat a provider response, provider balance, blockchain observation, payment status, or configured credential as canonical financial truth by itself.

## Supabase Auth — identity provider

Supabase Auth is the sole active runtime authentication and browser-session provider for customer and operator surfaces.

`apps/app`, `apps/admin`, and authenticated Neptlium Treasury surfaces use shared Supabase browser/server/session primitives. `apps/api` verifies Supabase bearer tokens and resolves the verified `SUPABASE_AUTH` subject to a stable Neptlium principal before authorization.

Historical identity-provider mappings may remain as migration/audit evidence, but they are not active runtime authentication paths.

## Supabase — persistence provider

Supabase is server-side data infrastructure where configured: PostgreSQL persistence, migrations, repositories, constraints/RLS, rate limiting, provider inboxes, audit, identity mapping storage, financial state, and reconciliation.

Supabase service-role access is infrastructure authority only. It is never a customer/operator browser credential or financial authorization mechanism.

## Circle — stablecoin and digital-money infrastructure

Circle is Neptlium's strategic adapter for reviewed Circle-supported stablecoin, wallet and settlement capabilities.

Its permitted responsibilities may include, when separately configured and certified:

- developer-controlled wallet/account infrastructure;
- wallet and deposit-address provisioning;
- supported USDC/EURC and other reviewed Circle capabilities;
- supported stablecoin transfer and settlement submission;
- supported cross-chain stablecoin movement;
- provider transaction/status observations;
- signed provider webhook/event evidence.

Circle does **not** own Neptlium balances, authorization, withdrawal eligibility, policy, accounting, reconciliation, or the canonical ledger. Circle observations and transaction states remain provider evidence until Neptlium validates ownership and policy, posts governed ledger effects where applicable, and reconciles the lifecycle.

Circle credentials, entity secrets and signing authority are server-only. Configuration never implies execution authority. Wallet provisioning, transfers, mainnet and each asset/network operation require independent capability gates.

## Alchemy — multi-chain blockchain intelligence infrastructure

Alchemy is Neptlium's strategic blockchain connectivity, observation and intelligence adapter. It must be engineered as a **multi-chain capability layer**, not as a Base-only product assumption.

Its permitted responsibilities may include, for individually certified networks:

- RPC connectivity and chain reads;
- transaction, receipt and confirmation observation;
- address balance/activity observations;
- webhook/event infrastructure;
- transaction simulation where supported;
- gas/network intelligence;
- smart-account infrastructure where separately reviewed and adopted;
- normalized chain evidence for settlement and reconciliation.

A network being available through Alchemy does not make that network financially enabled in Neptlium. Chain observation, deposits, withdrawals, contract execution, signing, supported assets and mainnet execution are separate capabilities.

Alchemy cannot authorize capital movement, create canonical availability, determine customer ownership, or replace Neptlium's ledger and reconciliation authority. An Alchemy-reported balance is an observation. A confirmed transaction is settlement evidence. Neither becomes canonical financial truth without the Neptlium control plane.

### Multi-chain configuration doctrine

Production architecture must converge on a canonical chain registry plus per-network capability/configuration rather than a single hard-coded production RPC. The registry owns Neptlium network identity and policy; Alchemy supplies infrastructure for networks it supports.

The transition from the current Base-specific runtime validation must be implemented through reviewed code and tests before additional production RPC variables are treated as active. Do not bypass current fail-closed validation by adding unused environment variables.

## Stripe — fiat and payment infrastructure

Stripe is Neptlium's strategic adapter for reviewed fiat payment and billing capabilities.

Its permitted responsibilities may include, when separately implemented and certified:

- card payment processing;
- Checkout/payment collection;
- supported bank-payment methods;
- subscriptions and billing;
- refunds and disputes;
- payment lifecycle/status events;
- signed Stripe webhook evidence;
- other explicitly reviewed Stripe capabilities.

Current Stripe source supports governed subscription-billing webhook ingress. It does **not** establish live customer capital funding merely because Stripe credentials exist.

Target fiat funding requires a separately reviewed funding/payment contract including principal eligibility, intent creation, idempotency, provider submission, signed webhook ingestion, failure/refund/dispute handling, ledger posting and reconciliation.

Stripe does not own Neptlium's business-account model, available balance, withdrawal authorization, canonical ledger or reconciliation state.

## Provider orchestration boundary

All financial provider access flows through server-side Neptlium boundaries. Product applications express Neptlium domain intents; they do not call financial providers as domain authority.

Canonical flow:

```text
Customer / Business / Operator
            |
            v
       Neptlium Product
            |
            v
        Neptlium API
            |
            v
 Identity + Ownership + Authorization
            |
            v
   Policy + Risk + Approval
            |
            v
      Transaction Intent
            |
            v
    Provider Orchestrator
       /       |       \
   Circle   Alchemy   Stripe
       \       |       /
            v
       Provider Evidence
            |
            v
       Reconciliation
            |
            v
      Canonical Ledger
            |
            v
        Audit + Events
```

Provider selection is based on capability, policy, environment, network/rail, asset/currency, jurisdiction, principal eligibility, operation and health. It must never be hard-coded in customer UI as financial truth.

## Capability model

Every provider capability is independently classified across at least:

- provider;
- environment;
- operation;
- asset/currency;
- network/rail;
- principal/customer eligibility;
- jurisdiction where relevant;
- configuration state;
- operational health;
- execution authorization.

The platform must preserve these distinctions:

- CONFIGURED != CERTIFIED
- CERTIFIED != CUSTOMER ELIGIBLE
- CUSTOMER ELIGIBLE != AUTHORIZED
- AUTHORIZED != SUBMITTED
- SUBMITTED != SETTLED
- SETTLED != RECONCILED
- PROVIDER OBSERVATION != CANONICAL LEDGER
- CHAIN SUPPORTED BY ALCHEMY != FINANCIAL RAIL ENABLED BY NEPTLIUM

## Crypto deposit providers and networks

A target deposit catalog may include multiple reviewed asset/network pairs. A catalog is not itself a provider-capability claim.

Each pair requires a reviewed address provider, chain observer, webhook/polling strategy, confirmation policy, compliance handling and reconciliation adapter. The API capability registry decides what is exposed to each principal.

Circle may supply wallet/stablecoin infrastructure while Alchemy supplies chain observation for the same lifecycle. Their evidence must be correlated through Neptlium-owned identifiers and reconciliation rather than allowing either provider to become the source of financial truth.

## Adapter rules

Every provider adapter must:

- expose Neptlium domain types rather than leak SDK responses into product pages;
- advertise capability by asset/currency, network/rail, environment and operation;
- validate configuration and fail closed;
- keep secrets, signing material and privileged SDKs server-side;
- preserve Neptlium idempotency and provider idempotency where available;
- verify official webhook/signature contracts before accepting evidence;
- persist provider event ingress durably before consequential processing where applicable;
- preserve safe provider references and timestamps;
- distinguish submission, observation, confirmation, settlement and canonical reconciliation;
- normalize errors without leaking secrets;
- support controlled lookup/recovery after ambiguous timeouts;
- expose health/degradation independently from financial truth;
- never silently enable mainnet, execution, signing, withdrawals, deposits or unsupported assets;
- never create a shadow ledger from provider balances;
- remain replaceable without forcing product surfaces to adopt provider-specific domain models.

## Execution safety doctrine

There is no global `providers enabled` state that implicitly authorizes money movement.

Read/observation capability should be certifiable independently from write/execution capability. Execution requires explicit Neptlium authorization, policy/risk satisfaction, applicable approvals, provider capability, idempotency, auditable intent state and a reconciliation path.

Production credentials are necessary infrastructure, not permission to execute transactions. Mainnet configuration is necessary infrastructure, not permission to move capital.

## Selection rule

Provider selection is capability- and policy-driven, never hard-coded as financial truth in the UI. A configured provider can still be unavailable, degraded, restricted or ineligible for a specific principal, jurisdiction, asset, amount, network/rail or operation.

This doctrine applies across Capital, Treasury, Pay, Admin, API, Forge and future Neptlium surfaces. Specialized applications may present different workflows, but all inherit the same provider boundaries and canonical financial authority model.
