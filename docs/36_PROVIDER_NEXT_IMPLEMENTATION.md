# Next Provider Implementation Slice

The next implementation slice after this doctrine branch is the Alchemy multi-chain runtime migration.

Scope:

- preserve current Base configuration compatibility while introducing canonical per-network resolution;
- add server-side configuration for Ethereum, Base, Arbitrum, Optimism and Polygon;
- validate each RPC against its expected network/environment;
- expose normalized read-only network capability state;
- update Alchemy observation evidence to carry canonical Neptlium network identity rather than infer Base solely from provider environment;
- keep deposits, withdrawals and contract execution disabled by default;
- add tests proving one configured network does not certify another;
- update `.env.example` with exact implemented variable names;
- no production secret mutation in the code PR;
- no production financial execution.

After that slice passes, operators can add the exact new Vercel variables and certify observation network-by-network.
