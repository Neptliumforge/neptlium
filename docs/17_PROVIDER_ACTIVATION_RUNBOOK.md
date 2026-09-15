# Provider Activation Runbook

This runbook defines the safe operational sequence for activating Circle, Alchemy and Stripe. It does not authorize production mutations by itself.

## Universal activation sequence

For every provider/capability, preserve this order:

1. configure server-only credentials;
2. validate configuration without exposing secret values;
3. verify provider connectivity;
4. verify signed webhook/event ingress where applicable;
5. verify idempotent durable evidence handling;
6. verify provider lookup/recovery after ambiguous timeout;
7. certify the exact provider + environment + network/rail + asset/currency + operation capability;
8. verify Neptlium authorization/policy/approval/reconciliation path;
9. separately authorize the execution feature flag if the capability requires financial execution;
10. monitor provider health, evidence, settlement and reconciliation independently.

Never collapse configuration, certification and execution into one switch.

## Alchemy

Alchemy activation begins with observation only. Configure `ALCHEMY_API_KEY`, environment, webhook signing material and the required per-chain HTTPS RPC endpoints. Each endpoint must map to the correct canonical chain registry entry.

Verify RPC identity, block/receipt lookup, confirmation observations, webhook signature validation and simulation independently. An observed chain may remain financially disabled indefinitely.

## Circle

Configure Circle credentials/entity secret and wallet-set configuration server-side. Verify API identity/connectivity and signed provider evidence before certifying wallet/stablecoin capabilities.

Wallet provisioning, deposits and withdrawals are separate capabilities. Live execution requires an explicit execution gate in addition to capability verification. Circle observations must reconcile into Neptlium financial truth; provider balance must never replace canonical balance.

## Stripe

Configure secret key and webhook signing secret server-side. Verify signed webhook ingress and idempotency first. Existing billing capability must remain separate from future fiat funding/payment capabilities.

Any future capital funding contract must explicitly cover eligibility, payment creation, provider idempotency, signed events, failure/refund/dispute handling, settlement evidence, ledger posting and reconciliation before being advertised or enabled.

## Rollback and degradation

Provider degradation must not corrupt canonical financial state. Disable the affected capability, preserve durable intents/evidence, avoid blind retries after ambiguous provider timeouts, reconcile in-flight operations and expose degraded availability separately from balances or settlement truth.
