# @neptlium/api

Node.js/TypeScript API for `api.neptlium.com`. Versioned routes live under `/v1`; the API is an existing trust boundary, not a planned application.

## CURRENT

- Health, status, version, account provisioning/onboarding, Capital Account, wallet, and provider-webhook routes.
- Supabase bearer-token validation and owner-scoped repository boundary.
- Supabase durable adapter for readiness, account RPCs, Circle wallet linkage, and audit writes.
- Circle Developer-Controlled Wallets code for existing-wallet/address/balance/transaction observation on configured Base Sepolia or Base environments, with explicit runtime environment and live-execution gates.
- Ledger, idempotency, webhook inbox, treasury policy, reconciliation, worker, observability, and rate-limit contracts.

Production rejects memory persistence and process-local rate limiting. Standalone and serverless runtimes use the service-role-only Supabase distributed limiter RPC. Durable deposit, withdrawal, transaction, and webhook operations remain unsupported and fail closed. Circle transfer execution and Circle webhook verification are disabled. Alchemy observations and Stripe payment evidence require verified webhook ingress.

Stripe Treasury is not part of the runtime architecture. Stripe payment/onramp capital funding is not implemented. The governed Stripe webhook preserves only non-capital subscription billing state after signature verification, durable inbox persistence, and an idempotent claim. No Stripe event in Gate 04 can credit capital, create settlement evidence, post ledger entries, reconcile funds, or mutate legacy portfolio balances. Clerk is not implemented.

### Stripe webhook ingress

`POST /v1/webhooks/stripe` is a dedicated raw-body serverless boundary. It verifies `Stripe-Signature` with the server-only `STRIPE_WEBHOOK_SECRET` before JSON parsing, stores the verified event in `provider_webhook_inbox`, claims the event through the existing leased control plane, and only then applies an allowed `subscriptions` table transition.

Minimum subscribed events after production deployment:

- `checkout.session.completed` — subscription mode only; activates the matching Pro/Elite subscription. Payment mode is explicitly ignored as `stripe_capital_funding_not_enabled`.
- `invoice.paid` — renews the matching Stripe customer subscription.
- `customer.subscription.updated` — synchronizes supported subscription statuses; cancellation downgrades to free. Unknown Stripe statuses are recorded and ignored rather than coerced to active.

The intended production endpoint is `https://api.neptlium.com/v1/webhooks/stripe`. Do not register or repoint the Stripe Dashboard destination until the Gate 04 branch is promoted to production and this URL is verified fail-closed. Never place the endpoint `whsec_...` secret in source, logs, issues, PRs, or chat.

## Environment

Copy `.env.example` to an untracked local file. Supabase service-role values, Circle credentials/entity secret, and webhook/provider secrets are server-only. Production provider configuration requires `ENABLE_MAINNET=true`; configuration is not execution authorization.

## Commands

```sh
pnpm --filter @neptlium/api dev
pnpm --filter @neptlium/api test
pnpm --filter @neptlium/api build
```

## Truth boundary

- Provider responses are observed evidence until ledger posting and reconciliation.
- Route or schema presence does not prove production capability.
- Mutations require authentication, ownership, idempotency, policy, audit, and durable atomic persistence.
- Webhooks fail closed without official-contract verification.

Architecture: [`docs/11_API_ARCHITECTURE.md`](../../docs/11_API_ARCHITECTURE.md).
