# Provider Architecture

Providers are replaceable infrastructure/capability adapters. Neptlium owns stable principal identity, authorization, policy, intents, canonical ledger, reservations, lifecycle, audit, and reconciliation.

## Canonical provider doctrine

Neptlium currently standardizes its external financial and blockchain provider architecture around three primary adapters:

- **Circle — digital-dollar, stablecoin, wallet and settlement infrastructure.** Circle may provide supported wallet/address infrastructure, USDC/EURC and other explicitly certified stablecoin capabilities, transfer/settlement rails and signed provider events. Circle never decides canonical Neptlium balances, authorization, policy or reconciliation.
- **Alchemy — multi-chain blockchain connectivity, observation and intelligence infrastructure.** Alchemy provides certified-chain RPC, activity/receipt/confirmation observation, webhooks, simulation and related chain capabilities where reviewed. Alchemy observations are evidence; they never authorize movement or become canonical financial state.
- **Stripe — fiat, card, bank-payment and billing infrastructure.** Stripe may provide certified payment collection, Checkout, supported bank/card rails, billing, refunds and signed payment events. Stripe never becomes the Neptlium account model, business transaction model or canonical ledger.

The invariant is:

> Circle moves or settles supported digital money. Alchemy observes and interprets supported blockchains. Stripe handles supported fiat/payment rails. Neptlium authorizes, governs, records and reconciles financial truth.

This doctrine applies across Capital, Treasury, Pay, App, Admin and Forge. Product surfaces must consume Neptlium domain contracts and capabilities, not provider-native authority.

## Financial authority chain

Provider success is not financial truth. The canonical direction is:

`Product surface -> Neptlium API -> identity/ownership -> authorization -> policy/risk/approvals -> transaction intent -> provider orchestration -> provider evidence -> settlement determination -> reconciliation -> canonical ledger/events`

No provider SDK response, webhook, browser state, dashboard status, RPC result or provider balance may bypass this chain.

## Capability registry and selection

Provider availability is capability- and policy-driven. A capability is keyed by provider, environment, operation, asset/currency, network/rail and applicable eligibility constraints. `CONFIGURED != LIVE CAPABILITY`.

Provider selection must never be hard-coded as financial truth in product UI. A configured provider may still be unavailable, degraded, restricted, uncertified or ineligible for a principal, organization, jurisdiction, asset, network, amount or operation.

Mainnet connectivity, observation, deposit acceptance, withdrawal execution, wallet provisioning, fiat funding, conversion and settlement are independent capabilities. Enabling one never silently enables another.

## Supabase Auth — identity provider

Supabase Auth is the sole active runtime authentication and browser-session provider for customer and operator surfaces.

`apps/app`, `apps/admin`, and authenticated Neptlium Treasury surfaces use shared Supabase browser/server/session primitives. `apps/api` verifies Supabase bearer tokens and resolves the verified `SUPABASE_AUTH` subject to a stable Neptlium principal before authorization.

Historical identity-provider mappings may remain as migration/audit evidence, but they are not active runtime authentication paths.

## Supabase — persistence provider

Supabase is server-side data infrastructure where configured: PostgreSQL persistence, migrations, repositories, constraints/RLS, rate limiting, provider inboxes, audit, identity mapping storage, financial state, and reconciliation.

Supabase service-role access is infrastructure authority only. It is never a customer/operator browser credential or financial authorization mechanism.

## Circle — digital money and settlement adapter

Circle is the primary provider boundary for supported stablecoin/digital-money infrastructure where explicitly certified.

Permitted responsibilities include reviewed wallet/address provisioning, supported stablecoin operations, provider-side transfer/settlement capabilities, provider transaction lookup and signed provider event ingestion. Implemented source may include wallet/address lookup and provider observations.

Circle must not:

- decide whether a principal or organization is authorized to move money;
- define a Neptlium account balance or available balance;
- bypass policy, approval, risk, reservation or idempotency controls;
- post directly to product-visible canonical financial state without governed reconciliation;
- expose credentials, entity secrets or signing material to browsers.

Configuration or source support does not establish customer-facing production eligibility. Circle balance/transaction observations are evidence and remain non-canonical until governed posting/reconciliation. Circle credentials and entity secrets are server-only.

## Alchemy — multi-chain observation and intelligence adapter

Alchemy is Neptlium's primary blockchain connectivity, observation and intelligence boundary where configured and certified.

Alchemy must be modeled as a multi-chain adapter behind a canonical Neptlium chain registry, not as a product dependency on one hard-coded network. Each supported network is independently identified, configured, observed, health-checked and capability-certified.

Permitted responsibilities include RPC connectivity, block/transaction/receipt lookup, confirmation observation, address/activity observation, signed webhook ingress, simulation and other explicitly reviewed chain intelligence. Smart-account or gas capabilities, if adopted, remain separate advertised capabilities and do not imply signing or execution authority.

Alchemy must not:

- authorize deposits, withdrawals, transfers or contract interactions;
- determine canonical Neptlium balances or availability;
- silently convert an observed transaction into a reconciled ledger event;
- expose API keys or signing/webhook material to browsers;
- silently enable a new chain merely because Alchemy supports it.

An Alchemy observation is settlement evidence only after the applicable chain/asset confirmation policy is satisfied, and remains non-canonical until reconciliation.

### Multi-chain target

The target runtime replaces any legacy single-RPC production assumption with a typed chain registry and per-network endpoints/capabilities. Networks such as Ethereum, Base, Arbitrum, Optimism and Polygon may be candidates, but a network is live only after its exact production configuration and capability have been verified. Additional Alchemy-supported networks can be introduced through the registry without rewriting product-domain contracts.

Until that target implementation is merged and certified, existing single-network runtime constraints remain **CURRENT** behavior and must not be represented as full multi-chain production availability.

## Stripe — fiat and payment adapter

Stripe is Neptlium's primary external adapter for supported fiat/card/bank-payment and billing capabilities where explicitly implemented and certified.

Permitted responsibilities may include payment collection, Checkout, supported bank/card payment methods, subscriptions/billing, refunds, provider payment state and signed webhook ingress.

Stripe must not:

- become the Neptlium business-account or transaction domain model;
- determine canonical customer balances or financial availability;
- bypass Neptlium eligibility, policy, idempotency, risk or reconciliation;
- turn a successful provider response into canonical settlement without the required evidence/reconciliation;
- expose secret keys or webhook signing secrets to browsers.

Current Stripe source supports governed subscription-billing webhook ingress. It does **not** by itself establish live customer capital funding. Target fiat deposit/funding capabilities require a separately reviewed Payments/funding contract including eligibility, payment creation, signed webhook ingestion, failure/refund/dispute handling, ledger posting and reconciliation.

## Crypto deposits, withdrawals and networks

A target crypto catalog may include multiple reviewed asset/network pairs. A catalog is not itself a provider-capability claim.

Each pair requires a reviewed address/wallet provider, chain observer, webhook/polling strategy, confirmation/finality policy, compliance handling, replay/idempotency controls and reconciliation adapter. The API capability registry decides what is exposed to each principal and organization.

A chain being observable through Alchemy does not mean Circle supports settlement on that chain, and neither fact means Neptlium has enabled deposits or withdrawals there.

## Provider orchestration rules

Every provider adapter must:

- expose Neptlium domain types rather than leak SDK responses into product pages;
- advertise capability by asset/currency, network/rail, environment and operation;
- validate configuration and fail closed;
- preserve Neptlium idempotency and provider idempotency where available;
- verify official webhook/signature contracts before accepting evidence;
- durably inbox provider events before authoritative processing where applicable;
- preserve safe provider references, timestamps and correlation IDs;
- distinguish requested, approved, submitted, observed, confirmed, settled and reconciled states;
- normalize errors without leaking secrets;
- support controlled lookup after ambiguous timeouts;
- expose provider health/degradation separately from financial truth;
- never silently enable mainnet, execution, a new network, rail or unsupported asset.

## Security and execution doctrine

Provider credentials, API secrets, webhook signing secrets, entity secrets and signing material are server-only. Browser applications may request Neptlium commands and read authorized Neptlium projections; they do not invoke privileged provider execution directly.

Execution requires explicit server-side authorization and applicable ownership, policy, approval, risk, idempotency and capability checks. A provider being configured or healthy is never sufficient authorization.

## CURRENT / TRANSITION / TARGET

**CURRENT** — Circle, Alchemy and Stripe integrations exist at different implementation depths. Current runtime configuration still contains legacy single-network Alchemy assumptions and Stripe funding is not established merely by billing webhook support.

**TRANSITION** — align runtime configuration, provider boundaries, capability registry, tests, webhook ingress and reconciliation with this doctrine while preserving existing financial gates and verified work.

**TARGET** — Circle is the stablecoin/digital-money settlement adapter, Alchemy is a certified multi-chain observation/intelligence adapter, Stripe is the fiat/payment adapter, and Neptlium Platform Core remains the sole authority for authorization, policy, intents, canonical ledger, audit and reconciliation across every product surface.
