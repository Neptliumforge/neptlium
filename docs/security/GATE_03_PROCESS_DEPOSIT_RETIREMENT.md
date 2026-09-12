# Gate 03 — retire legacy process-deposit authority

## Baseline and decision

CURRENT — Gate 03 starts at main `75bd507982e6b176989eef759710562449814ec0`
on `remediation/gate-03-retire-process-deposit`, with a clean tree, unchanged user
stashes, and no Gate 01/02 or Circle commits ahead of main. PRs #62/#64/#65 are
untouched. This gate neither recreates retired functions nor implements Gate 04.

Authenticated deployed source inspection: process-deposit ID
`1bd46da1-df1b-4360-b47f-67ecabb08c52`, v21 ACTIVE, JWT verification true.
Source SHA256 `bf71a4fc417015983f5ad84bbf32ef3ef6d9a44ddc28e6ebb437b0d30b0947d1`.
Imports: Deno std HTTP server 0.177.0, supabase-js@2, stripe@14 target=deno.
Environment names: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY.
Uses a privileged Supabase client and Stripe API 2024-04-10 via fetch HTTP client.
Reads transactions by stripe_session_id and portfolios by user_id. Writes
transactions (insert/update completed; update failed for unpaid sessions) and
portfolios (read-modify-write total_value increment). The code checks only that
an Authorization header exists; despite its comment it validates no internal
secret/caller. Gateway verify_jwt is a separate protection, not authorization.
OPTIONS returns 200; missing auth 401, missing inputs 400, unpaid 402, metadata
mismatch 403, missing portfolio 404, persistence/internal failures 500. Success
200 returns success/transaction_id/amount_deposited/new_portfolio_value;
already-completed sessions return success/idempotent. CORS names netlium.co.

Stripe paid status and matching supplied metadata user_id are sufficient for
legacy completed credit; no funding intent, route, provider inbox/reference,
settlement evidence, ledger or reconciliation is required. The transaction and
portfolio changes are separate requests, not atomic; the atomic-increment
comment is inaccurate. No paid session or real payment was invoked.

The complete tracked-tree reference scan (including archive) found no caller.
App deposit redirects to capital-account#funding; its actions/services call
Neptlium API funding intent/deposit-instruction routes, not Edge Functions.
Repository Stripe funding is evidence-only, not a required launch rail.
Deployed create-checkout-session creates subscription-mode sessions and updates
subscriptions/profile-backed customer details; it never calls process-deposit.
The process-deposit comment claiming stripe-webhook calls it is historical
commentary contradicted by the actual webhook source. All eight other deployed
sources were inspected and contain no slug/alias/delegate.

Retirement decision: YES. No irreplaceable legitimate dependency was identified;
unknown direct consumers will receive unavailable, never a false credit. No
caller replacement is introduced. Stripe-webhook independently contains paid
checkout legacy transaction/portfolio credit and pending completion. This is
an event/signature-based handler, not a process-deposit delegate or exact copy
of its session-retrieval endpoint; per gate scope this is a Gate 04 dependency,
not repaired here. The subscription flow does not depend on process-deposit.

TRANSITION — Repository guard rejects every method with 410
DEPOSIT_ENDPOINT_RETIRED without parsing or clients/network/secrets. JWT retained.
Keep the slug absent; never bulk deploy or push minimal config globally.
TARGET — governed API funding, provider evidence, settlement, canonical ledger
and reconciliation. This gate does not implement that replacement.

## Evidence

Production retirement and verification PASS. The protected existing official
Supabase OAuth session authenticated source/inventory/SQL reads and Management
API deletion. Credentials stayed internal to curl configuration stdin, never
printed or committed (credential file 0600, directory 0700).

Only `/v1/projects/ayrgojoiprxyijeshika/functions/process-deposit` was deleted
through the [supported Management API](https://supabase.com/docs/reference/api/v1-delete-a-function),
after authenticated GET confirmed exact ID/slug/v21/JWT=true and immediate
inventory. DELETE returned 200; repeated authenticated GETs returned 404.
Before inventory: nine functions; afterward: eight. The target no longer exists,
has no after-deployment version, and JWT verification was not altered. All other
function metadata/source hashes match. No other production mutation occurred.
No tombstone was deployed and no real paid session, customer credential or money
was used. Previously retired withdrawal/crypto functions remain absent.

| Safe negative request                | HTTP | Body      |
| ------------------------------------ | ---- | --------- |
| Synthetic session POST               | 404  | NOT_FOUND |
| Repeated POST                        | 404  | NOT_FOUND |
| Malformed JSON POST                  | 404  | NOT_FOUND |
| Invalid synthetic authorization POST | 404  | NOT_FOUND |
| OPTIONS                              | 404  | NOT_FOUND |

Every body: `{"code":"NOT_FOUND","message":"Requested function was not found"}`.
No 2xx deposit success, completed state or provider execution was produced.

Marker: `gate03-retirement-c56defb7-89f1-45d4-8d81-f3a6d7276ef3`.

## Zero-mutation evidence — PASS

Each snapshot is a single read-only SELECT over all compared public tables,
using row count and deterministic whole-row fingerprint:

```sql
md5(coalesce(string_agg(md5(to_jsonb(t)::text), ''
  order by md5(to_jsonb(t)::text)), ''))
```

No marker row was written. Database UTC observation times on 2026-09-12:

- Before retirement: `2026-09-12 16:54:50.572998+00`.
- Before requests: `2026-09-12 16:55:47.376926+00`.
- After requests: `2026-09-12 16:55:56.755081+00`.

The Termux clock differs from the DB clock; sequential execution brackets the
requests, without assuming a cross-clock timestamp window.

| Table                       | Before rows | After rows | Identical before/after fingerprint |
| --------------------------- | ----------- | ---------- | ---------------------------------- |
| `deposit_routes`            | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `funding_intents`           | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `ledger_journals`           | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `ledger_postings`           | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `portfolios`                | 16          | 16         | `7620ba39d1ac889d9ee441dc6a83c0e3` |
| `provider_references`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `provider_webhook_inbox`    | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `reconciliation_items`      | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `reconciliation_runs`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `settlement_evidence`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `transactions`              | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `transfer_execution_events` | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `transfer_executions`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |
| `wallet_transactions`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e` |

All results also match the pre-retirement snapshot. No row or financial value
changed in any compared table. Extra wallet_transactions and transfer event/state
tables were included. Catalog inspection found no deployed wallet_deposits or
provider_webhook_events table; those documentation-era names are not assumed to
be live. All required tables were present and checked.

## Alternate paths — PASS for Gate 03

All eight remaining sources were fetched before and after deletion; joined
source hashes and complete metadata match. No process-deposit call, alias,
copy, or equivalent session-retrieval deposit endpoint remains. Stripe's distinct
signed event credit path is explicitly deferred to Gate 04, not certified safe.
No other deployed source completes a paid deposit or increments a portfolio
after a payment. No other deployed function was invoked or changed.

| Remaining function        | Version | Unchanged source SHA256                                            |
| ------------------------- | ------- | ------------------------------------------------------------------ |
| `allocate-portfolio`      | 18      | `16b472cc2d3d58a2bfa764bafd49e1a960f753fc7bd6109f299bb2eefff78faf` |
| `calculate-risk-score`    | 18      | `9394ac54484e4b35083e4ec76e02f5e6a8a4dfe0252ff3513fd1a137f6455574` |
| `calculate-yield`         | 18      | `5bf9c1a046e419fac718ba9dc914872ab0767defedb9f67d4c82a529eb413b92` |
| `create-checkout-session` | 21      | `d3c52a9ca35dce6b3a63b24860ef425231e541528897f9ae16127e570ce56edd` |
| `market-signal-engine`    | 22      | `2199959fe452c09ee838ca742c77980088a3359e305c8c4268bff65fdb614fd7` |
| `noop-check`              | 2       | `ef12a5921dcf723fc17cc9987046fc54590e6325810657eb8d7ae1cf74a3ca28` |
| `stripe-webhook`          | 21      | `a0454d0adec82bd81e08e0c7965ff0709fd233ad51253b9ca51e2f60b2e238d5` |
| `whale-signal-engine`     | 18      | `e18854655235131487eeb774ae67b84384556e6293258e40ba916bdb6b1f068b` |

## Reference dispositions

No tracked baseline process-deposit name/alias/reference exists, including
archive. App/Web/Admin/packages contain no Supabase invocation of this endpoint.
Meaningful related paths inspected:

- App dashboard/deposit redirect and capital-account actions/view/API financial
  service: active governed API caller, independent of the retired slug.
- API financial-routes/operations/funding-domain and Stripe verifier: existing
  API funding/evidence code, independent; no implementation change here.
- Deployed create-checkout-session: active subscription checkout, no delegate.
- Deployed stripe-webhook: independent event processing/direct legacy credit;
  later-gate dependency (Gate 04), unchanged.
- Deployed process-deposit's claim that Stripe invokes it: historical comment,
  not executable delegation, contradicted by actual source.
- New guard/config/test/README/this record: intentional fail-closed retirement
  references; no caller rerouting or replacement provider flow.

A read-only unauthenticated GET to app.neptlium.com/dashboard/capital-account
returned 404. This is not authenticated customer funding verification; no UI
funding command was executed. The no-dependency decision rests on inspected
caller implementations and deployed source, not that HTTP result alone.

## Local validation and main comparison

PASS — seven Gate 03 retirement tests; all sixteen Supabase tests; targeted
Prettier; TOML/configuration checks; diff whitespace, caller, ancestry and
stash-preservation checks. Native Deno execution NOT RUN: supported removal
was used; Node VM tests execute the actual dependency-free guard.

FAIL — `pnpm --filter @neptlium/web test` on Gate 03: 44/55, eleven failures.
Current main 75bd507 advanced since Gate 02's two-failure baseline. The isolated
main worktree reproduced exactly the same eleven tests using
`pnpm --config.verify-deps-before-run=false --filter @neptlium/web test` (44/55).
The option disables automatic dependency installation only, not tests. Its
first unmodified invocation was BLOCKED by pnpm's non-TTY modules-purge check;
no dependency directory was purged. Web/UI/dependency inputs are identical to
main, and validate-web is unchanged. No unrelated code/test was changed.

Exact identical failures:

- homepage renders one authoritative product entry in the hero.
- current landing layer preserves the canonical capital-operating hero.
- current landing layer remains image-independent and ordered after the canonical visual system.
- hero architecture presents governed relationships rather than a dashboard simulation.
- canonical product pages are authored independently rather than through FoundationPage.
- hero establishes a concise capital-operating proposition and governed entry.
- homepage connects the operating architecture without fabricated proof.
- navigation remains five canonical accessible domains.
- homepage credibility is architectural rather than synthetic scale proof.
- production public Web keeps a single institutional hero and operating architecture.
- production shell preserves responsive, reduced-motion and safe-area hardening.

These source-contract failures follow independent main marketing/header changes,
including the known aria-modal and body-scroll-lock header-only assertions.
They are not retirement failures. CI publication/results are maintained in the
new draft PR. Required retirement tests must pass before final completion.

## Final publication and verdict

[Draft PR #66](https://github.com/Neptliumforge/neptlium/pull/66) targets main
and contains only the six Gate 03 files. Implementation/evidence commit:
`ceb3d69643109b8d2060151833abc23fdc8926ed`. No earlier remediation branch
commits are ahead of main. Working tree/stashes and PRs #62/#64/#65 were preserved.

[Actions run 34706794500](https://github.com/Neptliumforge/neptlium/actions/runs/34706794500)
passed retirement validation (7/7), UI/Web typecheck and lint. Web tests failed
exactly the eleven independently reproduced main assertions (44/55); build was
NOT RUN. It tested a merge with newer main
`e36ab03f1663afafe5f7bea05d1749dd50c2b54f`. A fresh fetch and isolated worktree
at that exact main SHA reproduced the identical eleven failures. Main's changes
since the Gate 03 starting SHA affect only platform/products marketing pages;
its full tracked caller scan remains empty. No Gate 03-specific CI defect was
found. Documentation-only final-head check results are recorded in the PR.

Gate 03 COMPLETE: the specific legacy command authority is absent/non-callable;
its real behavior and dependencies were inspected; no irreplaceable legitimate
caller was found; all five harmless negative requests returned NOT_FOUND; all
fourteen table counts/fingerprints match; no alternate copy/delegate remains;
the isolated guard/tests are published with passing retirement CI. The separate
signed-event Stripe direct-credit path is explicitly Gate 04's responsibility
and has not been changed, enabled, invoked or certified here. PR #66 stays draft
and unmerged. No canonical-main integration or platform readiness is claimed.
No Gate 04 implementation was started.
