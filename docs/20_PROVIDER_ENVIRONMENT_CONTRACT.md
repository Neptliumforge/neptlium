# Provider Environment Contract

Provider environment variables belong to the privileged API/runtime boundary. Secret values must never be committed.

## Alchemy

Current migration compatibility retains `ALCHEMY_RPC_URL`. Multi-chain target configuration introduces independently mapped endpoints:

- `ALCHEMY_ETHEREUM_RPC_URL`
- `ALCHEMY_BASE_RPC_URL`
- `ALCHEMY_ARBITRUM_RPC_URL`
- `ALCHEMY_OPTIMISM_RPC_URL`
- `ALCHEMY_POLYGON_RPC_URL`

Shared Alchemy configuration includes `ALCHEMY_API_KEY`, `ALCHEMY_ENVIRONMENT` and `ALCHEMY_WEBHOOK_SIGNING_KEY`. Endpoint presence means configured observation only; it does not certify or enable financial capability.

## Circle

Server-side configuration includes `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_ENVIRONMENT` and `CIRCLE_WALLET_SET_ID` where applicable. `CIRCLE_LIVE_CAPABILITY_VERIFIED` and `CIRCLE_LIVE_EXECUTION_ENABLED` remain distinct gates. Wallet provisioning, deposits and withdrawals retain separate Neptlium product gates.

## Stripe

Server-side configuration includes `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Their presence establishes configuration only. Current webhook support must not be interpreted as certified fiat capital funding.

## Environment isolation

Development/test/preview should use non-production provider resources. Production secrets must not be copied into preview merely for convenience. Mainnet/provider production environments require explicit production configuration and the applicable Neptlium gates.

## Secret handling

Never expose privileged provider values through `NEXT_PUBLIC_*`, `VITE_*`, browser bundles, client logs, public docs, issue bodies, PR descriptions or screenshots. `.env.example` contains names and safe defaults only.
