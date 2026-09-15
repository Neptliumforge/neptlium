# Chain Registry Architecture

## Objective

Neptlium is multi-chain at the platform architecture level. Blockchain support must be expressed through one canonical chain registry and capability system rather than hard-coded product assumptions or one global RPC URL.

Alchemy is the current strategic chain infrastructure provider, but the registry is Neptlium-owned and provider-neutral.

## Registry responsibilities

For each reviewed network the registry defines stable Neptlium metadata such as:

- canonical network identifier;
- chain family;
- chain ID where applicable;
- environment;
- native asset identity;
- provider routing/capability metadata;
- confirmation/finality policy references;
- observation capability;
- simulation capability;
- deposit capability;
- withdrawal/execution capability;
- contract interaction capability;
- operational status.

The registry does not store secrets.

## Capability separation

A network can be RPC-enabled while deposits and withdrawals remain disabled.

Example state model:

```text
Ethereum Mainnet
  rpc:                 certified
  observation:         certified
  webhook:             certified
  simulation:          configured
  deposits:            disabled
  withdrawals:         disabled
  contract_execution:  disabled
```

This is preferable to one boolean such as `ENABLE_MAINNET` being interpreted as universal authority.

Global emergency gates may still exist, but they are upper-bound kill switches, not substitutes for per-network/per-operation authorization.

## Alchemy runtime model

The target Alchemy adapter resolves RPC and supported observation capabilities from the Neptlium chain registry plus server-side per-network configuration.

A single `ALCHEMY_RPC_URL` production assumption must not remain the long-term multi-chain contract. Migration must preserve compatibility/fail-closed behavior until the new registry-backed configuration is validated and deployed.

Environment naming should be explicit and deterministic. Secret/config names must be documented by implementation and `.env.example`; product code must never construct arbitrary secret names in the browser.

## Provider neutrality

The registry describes Neptlium networks, not Alchemy products. If a future reviewed provider supplies a network capability, provider orchestration may route that capability without changing the network's canonical identity or product-level contracts.

## Financial authority

Chain data is evidence. The canonical ledger is financial truth.

Neither an RPC balance nor a transaction confirmation alone determines customer available balance. Settlement policy, ownership resolution, provider/chain evidence, governed posting and reconciliation remain required.

## Initial direction

Existing source already names Ethereum, Arbitrum, Optimism, Polygon and Base in Treasury foundation work. Those definitions are architectural inputs, not automatic production enablement claims.

Each network must pass capability certification independently before customer-facing exposure.
