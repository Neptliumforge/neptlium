# Provider Architecture

Providers are replaceable capability adapters. Neptlium owns principal identity, policy, intents, canonical ledger, reservations, lifecycle, audit, and reconciliation.

## CURRENT

### Circle

Circle Developer-Controlled Wallets is the capital-provider adapter in `apps/api/src/circle.ts`.

- Environment model: configured testnet (`BASE-SEPOLIA`) or production (`BASE`). Production configuration also requires `ENABLE_MAINNET=true`.
- Implemented adapter capability: existing EOA wallet lookup, existing address retrieval, USDC balance observation, and transaction observation.
- Disabled/unimplemented capability: automatic wallet provisioning is disabled; transfer submission remains unimplemented even when its live execution flag is enabled.
- Webhooks: `/v1/webhooks/circle` fails closed because official-contract signature verification has not been implemented.
- Provider balances are returned as `provider_observed`, not canonical.

Circle credentials and entity secret are server-only. Private keys/recovery material are never stored in the provider-link table.

### Supabase

Supabase is the current data platform: Postgres schema/migrations, RLS, Auth compatibility during identity transition, server/browser clients, and service-role access at narrow privileged boundaries.

Supabase Auth remains present as transition infrastructure so existing users can prove legacy ownership during Clerk migration. It is not the permanent business identity authority.

### Clerk

Clerk is the CURRENT browser authentication/session/MFA authority for customer and operator surfaces. `apps/app` and `apps/admin` use Clerk primitives, while `apps/api` supports `SUPABASE`, `DUAL`, and `CLERK` verification modes and resolves authenticated provider subjects to stable Neptlium principals.

The production identity transition remains additive: legacy Supabase Auth records and mappings are retained only where required for continuity, and no second Neptlium principal may be created merely because a user changes authentication provider.

### Alchemy

Alchemy is observation-only groundwork:

- testnet/production API and Base RPC configuration validation;
- a production-capability verification flag that does not authorize execution;
- normalization of chain observations into non-canonical settlement evidence;
- a generic `/v1/webhooks/alchemy` ingestion boundary that fails closed without verification.

No current code proves a complete Alchemy custody, balance, transfer, or production webhook capability. Alchemy cannot authorize, execute, post ledger entries, or establish availability.

### Stripe

Stripe support is evidence-only in the current architecture. Stripe Treasury is excluded. Current Stripe support does not grant customer funding or treasury execution capability. A future funding flow requires an approved Payments or Onramp contract plus durable attribution, official webhook verification, failure/refund handling, balanced ledger posting, and reconciliation.

### Coinbase

Coinbase is not part of the active provider architecture. Historical Coinbase references may remain only in archive/history or tests that explicitly assert its absence from runtime/provider composition. Do not reintroduce Coinbase without a separately approved architecture change.

## TARGET

### Future funding rails

Future provider capabilities may be added only through reviewed provider adapters that preserve Neptlium authorization, idempotency, settlement evidence, canonical posting, and reconciliation. Provider credentials or SDK availability alone never establish a live capability.

### Future equities provider

An equities provider may supply brokerage/custody, market data, order, execution, and position evidence only after technical, legal, and operational review. No provider or capability is selected or implemented by this document.

## Adapter rules

Every provider adapter must:

- expose Neptlium domain types, not leak SDK responses into apps;
- advertise capability by asset, network/rail, environment, and operation;
- validate configuration and fail closed;
- support provider idempotency where offered and Neptlium idempotency always;
- verify webhooks against the reviewed official contract before ingestion;
- preserve safe provider references and observation timestamps;
- distinguish submission, provider observation, reconciliation, and canonical settlement;
- normalize errors without leaking secrets or provider internals;
- support controlled lookup after ambiguous timeouts;
- never silently enable mainnet, execution, or unsupported assets.

## Provider selection

Selection is capability- and policy-driven, not hard-coded into product pages. A provider can be configured yet degraded, restricted, or ineligible for a given principal, jurisdiction, asset, amount, or operation. Multiple providers must not cause duplicate canonical state.
