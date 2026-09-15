# Neptlium Treasury — Provider Orchestration Foundation

Neptlium Treasury is the organizational financial operating environment at `treasury.neptlium.com`.

Its authority chain is deliberately separate from provider infrastructure:

`Supabase Auth human identity → organization membership → role/permission → Treasury policy → approvals → signing/provider authority → provider evidence → reconciliation → canonical accounting state`

Authentication never grants payment authority by itself.

## Trust domains

### Zengo

Zengo is treated as an external protected root-treasury signer. Neptlium may register and monitor a public address, prepare a transaction intent, run policy/preflight, request organizational approvals, prepare externally signable payloads where supported, observe the resulting transaction, and reconcile evidence.

Neptlium does not store seed phrases, private keys, recovery material, biometric credentials, or Zengo account credentials. No server-side unrestricted signing API is assumed.

### Alchemy

Alchemy is blockchain infrastructure: RPC, balances, activity/indexing, signed webhook evidence, simulation, and future smart-account/gas capabilities behind explicit configuration gates. Alchemy observations are not canonical organizational balances and simulation is not authorization.

Initial network registry entries are Ethereum, Arbitrum, Optimism, and Polygon. Base exists as a disabled-by-default registry entry so it can be enabled deliberately without changing the domain model.

### Circle

Circle is USDC/stablecoin infrastructure and may support reviewed transfer or settlement workflows. External USDC remains first-class when held in Zengo, external wallets, or smart accounts. Circle provider objects never replace Neptlium transaction intents, policy, approvals, ledger, or reconciliation.

The existing Circle execution path remains separately capability-gated; this foundation does not enable it.

### Stripe

Stripe is fiat payment, checkout, billing, invoicing, refund/dispute, payout, and settlement infrastructure where the Neptlium account/region has the corresponding capability. Stripe objects are provider execution/evidence references, not Neptlium's business-level payment model.

No Stripe secret belongs in browser code. Stablecoin or crypto bridge capabilities must remain explicit capability checks and cannot be inferred from generic Stripe configuration.

## Provider-neutral Treasury domain

Treasury accounts distinguish ownership/purpose from implementation:

- `external_wallet`
- `zengo_treasury`
- `smart_account`
- `watch_only`
- `circle_managed_account`
- `stripe_balance_account`
- `bank_account`

Payment rails are provider-neutral business execution choices:

- `stablecoin_onchain`
- `circle_transfer`
- `stripe_card`
- `stripe_bank`
- `stripe_checkout`
- `future_bank_rail`

`resolvePaymentRail()` may select a reviewed available rail. Its result always carries `executionAuthorized: false`; routing is not authorization.

## Money representation

Persisted money is represented as integer atomic/minor units plus explicit scale and currency/asset identity. Floating-point values are never financial source-of-truth quantities.

Examples:

- USD 1.00 → `amountAtomic = "100"`, `scale = 2`, `currencyOrAsset = "USD"`
- USDC 1.000000 → `amountAtomic = "1000000"`, `scale = 6`, explicit canonical USDC asset identity

## Transaction intent lifecycle

The business-level transaction intent is distinct from a Stripe PaymentIntent, Circle transfer, blockchain hash, or signing payload.

The guarded lifecycle separates preflight, policy, approval, execution, settlement, and reconciliation. Skipping directly from draft/approval to settled or reconciled is invalid.

## Deterministic policy and approval

Policy evaluation is deterministic application logic. Provider configuration, AI output, and browser state cannot authorize a payment. Approval actions are immutable business evidence and segregation of duties can forbid creator self-approval.

## Preflight

The preflight layer validates organization scope, actor operating authority, source account, exact money identity, provider capability, simulation evidence where applicable, deterministic policy, risk findings, and required approvals.

A successful preflight still does not authorize provider execution. It returns either `ready_for_approval`, `ready_for_execution_review`, or `blocked`, always with `executionAuthorized: false`.

## Persistence sequencing

The canonical owner/membership/asset control plane is introduced by Platform Core. Treasury transaction-intent, approval, counterparty, receivable, and provider-reference persistence should be added only on top of that accepted control plane and must reuse the existing canonical ledger rather than create a Treasury shadow ledger.

This foundation introduces no new custody, transfer submission, settlement claim, browser financial write, or provider-secret exposure.
