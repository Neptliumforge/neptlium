# Provider Architecture Changelog

## 2026-09-15 — Circle + Alchemy + Stripe doctrine foundation

- Standardized strategic provider roles.
- Reasserted Neptlium Platform Core as financial authority.
- Established progressive capability activation states.
- Added provider-neutral multi-chain registry foundation for Ethereum, Base, Arbitrum, Optimism and Polygon.
- Added fail-closed provider execution capability contract.
- Added normalized non-canonical provider evidence contract.
- Added regression tests for provider authority, execution separation and multi-chain observation-first defaults.
- Documented security, reconciliation, observability, release gates, operations and governance.
- Deliberately left the legacy Base-only Alchemy runtime configuration unchanged pending a dedicated compatibility-safe migration.
- Did not enable production money movement or mutate production provider secrets.
