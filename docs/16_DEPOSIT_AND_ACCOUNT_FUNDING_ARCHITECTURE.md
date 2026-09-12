# Deposit and Account Funding Architecture

**Status:** Approved target architecture. Source presence does not prove provider eligibility, live asset/network support, settlement, or production capability.

## Product goal

Deposit becomes a first-class authenticated workflow with the clarity of a top-tier consumer finance/custody product while preserving Neptlium's institutional truth boundaries.

Canonical route: `/dashboard/deposit`.

The first screen contains two large choices:

- **Deposit crypto**
- **Deposit USD**

No rail is shown as available unless the API capability response allows it for the current user, jurisdiction, provider environment, compliance state and product configuration.

## Crypto deposit flow

### 1. Choose asset and network

Target product matrix:

| Asset | Network |
| --- | --- |
| USDT | TRON / TRC-20 |
| USDC | Base |
| BTC | Bitcoin |
| ETH | Ethereum |
| LTC | Litecoin |
| SOL | Solana |

Asset and network are always an explicit pair. The client must never infer a network from the asset symbol.

This matrix is a target catalog, not a claim that every pair is currently supported by the existing provider stack. The API capability registry is the source of truth for what may actually be selected.

### 2. Create deposit intent

The client sends a governed request such as:

`POST /v1/deposits/intents`

```json
{
  "rail": "CRYPTO",
  "asset": "USDC",
  "network": "BASE"
}
```

The server authenticates the Clerk session, resolves the Neptlium principal, validates compliance/limits/capability and creates an idempotent deposit intent.

### 3. Display instructions

The API returns server/provider-issued deposit instructions. The browser never generates an address.

Required instruction fields include:

- exact asset and network;
- destination address;
- optional memo/tag when required;
- QR payload or canonical payment URI;
- minimum/maximum or provider limit information when applicable;
- network confirmation expectations;
- address rotation/expiry metadata where applicable;
- explicit warning: send only the selected asset on the selected network.

The UI shows a large QR code, copy-address control, network badge and concise instructions. QR generation should happen locally from the exact API-returned payload; do not send customer deposit addresses to an external QR service.

### 4. User-submitted evidence

After sending, the user may submit:

- transaction hash / transaction ID;
- optional receipt/supporting document;
- optional note.

The UI action is **Done** or **I sent the funds**. It does not credit the account. It records evidence and opens the pending deposit detail.

Hash syntax is validated by network, but syntactic validity is not settlement proof.

### 5. Observation and settlement

Canonical progression:

`INSTRUCTIONS_ISSUED` → `AWAITING_TRANSFER` → `OBSERVED` → `CONFIRMING` → `REVIEW` (when required) → `SETTLED` → `RECONCILED`

Failure/reversal states include `FAILED`, `RETURNED`, `REJECTED`, `EXPIRED`, and `RESTRICTED` where applicable.

Provider/webhook/chain observation confirms the transaction. Only server-authorized ledger posting and reconciliation make funds canonically available.

## USD deposit flow

### 1. Enter amount

The user chooses **Deposit USD**, enters the amount, reviews limits/fees and continues.

### 2. Create governed USD funding intent

`POST /v1/deposits/intents`

```json
{
  "rail": "USD",
  "asset": "USD",
  "amount": "2500.00"
}
```

The API validates identity, compliance, jurisdiction, limits, idempotency and current provider capability before creating any Stripe object.

### 3. Stripe payment flow

When separately implemented and certified, the API creates the appropriate Stripe payment/funding object and returns only the client-safe fields needed to complete Stripe's flow.

The browser never handles Stripe secret keys. A client success callback is not settlement evidence.

### 4. Webhook, posting and reconciliation

Signed Stripe webhook → durable provider inbox → idempotent claim → payment/funding evidence → policy/compliance checks → canonical ledger posting → reconciliation → available balance.

**Current source does not enable Stripe capital funding.** Existing Stripe webhook work handles subscription billing only. USD deposit must remain unavailable until a separate reviewed Stripe capital-funding contract, compliance approval, webhook handling, ledger posting and reconciliation implementation are complete.

## API contract

Target endpoints:

- `GET /v1/deposits/capabilities`
- `POST /v1/deposits/intents`
- `GET /v1/deposits/:id`
- `GET /v1/deposits/:id/instructions`
- `POST /v1/deposits/:id/evidence`
- provider-specific signed webhook endpoints

Every mutation requires an idempotency key. The API, not the UI, owns capability and state transitions.

## Capability response

The capability response should be explicit and user-specific. Example shape:

```json
{
  "crypto": [
    { "asset": "USDC", "network": "BASE", "state": "ENABLED" },
    { "asset": "BTC", "network": "BITCOIN", "state": "NOT_CONFIGURED" }
  ],
  "usd": { "provider": "STRIPE", "state": "NOT_CONFIGURED" }
}
```

The UI renders only the capabilities the server says are available; disabled targets may be omitted or shown as unavailable according to product policy.

## Provider adapter architecture

The application UI must not encode Circle, Alchemy, TRON, Bitcoin, Litecoin, Solana or Stripe assumptions directly into product state. `apps/api` exposes a normalized capability/deposit contract and provider adapters implement each rail behind it.

Network-specific observers and address providers can be added independently while keeping one customer deposit model.

## Document handling

Evidence uploads require a governed document API. Files must be scanned, size/type constrained, encrypted and associated with the authenticated principal + deposit intent. Uploading a document or hash never changes the deposit to settled by itself.

## Dashboard integration

The next dashboard redesign should expose quick actions near the balance summary:

- Deposit
- Withdraw
- Transfer

Deposit opens `/dashboard/deposit` directly. The overview and Capital Account then show pending deposits separately from available balance.

## Security invariants

- Clerk authenticates every deposit request.
- The server derives the principal; clients never choose owner IDs.
- Deposit addresses are provider/server-issued, never browser-generated.
- Asset and network are explicit and validated.
- Compliance, sanctions, velocity, amount and jurisdiction policies are server-side.
- Webhooks use official signature verification and replay protection.
- User-submitted hashes/receipts are evidence only.
- Pending deposits never inflate available balance.
- Stripe browser completion never self-credits USD.
- Canonical availability requires durable posting and reconciliation.

## Design direction

The workflow should be extremely clean: white + Neptlium green in light mode; deep charcoal + green in dark mode; restrained typography; one decision per step; large readable asset/network rows; strong copy controls; status timeline; no cluttered exchange-style charts inside the deposit wizard.
