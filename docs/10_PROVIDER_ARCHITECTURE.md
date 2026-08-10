# Provider Architecture

Providers are replaceable capability adapters. Neptlium owns principal identity, policy, intents, canonical ledger, reservations, lifecycle, audit, and reconciliation.

## CURRENT

### Circle

Circle Developer-Controlled Wallets is the verified capital-provider implementation in `apps/api/src/circle.ts`.

- Environment: testnet only; configuration rejects mainnet or ambiguous Circle environment values.
- Enabled capability: EOA wallet provisioning/linkage, address lookup, USDC balance observation, and transaction observation on `BASE-SEPOLIA`.
- Persistence: safe Circle wallet identifiers, wallet-set reference, address, environment, status, observation time, and reconciliation state.
- Disabled capability: `createTransfer` fails with `provider_execution_disabled`.
- Webhooks: `/v1/webhooks/circle` fails closed because official-contract signature verification has not been implemented.
- Provider balances are returned as `provider_observed`, not canonical.

Circle credentials and entity secret are server-only. Private keys/recovery material are never stored in the provider-link table.

### Supabase

Supabase is the current data platform: Postgres schema/migrations, RLS, Auth, server/browser clients, and service-role access at narrow privileged boundaries. Supabase persistence is current; not every migration-defined operation has a durable repository implementation.

Supabase Auth is CURRENT. It is not the permanent provider-independent principal model.

### Alchemy

Alchemy is represented only by verified groundwork:

- API configuration fields for API/RPC values;
- health reporting that calls it configured only when implementation inputs and an injected webhook verifier are present;
- a generic `/v1/webhooks/alchemy` ingestion boundary that fails closed without verification.

No current code proves a complete Alchemy custody, balance, transfer, or production webhook capability. Do not claim one.

### Coinbase legacy configuration

Some configuration names and a generic webhook route remain from earlier groundwork. The health endpoint reports Coinbase as not configured, and there is no current Coinbase capital-provider adapter. Coinbase is not the architectural default.

## TARGET

### Stripe fiat funding

Stripe is the intended target for supported fiat funding. Implementation requires provider-neutral funding intents, idempotent Stripe operations, official webhook verification, settlement/failure/refund/dispute handling, balanced ledger posting, and reconciliation. It is not installed or live.

### Stripe Onramp

Stripe Onramp is a target acquisition/funding path where available and approved. Provider completion remains evidence until Neptlium reconciliation and ledger rules are satisfied. It is not installed or live.

### Future equities provider

An equities provider may supply brokerage/custody, market data, order, execution, and position evidence only after technical, legal, and operational review. No provider or capability is selected or implemented by this document.

### Clerk

Clerk is the target authentication/session/MFA provider. Clerk will map provider subjects to provider-independent Neptlium principals and will not own financial authorization or ledger identity. No Clerk implementation exists in Phase 0.

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
