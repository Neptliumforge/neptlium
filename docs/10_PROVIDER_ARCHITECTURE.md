# Provider Architecture

Providers are replaceable capability adapters. Neptlium owns principal identity, policy, intents, canonical ledger, reservations, lifecycle, audit, and reconciliation.

## CURRENT

### Circle

Circle Developer-Controlled Wallets is the capital-provider adapter in `apps/api/src/circle.ts`.

- Environment model: configured testnet (`BASE-SEPOLIA`) or production (`BASE`). Production configuration also requires `ENABLE_MAINNET=true`.
- Implemented adapter capability: existing EOA wallet lookup, existing address retrieval, USDC balance observation, and transaction observation.
- Persistence: safe Circle wallet identifiers, wallet-set reference, address, environment, status, observation time, and reconciliation state.
- Disabled/unimplemented capability: automatic wallet provisioning is disabled; transfer submission remains unimplemented even when its live execution flag is enabled.
- Webhooks: `/v1/webhooks/circle` fails closed because official-contract signature verification has not been implemented.
- Provider balances are returned as `provider_observed`, not canonical.

The runtime passes the configured environment, wallet-set reference, and live-execution gate explicitly. Build and provider-runtime tests lock that composition. This does not make provisioning or transfers operational.

Circle credentials and entity secret are server-only. Private keys/recovery material are never stored in the provider-link table.

### Supabase

Supabase is the current data platform: Postgres schema/migrations, RLS, Auth, server/browser clients, and service-role access at narrow privileged boundaries. Supabase persistence is current; not every migration-defined operation has a durable repository implementation.

Supabase Auth is CURRENT. It is not the permanent provider-independent principal model.

### Alchemy

Alchemy is observation-only groundwork:

- testnet/production API and Base RPC configuration validation;
- a production-capability verification flag that does not authorize execution;
- normalization of chain observations into non-canonical settlement evidence;
- a generic `/v1/webhooks/alchemy` ingestion boundary that fails closed without verification.

No current code proves a complete Alchemy custody, balance, transfer, or production webhook capability. Alchemy cannot authorize, execute, post ledger entries, or establish availability.

### Coinbase legacy configuration

Some configuration names and a generic webhook route remain from earlier groundwork. The health endpoint reports Coinbase as not configured, and there is no current Coinbase capital-provider adapter. Coinbase is not the architectural default.

## TARGET

### Stripe Treasury funding — current gated code

A server-side Stripe Treasury adapter exists for gated USD ACH inbound-transfer submission. It requires complete configuration, verified Treasury eligibility, and explicit live execution enablement. Provider submission is evidence only; durable attribution, official webhook verification, settlement/failure/return handling, balanced ledger posting, and reconciliation remain separate requirements. Repository presence does not prove live eligibility or execution.

### Stripe Onramp

Stripe Onramp is a target acquisition/funding path where available and approved. Provider completion remains evidence until Neptlium reconciliation and ledger rules are satisfied. It is not installed or live.

### Future equities provider

An equities provider may supply brokerage/custody, market data, order, execution, and position evidence only after technical, legal, and operational review. No provider or capability is selected or implemented by this document.

### Clerk

Clerk is the target authentication/session/MFA provider. Clerk will map provider subjects to provider-independent Neptlium principals and will not own financial authorization or ledger identity. No Clerk implementation exists in the audited baseline.

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
