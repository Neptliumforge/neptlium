# Provider Canonical State

## CURRENT

The production codebase has existing Circle, Alchemy and Stripe integration surfaces. Alchemy runtime configuration still includes a Base-specific single-RPC constraint. Stripe billing webhook support does not establish fiat capital funding. Economic capability flags remain separate from provider configuration.

## TRANSITION

This provider-doctrine slice introduces canonical role definitions, API-local authority rules, typed capability/evidence/policy/readiness primitives, a canonical initial EVM chain registry, per-network Alchemy target configuration, tests and operating standards. Existing runtime paths are migrated only after overlap/dependency reconciliation and validation.

## TARGET

Circle is the certified stablecoin/digital-money wallet/settlement adapter; Alchemy is the certified multi-chain observation/intelligence adapter; Stripe is the certified fiat/payment adapter. Neptlium Platform Core remains the sole authority for authorization, policy, intents, canonical ledger, reconciliation and audit. Capabilities are granular, independently certified and execution-gated.
