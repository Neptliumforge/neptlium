# @neptlium/api

Node.js/TypeScript API for `api.neptlium.com`. Versioned routes live under `/v1`; the API is Neptlium's authorization, product-state, provider, ledger, webhook, and audit boundary.

## Authentication

Clerk is the only runtime authentication provider accepted by customer and operator API routes.

- Bearer tokens are verified with Clerk.
- The verified Clerk subject is resolved to a stable Neptlium principal before authorization.
- Historical provider-mapping rows may remain in persistence for migration/audit evidence, but legacy Supabase Auth tokens are not accepted as runtime credentials.
- Supabase Auth endpoints are not part of the authentication path.
- Clerk lifecycle webhooks maintain identity lifecycle evidence.

Supabase remains a server-side durable data platform for repositories, RPCs, rate limiting, identity mapping storage, provider inboxes, audit, and other persistence. Service-role access is infrastructure authority, not user authentication.

## Financial boundary

Canonical financial state remains governed by server-side ownership, policy, idempotency, provider evidence, ledger posting, and reconciliation. Provider responses are evidence until reconciled.

Current source includes Circle/Alchemy capability gates and governed Stripe subscription webhook ingress. **Stripe capital funding is not currently enabled.** Crypto asset/network support and USD funding must not be advertised as live until the deposit architecture is implemented, provider/compliance eligibility is verified, and ledger/reconciliation gates are certified.

Gate 04 activation verification requires a production API deployment after the endpoint-specific Stripe webhook signing secret is configured. The production route remains `POST /v1/webhooks/stripe`; payment-mode Checkout events are ingestion evidence only and must not create capital state.

See [`docs/16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md`](../../docs/16_DEPOSIT_AND_ACCOUNT_FUNDING_ARCHITECTURE.md) for the target deposit flow.

## Environment

Copy `.env.example` to an untracked local file.

Authentication requires Clerk server verification configuration. Supabase values in this workspace are server-side persistence configuration only. Circle, Alchemy, Stripe, signing, and service-role values are sensitive and server-only.

## Commands

```sh
pnpm --filter @neptlium/api dev
pnpm --filter @neptlium/api test
pnpm --filter @neptlium/api build
```

## Truth boundary

- Configuration is not capability.
- Provider observation is not settlement.
- Browser completion is not canonical financial movement.
- Every consequential mutation requires authentication, authorization, ownership, idempotency, audit, and durable state.
- Webhooks fail closed without official signature verification.
