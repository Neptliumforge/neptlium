# Production Readiness Audit

**Repository baseline:** `e2876d437e24e17dc735656ba920e175cc7c057a`
**Local API remediation:** this production-readiness pass
**API source/artifact disposition:** **LOCALLY DEPLOYMENT-READY AFTER FORWARD MIGRATION**
**Real-money execution:** **CLOSED**

This audit records repository-verifiable evidence only. It does not authorize deployment, migration application, provider enablement, or movement of funds. Validate the exact pushed SHA and apply the reviewed forward migration before deployment.

## Readiness invariants

- Provider configuration, observation, approval, submission, settlement, posting, and reconciliation are distinct states.
- Mainnet configuration does not authorize execution.
- A route, adapter, credential, migration, or provider response does not prove live capability.
- Posted financial history remains append-only and is corrected only by reversal or compensation.

## Locally closed API blockers

### Build and Circle runtime contract

The Circle adapter now receives its configured environment, wallet-set reference, and live-execution gate in the intended constructor positions. `provider_execution_unimplemented` is part of the typed API error contract. Typecheck, build, and provider tests prove this composition. Automatic wallet provisioning stays disabled and transfer submission stays unimplemented.

### Distributed production rate limiting

Production rejects `MemoryRateLimiter`. Standalone and serverless runtimes compose `SupabaseRateLimiter`, which hashes the request bucket key and invokes the atomic, service-role-only `consume_api_rate_limit` RPC. Missing, malformed, timed-out, or unavailable rate-limit storage fails closed. The new forward migration must be applied before this runtime is deployed.

### Serverless administrative routing and CORS

The production chain `api/index.js → dist/serverless.js → executeAdminHttp → handleAdminRoute → /v1/admin/session` is regression-tested. An unauthenticated request returns `401 authentication_required`, never `404`. Admin preflight supports only configured origins, including `https://admin.neptlium.com`; disallowed origins receive `403` and no wildcard header.

### Runtime artifact

`build-vercel.mjs` asserts the emitted serverless, application, admin, financial repository/routes, funding, allocation, registry, provider, security, Stripe, and reconciliation modules that the runtime requires. It does not deploy.

## Authority and financial findings

- `apps/admin` uses Supabase for authentication/session only. Privileged reads and writes use its server-side bearer-token API client.
- Only persisted `super_admin` satisfies general platform administrator authorization. Email alone is insufficient. No administrator identity is created, demoted, or revoked by this pass.
- Legacy deposit completion audits and returns `409 deposit_completion_unavailable`.
- Legacy withdrawal approval/rejection audits and returns `409 withdrawal_approval_unavailable`; it cannot manufacture approval, submission, settlement, or reconciliation.
- Legacy allocation approval/rejection audits and returns `409 allocation_authorization_unavailable`; it cannot reserve, call a provider, mutate a ledger, or fabricate execution.

## Funding readiness

Owner-authenticated routes exist for capabilities, intents, activity, canonical balances, and persisted deposit instructions. Funding intent creation is durable and idempotent. Canonical balances derive from ledger postings. Provider confirmation cannot transition directly to `AVAILABLE`; ledger posting and matched reconciliation remain explicit gates. Unsupported rails remain unavailable and no address is invented.

## Withdrawal and allocation readiness

The current transfer execution lifecycle is `REQUESTED → AUTHORIZED → RESERVED → SUBMITTED → SETTLED → RECONCILED`, with terminal failure/reversal/cancellation paths. The separate withdrawal-control model and schema contain approval evidence, but explicit `PENDING_APPROVAL` and `APPROVED` states are not integrated into the canonical transfer enum. Provider execution remains closed.

Allocation supports observed evidence, modeling, and governed authorization. Capabilities keep reservation, execution, and reconciliation unavailable. Authorization does not call providers, reserve capital, mutate the ledger, or fabricate execution.

## Provider and first-rail conclusion

Stripe Treasury is gated code, not proven live eligibility. Circle is observation-capable but provisioning and transfer execution are inert. Alchemy is observation-only. Coinbase is legacy route/configuration groundwork without an active capital adapter. Fireblocks is not configured. No USD/ACH, USDC/Base, or BTC/Bitcoin rail has every custody, attribution, verified webhook, eligibility, settlement, ledger, reconciliation, return/reversal, and withdrawal control proven; no first live rail is selected.

## Remaining external/operational evidence

1. Review and apply `20260813090000_distributed_api_rate_limiting.sql` through the authorized forward-only migration workflow.
2. Push and validate the exact candidate SHA in required CI.
3. Confirm deployment environment variables without exposing their values.
4. Perform the remaining canonical authenticated `super_admin` token/login proof after deployment.
5. Verify provider eligibility and official webhook/reconciliation operations separately before opening any execution gate.

## Audit conclusion

Every locally provable API source, artifact, admin routing, CORS, authority, and fail-closed gate covered by this pass is implemented and tested. The API code requires no release-only source change to deploy after the forward migration is applied. This is not a declaration of real-money readiness: all provider execution remains closed.
