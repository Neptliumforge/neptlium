# Capital Account

The Capital Account is the customer-facing boundary for funding, balances, withdrawals, transfers, and activity. It is not a provider wallet UI and it does not infer canonical money from provider responses.

## CURRENT

The repository contains two generations of groundwork:

- Legacy `wallets`, `wallet_transactions`, `custody_addresses`, withdrawal-address, allocation-request, provider-event, and transfer-alias schema remains in migration history and application services.
- The API foundation adds private `wallet_accounts`, `wallet_addresses`, `wallet_deposits`, `wallet_withdrawals`, immutable ledger primitives, idempotency records, audit events, webhook inbox records, and reconciliation records.
- Production containment disables legacy funding and execution functions that could imply unsupported financial movement. Their history remains preserved.

`apps/app` has Capital Account/wallet views for deposit address, balance, withdrawal, and transaction activity. Several flows intentionally render unavailable or pending states rather than inventing data.

### Circle foundation

Circle Developer-Controlled Wallets is implemented behind the provider-neutral `CapitalProvider` interface for test USDC on Base Sepolia only.

- An authenticated owner can idempotently provision/link a Circle EOA through `/v1/capital-account/provider-wallet` when reviewed server credentials and a wallet-set reference are configured.
- The API can return the linked deposit address and provider-observed USDC balance.
- Provider transfer creation is explicitly disabled.
- Circle webhook verification is not implemented; no Circle webhook route may be represented as live.
- Provider wallet links store safe references and reconciliation state, never API keys, entity secrets, private keys, or recovery material.

### Balance authority

`provider_observed` balance is evidence captured from Circle at an observation time. It is not the canonical spendable balance. Canonical balance must be derived from balanced, posted Neptlium ledger entries after reconciliation and reservation policy. UI and API responses must label unavailable, provider-observed, pending, and canonical states honestly.

## TRANSITION

- Route existing user-facing wallet screens through the versioned Capital Account API instead of direct or simulated writes.
- Complete durable repository operations for deposits, withdrawals, transactions, webhook inbox processing, and idempotency before enabling them in production.
- Reconcile Circle observations to canonical ledger entries and surface discrepancies without silently correcting history.
- Preserve current wallet/account identifiers while converging on `wallet_accounts` as the canonical account boundary.
- Replace legacy containment stubs only with reviewed, atomic, idempotent workflows.

## TARGET information architecture

Capital Account has five primary views:

1. **Overview** — canonical available balance, reserved/pending amounts, account status, and last reconciliation state.
2. **Deposit** — eligible funding methods, verified destination/instructions, expected lifecycle, and credited activity.
3. **Withdraw** — destination, validation, policy, authorization, reservation, provider status, and settlement lifecycle.
4. **Transfer** — verified Neptlium-recipient resolution and internal/provider execution status.
5. **Activity** — immutable customer-readable history spanning deposits, withdrawals, transfers, reservations, reversals, and reconciliation state.

### TARGET funding providers

Stripe fiat funding and Stripe Onramp are targets only. Neither is installed, configured, or live.

- Stripe fiat funding will require a reviewed payment-intent/funding model, verified webhooks, idempotent crediting, settlement/reversal handling, and ledger reconciliation.
- Stripe Onramp will be a provider-assisted acquisition path whose provider outcome remains evidence until reconciled.
- Provider-specific terminology must stay behind Neptlium domain models.

## Financial invariants

- No displayed balance may be fabricated or silently substituted from provider data.
- A deposit becomes canonical only through verified evidence, idempotent processing, balanced posting, and required confirmation/settlement rules.
- A withdrawal cannot spend reserved, pending, restricted, or unavailable capital.
- Every mutation has an idempotency key, actor, request ID, lifecycle state, and audit trail.
- Failures produce explicit failed/reversed states or compensating entries; posted history is never edited into agreement.
- Financial execution remains disabled wherever durable ownership, policy, ledger, provider verification, and reconciliation are incomplete.
