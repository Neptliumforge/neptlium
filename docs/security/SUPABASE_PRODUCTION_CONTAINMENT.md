# Supabase Production Containment — Active Remediation

## Purpose

This document defines the containment posture for the live Supabase production data-plane while NEPTLIUM completes the remediation gates in `../15_PRODUCTION_READINESS_AUDIT.md`.

The goal is not to make legacy behavior appear functional. The goal is to ensure legacy browser/Edge Function/RPC paths cannot bypass the canonical API -> provider -> settlement evidence -> ledger -> reconciliation chain.

## Verified production state

As of the 2026-09-12 live audit:

- production Supabase is active and healthy;
- the newer canonical financial tables are deployed;
- many newer financial tables are RLS-enabled and have no `anon`/`authenticated` direct privileges, which is the desired default-deny posture;
- legacy `process-withdraw`, `process-deposit`, `stripe-webhook`, and placeholder `crypto-webhook` remain deployed;
- `process-withdraw` can mutate legacy transaction/portfolio state without executing an external payout;
- legacy Stripe/deposit paths can bypass the canonical funding/ledger chain;
- several authenticated-callable treasury `SECURITY DEFINER` RPCs exist; inspected treasury mutations validate the real Clerk principal and `super_admin` role, but their exposed surface should still be minimized;
- Supabase Auth remains active for legacy identities during Clerk migration.

## Immediate containment requirements

1. Disable/remove production authority from `process-withdraw`.
2. Disable/remove the placeholder `crypto-webhook`.
3. Retire or explicitly contain `process-deposit`.
4. Replace the legacy Stripe webhook path instead of extending it.
5. Remove client authority to create or mutate canonical financial truth.
6. Preserve server-only access to canonical financial tables.
7. Keep privileged treasury mutations fail-closed and migrate them behind the API where practical.
8. Prevent legacy Supabase sessions from reaching retired financial paths.

## Canonical financial containment rule

The following tables/domains must remain server-controlled unless a reviewed exception explicitly says otherwise:

- `funding_intents`;
- `deposit_routes`;
- `provider_webhook_inbox`;
- `provider_references`;
- `settlement_evidence`;
- `transfer_executions` and transfer events;
- `capital_reservations`;
- `ledger_accounts`, `ledger_journals`, `ledger_postings`;
- `reconciliation_runs`, `reconciliation_items`;
- treasury destination governance tables.

Do not add broad `anon`/`authenticated` grants simply to unblock UI work.

## Rollback warning

The existing rollback SQL is dangerous because it can restore unsafe pre-containment authority. It must not be used merely to re-enable a legacy UI or Edge Function.

Any rollback affecting production financial authority requires explicit incident/security authorization, a maintenance plan, and evidence that the rollback does not reintroduce direct money mutation bypasses.

## Validation

Containment changes must be tested in staging/branch databases first and then verified against production after application. Required checks include:

- grants/RLS inspection;
- authenticated-client negative tests;
- legacy Edge Function negative tests;
- API positive-path tests;
- provider webhook verification tests where applicable;
- no accidental service-role or secret exposure.

## Exit condition

This containment document remains active until remediation gates 01-06 and 15 are complete and the final production architecture no longer depends on legacy Supabase financial authority. At that point, rewrite this file as a historical containment record and document the final hardened production access model in `docs/13_SECURITY.md`.
