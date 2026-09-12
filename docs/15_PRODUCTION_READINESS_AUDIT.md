# NEPTLIUM Production Remediation Execution Ledger

**Status:** ACTIVE  
**Mode:** PRODUCTION REMEDIATION  
**Audited repository baseline:** `b0c87d5445ffb80ac0fbeff58fa8ee15e0164134`  
**Live data-plane audit date:** 2026-09-12  
**Real-money release status:** CLOSED

This document is the canonical execution ledger for bringing NEPTLIUM from deployed-but-not-proven financial architecture to a production-ready platform. It overrides optimistic or stale readiness language elsewhere while any gate below remains open.

## Completion standard

A gate may be marked `COMPLETE` only when implementation, deployment/configuration, runtime exercise, durable evidence, and required validation are all proven. Code presence, green CI, a merged PR, a healthy deployment, or a database migration by itself is insufficient.

Allowed states:

- `OPEN`
- `IN PROGRESS`
- `BLOCKED`
- `COMPLETE`

Every completed gate must record evidence sufficient for an independent reviewer to verify what changed and what was exercised without exposing secrets.

## Production findings that define this plan

The live production audit established:

- Supabase production is healthy in `us-east-2` on Postgres 17.6.
- The newer canonical financial schema is deployed.
- Canonical tables including `funding_intents`, `transfer_executions`, `provider_references`, `settlement_evidence`, `ledger_journals`, `ledger_postings`, `reconciliation_runs`, `reconciliation_items`, `deposit_routes`, `capital_reservations`, and `treasury_destinations` contained zero lifecycle rows at audit time.
- Legacy `process-withdraw` remained active and could mark a withdrawal completed after subtracting `portfolios.total_value` without executing an external payout.
- Legacy `stripe-webhook` remained active, directly mutated `transactions`/`portfolios`, and was deployed with JWT verification enabled despite being intended for Stripe-originated requests.
- `crypto-webhook` remained active as placeholder sample code.
- `process-deposit` remained active as a legacy direct mutation path.
- Newer server-only financial tables were generally default-deny to `anon`/`authenticated`, which is the correct direction and must be preserved.
- Seven authenticated-executable treasury/identity `SECURITY DEFINER` RPCs exist; inspected treasury commands verify the authenticated Clerk principal and `super_admin` role, but the externally callable privileged RPC surface should still be minimized.
- Supabase Auth remained active for 16 legacy users while only 5 active Clerk subject mappings existed at audit time.
- Supabase security advisor reported leaked-password protection disabled, 45 unindexed foreign keys, 56 RLS InitPlan warnings, and duplicate permissive-policy residue.
- The connected Vercel integration exposed the `Neptliumforge` team but no projects, preventing independent certification of production environment-variable metadata.

## Gate 01 — Disable legacy production withdrawal authority

**State:** OPEN

Required outcome:

- `process-withdraw` is no longer a production-callable money-movement authority.
- No route, UI, Edge Function, or compatibility layer can mark a withdrawal completed by only mutating `transactions` or `portfolios.total_value`.
- Any remaining compatibility endpoint fails closed or delegates to the canonical governed API path.

Required evidence:

- production function/configuration state showing the legacy function disabled/removed or made non-authoritative;
- repository search proving no active client path depends on it;
- negative runtime test demonstrating it cannot complete a withdrawal;
- no unintended customer-impact regression in read-only surfaces.

## Gate 02 — Disable placeholder crypto webhook

**State:** OPEN

Required outcome:

- the deployed placeholder `crypto-webhook` is disabled/removed or replaced by the governed provider-ingress implementation;
- no placeholder/sample handler is addressable as a production financial webhook.

Required evidence:

- deployment/function state;
- runtime negative test for old placeholder behavior;
- repository/deployment mapping for the replacement ingress if already available.

## Gate 03 — Retire or contain legacy deposit path

**State:** OPEN

Required outcome:

- `process-deposit` no longer directly establishes canonical financial truth through `transactions` and `portfolios.total_value`;
- if temporarily retained, it is explicitly non-authoritative and cannot bypass `funding_intents`, settlement evidence, ledger posting, and reconciliation.

Required evidence:

- call-site inventory;
- deployment state;
- negative bypass test;
- documented migration/removal decision.

## Gate 04 — Replace legacy Stripe webhook architecture

**State:** OPEN

Required outcome:

- Stripe webhook ingress uses the provider's official signature verification contract;
- external webhook delivery is not blocked by inappropriate Supabase user-JWT enforcement;
- accepted events are persisted idempotently in `provider_webhook_inbox` before financial processing;
- Stripe event processing cannot directly create canonical balance truth by mutating legacy portfolio totals;
- successful financial events progress through funding intent, settlement evidence, ledger, and reconciliation.

Required evidence:

- signature-verification tests;
- duplicate/replay tests;
- raw event/inbox persistence proof;
- invalid-signature rejection;
- successful canonical lifecycle linkage;
- production-equivalent webhook delivery exercise.

## Gate 05 — Remove remaining legacy money mutation paths

**State:** OPEN

Required outcome:

- no production Edge Function or browser/client code can independently move financial state by writing legacy balance/transaction tables;
- old paths are removed, disabled, or converted to non-authoritative evidence/read adapters.

Required evidence:

- repository inventory of all money-related Edge Functions and direct Supabase mutations;
- production function inventory;
- negative tests for retired paths.

## Gate 06 — Remove client-side transaction authority

**State:** OPEN

Required outcome:

- clients cannot insert or mutate canonical financial transaction truth directly;
- legacy `transactions` client INSERT/UPDATE authority is removed or rendered non-authoritative;
- all financial commands require API-side authentication, ownership, policy, idempotency, audit, and durable state.

Required evidence:

- RLS/grant diff;
- authenticated-client negative tests;
- API-path positive tests;
- confirmation that App/Admin do not use direct financial-table mutation.

## Gate 07 — Complete Circle outbound orchestration

**State:** OPEN

Related work: PR #62 and any successor implementation.

Required outcome:

```text
approved transfer
  -> deterministic/idempotent Circle submission
  -> durable provider reference
  -> submitted transition
```

The crash window between provider acceptance and local provider-reference persistence must be recoverable without duplicate money movement.

Required evidence:

- provider submission tests;
- exact atomic amount conversion tests;
- deterministic idempotency proof;
- provider-reference uniqueness/persistence proof;
- retry/recovery test around provider-accepted/local-persist-failed boundary;
- production-equivalent sandbox execution.

## Gate 08 — Wire Circle and Alchemy webhook ingestion

**State:** OPEN

Required outcome:

```text
provider callback
  -> signature/authentication verification
  -> provider_webhook_inbox
  -> dedupe/replay protection
  -> idempotent processing
  -> provider reference / settlement evidence linkage
  -> lifecycle transition
```

Required evidence:

- official provider verification implementation;
- invalid-signature rejection;
- duplicate delivery test;
- replay/timestamp handling where applicable;
- dead-letter/retry behavior;
- successful event-to-transaction linkage.

## Gate 09 — Prove complete funding lifecycle

**State:** OPEN

Required outcome:

```text
funding intent
  -> route/provider submission or observation
  -> provider confirmation
  -> settlement evidence
  -> pending ledger posting
  -> reconciliation
  -> available capital
```

Required evidence:

- durable identifiers for intent, route/reference, provider event, evidence, journal, and reconciliation item;
- exact amount/asset/network match;
- duplicate-event safety;
- only-once ledger credit;
- final available state only after matched reconciliation.

## Gate 10 — Prove complete withdrawal lifecycle

**State:** OPEN

Required outcome:

```text
withdrawal request
  -> validation/policy
  -> transfer execution
  -> capital reservation
  -> approval
  -> Circle submission
  -> provider reference
  -> submitted
  -> settlement evidence
  -> canonical settlement journal
  -> reconciliation
```

Required evidence:

- separation-of-duties approval proof;
- reservation proof;
- provider submission/reference proof;
- settlement evidence;
- journal posting;
- matched reconciliation;
- failure/cancel/retry behavior.

## Gate 11 — Verify settlement evidence authority

**State:** OPEN

Required outcome:

- every settled canonical funding/transfer state is backed by durable provider settlement evidence;
- evidence matches provider, environment, asset, network, amount, and transaction identity;
- evidence cannot be reused across unrelated financial operations.

Required evidence:

- constraint/application tests;
- negative mismatched-evidence tests;
- successful linkage from provider event to canonical transaction.

## Gate 12 — Verify canonical journal invariants

**State:** OPEN

Required outcome:

- every canonical journal balances per asset;
- every posting references the correct owner/treasury account, asset, and network;
- no duplicate journal is possible for a single canonical source operation;
- corrections use reversals/compensating entries rather than destructive history edits.

Required evidence:

- invariant test suite;
- database queries showing zero unbalanced journals;
- idempotency/uniqueness proof;
- reversal test.

## Gate 13 — Verify reconciliation

**State:** OPEN

Required outcome:

- reconciliation compares Neptlium canonical state against provider/treasury evidence;
- matched items have no unresolved discrepancy codes;
- stale submitted/pending transactions surface as explicit discrepancies;
- retries and manual review are operationally possible.

Required evidence:

- reconciliation run and item records;
- zero unexplained mismatch for the controlled lifecycle cases;
- explicit tests for discrepancy classification and retry/manual review.

## Gate 14 — Verify omnibus backing

**State:** OPEN

Required outcome:

For each supported asset/network:

- customer settled claims do not exceed reconciled treasury assets;
- customer pending claims do not exceed provider-confirmed pending treasury assets;
- backing assertions are executed after relevant funding/withdrawal state transitions.

Required evidence:

- backing snapshot before/after controlled flows;
- assertion-pass evidence;
- deliberate negative test proving under-backing is rejected/detected.

## Gate 15 — Finish Supabase-to-Clerk identity cutover

**State:** OPEN

Required outcome:

- Clerk is the certified browser/session authentication authority for App/Admin;
- every retained production principal has an intentional mapping/state;
- legacy Supabase Auth dependency is removed from ordinary product access;
- migration/recovery paths are complete;
- role/compliance authorization continues to come from canonical server-side state;
- legacy Supabase sessions cannot access retired financial paths.

Required evidence:

- principal/subject reconciliation report;
- existing-user migration tests;
- new-user bootstrap tests;
- account-recovery/MFA/operator tests as applicable;
- lifecycle webhook tests;
- proof of legacy-auth containment/retirement.

## Gate 16 — Restore Vercel visibility and audit production environment

**State:** BLOCKED

Current blocker: connected Vercel integration returns no Neptlium projects despite exposing the `Neptliumforge` team.

Required outcome:

- production Web/App/Admin/API projects are visible to the authorized audit path;
- required environment-variable names exist in the correct projects and targets;
- secret values are never exposed in documentation or audit output;
- runtime wiring confirms the deployed services can use the intended Supabase, Clerk, Circle, Stripe/Alchemy, KMS/signing, and webhook configuration as applicable;
- stale/duplicate public keys and unused variables are identified and retired safely;
- domains and production deployment mappings are verified.

Required evidence:

- project inventory;
- environment-variable metadata inventory by project/environment;
- domain/deployment mapping;
- runtime health/functional checks;
- rotation/cleanup list where applicable.

## Additional hardening before unrestricted scale

These do not replace gates 01-16 but must be scheduled before material production scale:

- enable leaked-password protection while Supabase Auth remains in use;
- reduce externally callable privileged `SECURITY DEFINER` RPC surface;
- fix high-value unindexed foreign keys;
- optimize RLS policies using init-plan-safe patterns;
- remove duplicate permissive policies and migration residue;
- retire unused Supabase publishable/legacy anon keys once consumers are identified;
- expand mandatory CI to App, Admin, API, financial integration, RLS/security, provider contract, webhook replay/idempotency, ledger invariant, and customer/admin E2E coverage;
- establish alerting for stale submissions, webhook failures/silence, reconciliation mismatches, ledger errors, KMS/provider failures, and DB/runtime errors;
- test backup/restore and rollback procedures.

## Release gate

NEPTLIUM may be rewritten/documented as production-complete only after:

- gates 01-16 are `COMPLETE`;
- no launch-scope legacy money path remains authoritative;
- controlled funding and withdrawal lifecycles both reconcile successfully;
- canonical ledger and omnibus backing invariants pass;
- identity cutover is certified;
- production environment configuration is independently audited;
- final CI/E2E/security checks pass;
- a controlled real-funds canary is explicitly authorized and reconciles successfully if real-money launch is in scope.

## Final documentation rewrite

When the release gate closes, perform a second full rewrite of README, `AGENTS.md`, and all current docs. That rewrite must describe the final deployed system, not this remediation plan. Until then, this execution ledger remains the authoritative statement of production readiness.
