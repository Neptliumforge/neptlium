# Gate 05 — Legacy Financial Mutation Authority Inventory

Audit baseline: production + repository `main` after Gate 04 closure. Gate 05 is limited to mutation authority; Gate 06 owns client-flow redesign after direct authority is removed.

## Discovery scope

Inspected: `apps/api`, `apps/app`, `apps/admin`, `packages/lib`, Supabase migrations/tests/functions, live `pg_proc`, `pg_policies`, role grants, triggers, `cron.job`, installed extensions, deployed Edge Functions, Stripe/Circle/Alchemy integrations, admin server actions, and legacy custody helpers.

## Mutation authority matrix

| ID | Path / function / route | Runtime / caller | Authentication / authorization | Provider | Tables / state mutated | Ledger effect | Canonical effect | Classification | Severity | Decision / remediation | Verification |
|---|---|---|---|---|---|---|---|---|---|---|---|
| G05-01 | `POST /v1/funding/intents` → financial repository | API / customer | Bearer principal + server validation + idempotency | none | `funding_intents` through governed repository/RPC | none at intent creation | creates governed funding intent only | A CANONICAL GOVERNED AUTHORITY | LOW | retain | API tests + service-role-only DB authority |
| G05-02 | `advance_funding_operational_state` | Postgres / API service | SECURITY DEFINER; execute `service_role` only | none | `funding_intents` | none directly | governed lifecycle transition | A | LOW | retain | live ACL inspected |
| G05-03 | `mark_funding_provider_confirmed` | Postgres / orchestrator | SECURITY DEFINER; `service_role` only | provider evidence | funding lifecycle | no availability | provider confirmation only | C EVIDENCE INGESTION | LOW | retain | live ACL inspected |
| G05-04 | `post_confirmed_funding_to_pending` + `post_balanced_journal` | Postgres / governed backend | SECURITY DEFINER; `service_role` only | none | ledger journals/postings, pending funding state | balanced journal required | canonical pending state | A | LOW | retain | live ACL + ledger tests |
| G05-05 | `mark_funding_reconciled` / `make_reconciled_funding_available` | Postgres / reconciliation | SECURITY DEFINER; `service_role` only | none | funding + ledger availability | governed ledger transition | availability only after reconciliation | D RECONCILIATION | LOW | retain | live ACL inspected |
| G05-06 | Stripe `/v1/webhooks/stripe` → `provider_webhook_inbox` | API / provider | raw-body signature verification | Stripe | inbox; subscription state only for supported subscription events | no capital ledger effect | payment-mode capital event is ignored | C | LOW | retain | Gate 04 production proof |
| G05-07 | Alchemy `/v1/webhooks/alchemy` → inbox | API / provider | HMAC signature | Alchemy | `provider_webhook_inbox` | none at ingress | observation only | C | LOW | retain | source/test inspection |
| G05-08 | Circle webhook route | API / provider | disabled pending reviewed verifier | Circle | none | none | none | F LEGACY/NOT ACTIVE | LOW | retain fail-closed until Gate 08 | route returns provider-not-configured |
| G05-09 | `reserve_transfer_capital` | Postgres / API service | SECURITY DEFINER; `service_role` only | none | `capital_reservations`, transfer state | reservation accounting | reserves only | A | LOW | retain | live ACL inspected |
| G05-10 | `mark_transfer_pending_approval`, `approve_transfer_execution` | Postgres / governed admin/API | SECURITY DEFINER; `service_role` only; admin checks in API | none | transfer lifecycle | no settlement | approval lifecycle only | A / E ADMIN GOVERNED CORRECTION | LOW | retain | admin authority tests |
| G05-11 | `mark_transfer_submitted` | Postgres / orchestrator | SECURITY DEFINER; `service_role` only | Circle later | transfer lifecycle/provider refs | no settlement | submitted state only | B ORCHESTRATION ONLY | LOW | retain; outbound activation belongs Gate 07 | live ACL + tests |
| G05-12 | `mark_transfer_provider_settled`, `settle_reserved_transfer`, `mark_transfer_reconciled`, `release_transfer_reservation` | Postgres / governed backend | SECURITY DEFINER; `service_role` only | evidence-driven | transfers, reservations, ledger/reconciliation | balanced/evidence-gated | canonical settlement/reconciliation | A / D | LOW | retain | live ACL + lifecycle tests |
| G05-13 | allocation create/update/model/plan RPC family | Postgres / API | SECURITY DEFINER; `service_role` only | none | `allocation_*` | none until execution | modeled/authorized state | A | LOW | retain | live ACL inspected |
| G05-14 | `allocation_authorize_policy`, `allocation_authorize_plan`, `allocation_record_decision`, `allocation_cancel_plan` | Postgres / API/admin | SECURITY DEFINER; `service_role` only | none | allocation state/history | none | governed decision state | A / E | LOW | retain | live ACL inspected |
| G05-15 | `/v1/allocation/*` | API / customer/admin | authenticated principal; validated commands | none | governed allocation RPCs | no direct ledger bypass | modeled/authorized state only | A | LOW | retain | route/source tests |
| G05-16 | legacy Supabase `allocate-portfolio` | Edge Function / authenticated browser | JWT, then service-role DB client; user-controlled amount/strategy | none | directly updates `portfolios`, replaces strategies, upserts `holdings`, writes rebalance events | none | **yes — directly manufactures portfolio state/value** | F LEGACY — RETIRE / G DUPLICATE | CRITICAL | replace with deterministic 410 tombstone | deployed source inspected; tombstone source + production verification required |
| G05-17 | legacy Supabase `calculate-yield` | Edge Function / scheduler | service-role DB client | none | inserts synthetic yields; increments `portfolios.total_value` | none | **yes — manufactures portfolio value** | F LEGACY — RETIRE | CRITICAL | replace with deterministic 410 tombstone | deployed source inspected; tombstone source + production verification required |
| G05-18 | pg_cron `calculate-yield-daily` | Postgres scheduler | scheduled HTTP call using embedded privileged bearer credential | none | invokes G05-17 | none | yes indirectly | F LEGACY — RETIRE | CRITICAL | unschedule by job name; remove active path | live `cron.job` inspected |
| G05-19 | RLS policy `User can create transaction` | Postgres / authenticated browser | browser JWT; `sender_id = auth.uid()` | none | direct INSERT `transactions` | none | **yes — browser can create canonical transaction row** | H UNSAFE CLIENT AUTHORITY | CRITICAL | drop policy and revoke INSERT/UPDATE/DELETE from anon/authenticated | live policy/grants inspected |
| G05-20 | RLS policy `portfolios_update_own` | Postgres / authenticated browser | browser JWT; own row | none | direct UPDATE `portfolios` | none | **yes — browser can mutate portfolio truth** | H UNSAFE CLIENT AUTHORITY | CRITICAL | drop policy and revoke INSERT/UPDATE/DELETE from anon/authenticated | live policy/grants inspected |
| G05-21 | `holdings_select_own` | Postgres / browser | RLS SELECT only | none | none | none | read projection only | A (READ ONLY) | LOW | retain | live policy inspected |
| G05-22 | `subscriptions_select_own` | Postgres / browser | RLS SELECT only | Stripe evidence upstream | none | none | read projection only | A (READ ONLY) | LOW | retain | live policy inspected |
| G05-23 | `create-checkout-session` Edge Function | Edge Function / authenticated customer | JWT + customer identity | Stripe | creates Stripe subscription Checkout session; does not settle capital | none | provider orchestration only | B ORCHESTRATION ONLY | MEDIUM | retain; must not be treated as capital funding | deployed source inspected |
| G05-24 | `stripe-webhook` Edge Function v22 | Supabase Edge | verify_jwt; inert | Stripe | none | none | none | F TOMBSTONE | LOW | retain 410 tombstone | v22 hash verified in Gate 04 |
| G05-25 | `calculate-risk-score` Edge Function | Edge Function / authenticated caller | JWT; service-role client internally | none | writes `risk_scores` analytics | none | no canonical money/position mutation | B / ACTIVE NON-FINANCIAL | MEDIUM | retain; financial-adjacent analytics only | deployed source inspected |
| G05-26 | `market-signal-engine` Edge Function | Edge Function / scheduler | service-role client internally | external market data | `market_signals` | none | no canonical financial truth | ACTIVE NON-FINANCIAL | MEDIUM | retain; separate secret-management hardening recommended | deployed source inspected |
| G05-27 | `whale-signal-engine` Edge Function | Edge Function / scheduler | service-role client internally | market/chain data | signal tables | none | no canonical financial truth | ACTIVE NON-FINANCIAL | MEDIUM | retain | deployed source inspected |
| G05-28 | `noop-check` Edge Function | Edge Function | JWT | none | none | none | none | ACTIVE NON-FINANCIAL | LOW | retain | deployed source inspected |
| G05-29 | `request_wallet_withdrawal` | Postgres legacy RPC | no callable app role; ACL `postgres` only | none | historical wallet transaction model | historical | blocked from runtime callers | F LEGACY — RESTRICTED | LOW | retain history; execute remains revoked | live ACL inspected |
| G05-30 | `contained_request_wallet_withdrawal` | Postgres legacy helper | ACL `postgres` only | none | legacy wallet model | historical | unavailable to runtime roles | F LEGACY — RESTRICTED | LOW | retain history | live ACL inspected |
| G05-31 | legacy provider-wallet routes | API | authenticated then deterministic 410 | legacy provider wallet | none | none | none | F TOMBSTONE | LOW | retain | app route source/tests |
| G05-32 | admin deposit completion route | API / admin | admin auth + audit | none | none; fail-closed | none | cannot complete deposit | F TOMBSTONE / E audited rejection | LOW | retain | admin tests + source |
| G05-33 | admin allocation approval/rejection | Admin server action → API | admin session + API authorization + idempotency | none | governed allocation decision | none | approval only, execution unavailable | E ADMIN GOVERNED CORRECTION | LOW | retain | source/tests |
| G05-34 | treasury destination RPC family | Postgres / authenticated admin | SECURITY DEFINER but calls `assert_treasury_super_admin`; principal bound to current Clerk identity | none | treasury destination/challenge state | none | operational destination authority only | E | LOW | retain | live function definitions inspected |
| G05-35 | `post_balanced_journal` | Postgres / service backend | SECURITY DEFINER; `service_role` only; validates ownership/assets and balance | none | `ledger_journals`, `ledger_postings` | canonical ledger authority | yes | A | LOW | retain as sole journal posting primitive | live ACL + append-only triggers |
| G05-36 | reconciliation RPC/lifecycle family | Postgres / backend | `service_role` only | provider/chain evidence | `reconciliation_runs/items`, lifecycle states | may authorize final availability only through governed functions | reconciliation authority | D | LOW | retain | grants/function audit |
| G05-37 | portfolio creation trigger `handle_new_portfolio` | Postgres trigger | fires only after portfolio INSERT | none | creates default portfolio strategy | none | derivative initialization, not independent value authority | A DERIVATIVE | LOW | retain; direct browser portfolio write authority removed separately | trigger/function audit |
| G05-38 | environment/invariant trigger functions | Postgres triggers | database invariant | none | validation only | none | cannot originate state | A INVARIANT | LOW | retain | trigger audit |
| G05-39 | `packages/lib` legacy internal-ledger withdrawal RPC client | library / historical caller | would call `request_wallet_withdrawal` | none | RPC currently execution-revoked | historical | no production authority because DB denies execute | F LEGACY — RESTRICTED | LOW | leave for Gate 06/code cleanup if still referenced; DB boundary is closed | source + live ACL |

## Service-role inventory

- `apps/api` durable repositories use `SUPABASE_SERVICE_ROLE_KEY` only behind authenticated API/server boundaries and governed RPCs/repository methods. Retain.
- Stripe/Alchemy ingress uses service role to persist verified provider evidence and backend-only processing state. Retain.
- Allocation repository uses service role to call allocation SECURITY DEFINER RPCs. Retain.
- Legacy deployed `allocate-portfolio` and `calculate-yield` used service role for direct canonical writes. Retire.
- `market-signal-engine`, `whale-signal-engine`, and `calculate-risk-score` use service role for non-canonical analytics. Retain with explicit classification; no canonical balance/ledger/settlement writes found.
- Active cron definitions were inspected. `calculate-yield-daily` is a financial bypass and is removed. A market-signal cron also embeds a privileged bearer credential; it is non-financial but should be migrated to safer secret delivery in a dedicated security task. No financial canonical mutation was found in that function.

## Browser/client authority

Production RLS inspection found only two browser-write authorities in the protected financial set: direct transaction INSERT and own-portfolio UPDATE. Both are removed by the Gate 05 forward migration. Holdings and subscriptions remain SELECT-only. Full client call-site redesign belongs to Gate 06; after Gate 05, the database no longer accepts those direct canonical writes even from a modified client.

## Database-side authority

Live production inspection covered SECURITY DEFINER routines, ACLs, triggers, RLS policies, table grants, pg_cron, and network-capable scheduling. Privileged financial SECURITY DEFINER routines that remain are execute-limited to `service_role`, except treasury destination routines which perform internal `super_admin` authorization tied to the active principal.

No UNKNOWN financial mutation authority remains in the inspected production surface.

# Canonical Financial Authority Map

## Funding
Intent authority: authenticated `/v1/funding/intents` → governed financial repository/RPC.
Provider orchestration: capability-gated server orchestration only.
Evidence: signed provider ingress → `provider_webhook_inbox` / settlement evidence.
Ledger: `post_balanced_journal` + funding lifecycle RPCs.
Reconciliation: funding reconciliation RPCs before availability.
Retired competing paths: Stripe capital payment path, legacy deposit processors, browser transaction INSERT.

## Withdrawals
Intent authority: governed transfer/withdrawal command path only; live execution remains closed pending later gate.
Provider orchestration: server-side only; no browser provider credentials.
Evidence: provider settlement evidence.
Ledger: reservation + governed settlement journal.
Reconciliation: transfer reconciliation lifecycle.
Retired competing paths: historical wallet withdrawal RPCs are execution-revoked; provider-wallet routes are 410.

## Transfers
Intent authority: authenticated API transfer request, currently gated closed where live execution is not activated.
Provider orchestration: governed backend; Circle completion belongs Gate 07.
Evidence: provider references + settlement evidence.
Ledger: reservation and settlement RPCs.
Reconciliation: explicit transfer reconciliation.
Retired competing paths: direct legacy wallet/provider routes.

## Portfolio
Execution authority: no independent legacy portfolio executor after Gate 05; allocation execution remains governed/closed until activated.
Evidence: governed allocation/provider evidence only.
Position authority: canonical ledger/evidence-derived projections, not browser writes.
Valuation authority: no synthetic yield increment after Gate 05.
Reconciliation: governed financial/reconciliation layer.
Retired competing paths: `allocate-portfolio`, `calculate-yield`, browser `portfolios` UPDATE.

## Allocation
Decision authority: allocation RPC family.
Approval authority: governed API/admin → service-role-only SECURITY DEFINER RPCs.
Reservation authority: governed financial reservation functions.
Execution authority: explicit execution state; client/admin UI cannot manufacture execution.
Reconciliation: separate reconciliation state.
Retired competing paths: legacy `allocate-portfolio` direct holdings/portfolio writer.

## Subscriptions / Payments
Intent authority: authenticated Stripe Checkout session orchestration.
Provider evidence: canonical Stripe webhook ingress for supported subscription events.
Canonical state authority: server webhook handler updates subscription state; Stripe payment-mode Checkout does not fund capital.
Retired competing paths: legacy Stripe capital-payment authority remains tombstoned/ignored.

# Gate 05 Remediation

## Removed
- Browser RLS transaction INSERT authority.
- Browser portfolio UPDATE authority.
- Active `calculate-yield-daily` schedule.

## Tombstoned
- Supabase Edge `allocate-portfolio`.
- Supabase Edge `calculate-yield`.
- Existing Stripe legacy webhook tombstone retained.

## Permission Revoked
- `anon`, `authenticated`: INSERT/UPDATE/DELETE on `transactions`.
- `anon`, `authenticated`: INSERT/UPDATE/DELETE on `portfolios`.

## Consolidated
- Portfolio/allocation truth is restricted to governed server/RPC architecture; production-only legacy Edge authorities are removed.

## Client Authority Identified for Gate 06
- Historical client/library code referencing legacy wallet withdrawal RPC should be removed/replaced at Gate 06 if still reachable in a browser bundle; DB execute authority is already closed.
- Any UI that previously assumed direct transaction or portfolio writes must use authenticated API commands; Gate 05 closes the DB write boundary, Gate 06 completes client-flow cleanup.

## Safe Existing Paths Retained
- Governed funding, transfer lifecycle, balanced ledger, reconciliation and allocation RPCs.
- Provider evidence inbox routes.
- Governed admin approval paths.
- Non-financial analytics Edge Functions.

## Tests Added
- `supabase/test/gate05-legacy-authority-retirement.test.mjs` locks tombstones, RLS/grant retirement and cron retirement source contract.

## Database Grants Verified
anon: no intended canonical financial writes after migration.
authenticated: read projections and explicitly internally-authorized admin RPCs only; no direct canonical transaction/portfolio writes after migration.
service_role: retained for trusted backend repositories and narrowly governed SECURITY DEFINER RPCs.
privileged RPCs: financial mutation RPCs are `service_role` only; treasury destination RPCs perform internal super-admin authorization.
