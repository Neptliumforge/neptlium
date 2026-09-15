# Provider Governance

Provider architecture is governed as a platform concern, not independently by product teams.

## Platform Core

Owns financial authority, provider capability semantics, canonical chain identity, lifecycle distinctions, ledger/reconciliation contracts and cross-product provider invariants.

## API engineering

Owns server-side adapters, configuration validation, provider command/evidence boundaries, signature verification, idempotency, normalized failures, capability selection and safe telemetry.

## Product engineering

Capital, Treasury, Pay, App, Admin and Forge consume governed Neptlium contracts. Product code may request capabilities and render truthful projections but must not invent provider authority or bypass API controls.

## Operations

Operations may configure provider resources and approved environment variables under explicit authorization. Operational configuration does not alter architectural authority and does not itself certify a capability.

## Security/risk

Security/risk review is required for new custody/signing authority, new externally mutating economic capability, material webhook/authentication changes, new provider trust boundaries or changes that could affect financial authorization/reconciliation.
