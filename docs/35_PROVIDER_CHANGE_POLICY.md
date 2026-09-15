# Provider Change Policy

Changes to Circle, Alchemy or Stripe integration must preserve the canonical provider doctrine unless an explicit architecture decision replaces it.

## Changes requiring architecture review

- introducing a new primary provider or replacing one of the canonical roles;
- allowing a provider to own canonical balance/ledger/reconciliation semantics;
- adding a signing/custody authority;
- changing chain identity ownership away from the Neptlium registry;
- allowing browser/provider-direct privileged execution;
- collapsing configuration/certification/execution gates;
- enabling a new economic operation without an explicit reconciliation contract.

## Routine reviewed changes

Adding a provider-supported chain endpoint, asset/network capability, webhook event type or payment rail may be routine only when it fits existing contracts, remains fail-closed and passes the applicable release gates.

## Documentation

Any provider change that affects responsibility, capability, environment contract, lifecycle, security, reconciliation or production operation must update the applicable current numbered documentation and tests in the same change set.
