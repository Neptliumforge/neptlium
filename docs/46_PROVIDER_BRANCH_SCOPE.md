# Provider Doctrine Branch Scope

This branch intentionally establishes doctrine, provider-neutral API primitives, multi-chain identity foundation and regression guardrails without changing production secrets, production databases or live financial execution.

It does not yet replace the legacy Base-specific Alchemy runtime configuration. That migration is the next dedicated implementation slice because it changes deployed environment contracts and requires compatibility tests plus operator configuration.

It also does not merge the existing stacked Treasury provider foundation; that work must first be reconciled against this canonical Circle + Alchemy + Stripe decision and its Platform Core dependencies.
