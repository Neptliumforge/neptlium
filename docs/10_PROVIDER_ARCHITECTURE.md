# Provider Architecture

Providers are replaceable infrastructure/capability adapters. Neptlium owns stable principal identity, authorization, policy, intents, canonical ledger, reservations, lifecycle, audit, and reconciliation.

## Clerk — identity provider

Clerk is the sole runtime authentication, browser-session, recovery, and MFA provider for customer and operator surfaces.

`apps/app` and `apps/admin` use Clerk primitives. `apps/api` verifies Clerk bearer tokens and resolves the verified `CLERK` subject to a stable Neptlium principal before authorization.

No Supabase Auth, dual-session, or legacy password-link runtime authentication path is supported.

## Supabase — persistence provider

Supabase is server-side data infrastructure where configured: PostgreSQL persistence, migrations, repositories, RPCs, constraints/RLS, rate limiting, provider inboxes, audit, identity mapping storage, financial state, and reconciliation.

Supabase service-role access is infrastructure authority only. It is not a customer/operator authentication mechanism. Historical Supabase Auth rows and old migration references may remain as inert migration/audit evidence.

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

The target deposit catalog includes USDT/TRC-20, USDC/Base, BTC/Bitcoin, ETH/Ethereum, LTC/Litecoin and SOL/Solana. That catalog is not itself a provider-capability claim.

Each asset/network pair requires a reviewed address provider, chain observer, webhook/polling strategy, confirmation policy, compliance handling and reconciliation adapter. The API capability registry decides what is exposed to each customer.

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
