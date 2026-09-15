# Alchemy Multi-Chain Contract

Alchemy is Neptlium's blockchain connectivity, observation and intelligence adapter. It is multi-chain by architecture and granular by capability.

## Canonical chain ownership

Neptlium owns canonical chain identities. The initial production EVM registry models Ethereum (1), Base (8453), Arbitrum One (42161), Optimism (10) and Polygon PoS (137). Provider network slugs and RPC endpoints map onto these identities; they do not replace them.

## Endpoint configuration

Per-chain Alchemy endpoints are independently configured and validated against the expected Alchemy network hostname. Partial configuration is valid for observation migration and does not imply unsupported chains are available.

## Capability separation

For every chain, distinguish:

- RPC configured;
- connectivity verified;
- observation capability certified;
- asset/network confirmation policy certified;
- deposit capability certified;
- withdrawal capability certified;
- execution enabled, if applicable through another authorized provider/signing boundary.

Alchemy observation certification never authorizes financial execution.

## Cross-provider composition

A stablecoin operation may combine Circle as the digital-money/settlement adapter and Alchemy as chain evidence. Both provider capabilities must be independently certified, and Neptlium Platform Core remains responsible for authorization, intent lifecycle, settlement policy and reconciliation.

## Migration truth

The existing runtime still has a legacy Base-specific `ALCHEMY_RPC_URL` production check. The per-chain registry/configuration introduced by the provider doctrine is the target architecture; the legacy path must remain until runtime integration and replacement tests are complete.
