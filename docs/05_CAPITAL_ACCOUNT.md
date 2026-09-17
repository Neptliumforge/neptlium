# Capital Account

The Capital Account is the customer-facing boundary for funding, balances, withdrawals, transfers, and activity. It is not a provider wallet UI and it does not infer canonical money from provider responses.

## CURRENT

The authenticated individual application now has a coherent first funding vertical slice:

`Overview → Capital → Add money → Crypto deposit → governed funding intent → account-specific instructions → Activity`

The customer experience uses personal-investor language while the API preserves authority, provider, ledger, settlement, and reconciliation distinctions underneath.

- Overview and Capital read canonical balances and account activity through the Neptlium API.
- Add money exposes only funding methods whose capability state can be verified.
- Crypto deposit creates a server-side funding intent before requesting account-specific instructions.
- An instruction without a usable address is explicitly pending; the customer is told not to send funds.
- Creating instructions never marks a deposit received, settled, reconciled, or available.
- Successful funding-intent creation invalidates Overview, Capital, Capital Account, Activity, and Deposit server projections so navigation returns current API-backed state.
- Session expiry and unavailable provider capability fail closed.
- USD bank/card funding remains unavailable in the customer product until its financial contract is actually certified.

The repository also retains earlier financial groundwork and migration history. Production containment remains in force for execution paths that have not completed provider, ledger, policy, reconciliation, and operational certification.

### Circle foundation

Circle Developer-Controlled Wallets is provider infrastructure for supported digital-dollar/stablecoin wallet and settlement operations. It does not own Neptlium balances or authorization.

- Provider wallet/address references may be used only through governed server-side workflows.
- Provider observations are evidence, not canonical spendable balance.
- Provider credentials and Entity Secrets remain server-only.
- Wallet provisioning and economic execution remain separately gated.
- No Circle capability may be presented as live merely because credentials or code exist.

### Balance authority

Canonical customer capital comes from the Neptlium ledger after the required governed posting and reconciliation lifecycle. Provider observations, pending funding intents, deposit instructions, and UI completion states are not substitutes for canonical availability.

## NEXT BOUNDARY

The next movement slice must preserve the same customer/API separation for Withdraw and Transfer. Existing `/v1/treasury/*` naming used by legacy personal transfer plumbing is transitional debt and must not define the customer product boundary. Personal movement APIs should converge on Capital Account semantics without changing financial authority or bypassing existing fail-closed execution gates.

## TARGET information architecture

Capital Account has five customer capabilities:

1. **Overview** — capital position, available/reserved/pending state, important actions, and recent activity.
2. **Add money** — eligible funding methods, account-specific instructions, expected lifecycle, and credited activity.
3. **Withdraw** — destination, validation, policy, authorization, reservation, provider status, settlement, and reconciliation.
4. **Transfer** — verified recipient/destination resolution and governed internal or provider execution status.
5. **Activity** — immutable customer-readable history spanning funding, investments, withdrawals, transfers, reservations, reversals, settlement, and reconciliation.

## Financial invariants

- No displayed balance may be fabricated or silently substituted from provider data.
- A deposit becomes canonical only through verified evidence, idempotent processing, balanced posting, and required confirmation/settlement rules.
- Creating deposit instructions is not evidence that funds were sent or received.
- A withdrawal cannot spend reserved, pending, restricted, or unavailable capital.
- Every financial mutation has an idempotency key, actor, request ID, lifecycle state, and audit trail.
- Failures produce explicit failed/reversed states or compensating entries; posted history is never edited into agreement.
- Financial execution remains disabled wherever durable ownership, policy, ledger, provider verification, and reconciliation are incomplete.
