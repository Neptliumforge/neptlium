# Gate 01B local assurance proposals

## CURRENT

Execution evidence and the complete changed-file inventory are recorded in [local validation](LOCAL_VALIDATION.md).

This directory contains **unapplied SQL proposals**, not migration entrypoints. Nothing here is deployed, scheduled, backfilled or executed. Do not copy these files into `supabase/migrations` or set the disposable-SQL test gate without explicit authorization. Database correctness and production readiness are not established by TypeScript or mocked tests.

The current worktree began with 11 modified tracked files and 3 untracked files. Baseline copies and SHA-256 inventory were preserved at `/tmp/neptlium-gate01b-baseline` before editing. The existing canonical balance work is retained; only its `financial-routes.ts` provider/router sections receive additional local edits. No other originally modified/untracked file is intentionally rewritten.

### Reconciliation

- [PR #137](https://github.com/Neptliumforge/neptlium/pull/137) contains the initialization migration, canonical balance contract and database tests absent from this branch. Existing local balance code calls its RPC and probes its table. Without those dependencies, reads/readiness fail closed. Reconcile with the actual PR files before any schema/release work; do not create a second initialization authority.
- [PR #134](https://github.com/Neptliumforge/neptlium/pull/134) owns profile browser-write containment and provisioning preservation. It remains open. This execution does not claim its migration is applied or duplicate it. The existing profile authority exposure remains a blocker.
- Both PRs explicitly request owner approval before merge because of unverified Supabase GitHub production integration behavior. No merge or remote mutation is part of this execution.

## TRANSITION — webhook assurance

`webhook-fencing.sql` proposes:

- Explicit `acquired` plus an unpredictable lease token. Active leases/backoff do not confer ownership. Expired leases can be reclaimed; exhausted attempts dead-letter even after repeated worker crashes.
- Token/expiry checks under row locks for completion and failure. Subscription mutation and inbox completion form one transaction. Legacy unfenced RPC privileges are revoked as a coordinated release dependency.
- Bounded durable recovery scans; claiming still arbitrates ownership. Runtime exposes a callable worker, with no cron, public replay endpoint or scheduler activation.
- Immutable server-owned subscription bindings scoped to environment/customer/subscription and a single subscription row. No binding is guessed or backfilled. Metadata cannot choose a different price plan or owner. Missing bindings fail closed.
- Strictly older subscription events do not mutate state; equal-timestamp different events fail pending authoritative reconciliation. No arbitrary event-ID sorting. Restrictive provider states are retained separately and map conservatively to the existing subscription status enum. A canceled/unpaid/paused/incomplete-expired subscription loses its paid plan. Invoice payment remains evidence and never reactivates a subscription.
- Receipt-validated Alchemy observations enter a separate append-only evidence table, not settlement or ledger tables. Different signed notifications retain separate observations; conflicting content for the same inbox/receipt/log is rejected. No observed confirmation count establishes financial finality.

The application now calls v2 functions with no unfenced fallback. **It must not be deployed against the current schema.** Missing v2 functions return 503. This is intentional local fail-closed transition behavior, not completed production processing.

### Provider contracts

- Stripe requires server-only `STRIPE_WEBHOOK_ENVIRONMENT` (`test` or `live`) matching the signed `livemode`; `NODE_ENV` never supplies it. Both runtime ingress paths use the same handler. Deferred deliveries return 503 so provider retries remain possible.
- Circle Wallets v2 verification uses ECDSA-SHA256 over exact bytes, a trusted fixed public-key endpoint, strict key/signature handling, bounded key fetch/cache and expected subscription binding. Dedicated server-only `CIRCLE_WEBHOOK_API_KEY`, `CIRCLE_WEBHOOK_ENVIRONMENT` and `CIRCLE_WEBHOOK_SUBSCRIPTION_ID` remain unset here. They are independent of custody entity-secret/execution configuration. Supported evidence topics are inbound/outbound transaction notifications; unsupported topics reject. Key lookup does not execute wallet operations.
- Alchemy validates HMAC format/raw bytes plus `ALCHEMY_WEBHOOK_ID`, `ADDRESS_ACTIVITY` and environment network. The read-only Base USDC consumer checks chain ID, successful receipt, transaction/block/log identity, current canonical block hash and unique governed route before normalization. It never creates routes, settles money or enables deposits. Missing receipt/route certainty retries or dead-letters rather than attributing by symbol or dashboard amount. Other assets/networks need separate reviewed adapters.
- Actual provider account settings, registered endpoint versions, environment bindings, keys and notification replay behavior remain unverified. No environment file or production setting was changed.

Official contracts: [Circle](https://developers.circle.com/api-reference/verify-webhook-signatures), [Alchemy](https://www.alchemy.com/docs/reference/notify-api-quickstart), [Stripe subscriptions](https://docs.stripe.com/billing/subscriptions/webhooks).

## TRANSITION — ledger proposals

`ledger-hardening.sql` replaces the posting function prospectively. It validates non-null arrays, bounded posting counts, positive integer strings up to numeric(78,0), ownership, treasury-account exceptions, exact asset/network identity and balanced totals per asset/network. Deferred database checks reject empty/incomplete or unbalanced journals at commit. Complete table privilege revocation removes service-role TRUNCATE as well as direct writes, followed by read-only grants. Existing history is untouched; corrections remain compensating journals.

`fixture.sql` and `apps/api/test/gate01b-database-proposals.test.mjs` prepare disposable-database tests for fences, lease replacement, backoff/dead-letter, atomic rollback, binding/cardinality, stale/ambiguous order, integer/null/network defects and inherited default grants. They are **NOT RUN** under the current no-migration instruction. PGlite concurrency serializes database calls and does not substitute for multi-session PostgreSQL 17 race tests.

Profile and initialization readiness must additionally verify PR #134/#137 against production-equivalent grants, browser denial of compliance/provisioning/organization writes, inactive-account preservation during onboarding, initialization only through the approved function/first provisioning transition, owner scoping, exact numeric aggregation and no implicit backfill. No schema or production claim is inferred from PR descriptions.

## TARGET — next dependency-ordered gate

1. Review these proposals and PR #134/#137 together. Confirm Supabase GitHub integration behavior read-only before any publication or merge decision.
2. Obtain explicit authorization to execute disposable SQL tests. Run the prepared fixture/proposals in an isolated database, then PostgreSQL 17 with separate connections, negative controls and the complete migration chain. Resolve syntax, trigger, role/default-grant, numeric, race and rollback defects before versioning any migration.
3. Review live catalogs read-only: migration versions, function signatures/owners/ACLs, table/column privileges, RLS/policies, triggers and current initialization prerequisites. Never retrieve customer rows or credentials for this check.
4. Design approved billing provisioning and authoritative subscription refresh for same-timestamp ambiguities. Create no environment/customer bindings through guesses or this release.
5. Separately authorize migration versioning/application and a coordinated API release; old workers must not retain unfenced execution. No production migration/backfill is authorized here.
6. Separately review actual provider endpoint contracts and environment bindings, and authorize an operational recovery scheduler with monitoring/dead-letter procedures. No worker is activated by this proposal.
7. Validate authenticated browser behavior against non-production Supabase/API fixtures. Independently approve deployment.
8. Investment enrollment remains closed until all [offering/legal/custody/eligibility requirements](../../../financial/INVESTMENT_ORDER_ENROLLMENT.md) and its distinct financial workflow are approved and implemented. Neither webhook hardening nor a deployed prototype grants offering authority.
