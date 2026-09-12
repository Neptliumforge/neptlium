# Gate 02 — retire the placeholder crypto webhook

## Scope and authority

CURRENT — Gate 02 only, on `remediation/gate-02-disable-crypto-webhook`, starting
at verified main `db0345153d0e0a03b77d31dd47b37fa47a4fb5ad`. The initial working
tree was clean. No Gate 01 or Circle branch commits are inherited. User stashes
and PRs #62/#64 remain untouched. No later remediation is implemented.

## Authenticated production discovery

Project `ayrgojoiprxyijeshika` exposes `crypto-webhook`, ID
`ab73e252-8ab8-413e-8b19-4d6f141131ab`, version 18, ACTIVE, `verify_jwt=true`.
Authenticated Supabase MCP source inspection confirmed a single `index.ts`:
`jsr:@supabase/functions-js/edge-runtime.d.ts` type-definition import, startup
console message, JSON `{name}` parsing and default HTTP 200 JSON greeting.
Source SHA-256: `a8ebb76a824395bc5bd6fd8a2ea847aea9959778b73a6beb633b018e47ecea66`.
No provider authentication/signature verification, routing, database client,
financial access, network call, environment/secret read, inbox, settlement,
ledger or reconciliation exists in this source. JWT gateway protection does not
make a sample handler a provider ingress implementation.

No tracked reference/caller exists at baseline (`git grep` of the complete
tracked tree, including archived documentation). All nine other deployed sources
were fetched read-only; none refers/delegates to this slug or contains a Hello
placeholder. No legitimate provider integration/dependency was identified in
repository or deployed code. This is not an assertion that unrelated provider
integrations are implemented or verified.

## Retirement guard and target

TRANSITION — The repository guard rejects every method with HTTP 410,
`CRYPTO_WEBHOOK_RETIRED`, and `Cache-Control: no-store`. It does not read the
request, import dependencies, inspect secrets, access a database or call a
network. Keep the slug absent from production; do not deploy the guard merely
for testing. Minimal configuration pins the guard with JWT verification retained
and must not be pushed as complete project configuration.

TARGET — Provider events use official provider authentication, governed Neptlium
API ingress, provider inbox, idempotent claim, domain transitions, settlement
evidence, canonical ledger and reconciliation. This gate implements none of that
replacement architecture.

## Production retirement — PASS

The existing protected official Supabase OAuth session successfully authenticated
MCP initialize, tools discovery, source/inventory reads, SQL reads and Management
API calls (HTTP 200). Credentials were read internally and sent through curl
configuration stdin; never printed or committed. Native Codex MCP remains
unnecessary for this supported authenticated route. Temporary credentials stay
mode 0600 inside a mode 0700 directory.

The official Management API DELETE was sent only to
`/v1/projects/ayrgojoiprxyijeshika/functions/crypto-webhook` after checking the
exact ID/slug/version against authenticated source and immediate inventory.
It returned HTTP 200. Subsequent authenticated GETs returned HTTP 404. The
function is absent; there is no after-deployment version and no tombstone was
deployed to production. JWT verification was not changed or weakened.

[Official supported removal reference](https://supabase.com/docs/reference/api/v1-delete-a-function).
The Supabase changelog index was fetched and relevant breaking-change entries
reviewed; none changes this function-deletion route.

| Function                  | Before version | After version |
| ------------------------- | -------------- | ------------- |
| `allocate-portfolio`      | 18             | 18            |
| `calculate-risk-score`    | 18             | 18            |
| `calculate-yield`         | 18             | 18            |
| `create-checkout-session` | 21             | 21            |
| `crypto-webhook`          | 18             | Absent        |
| `market-signal-engine`    | 22             | 22            |
| `noop-check`              | 2              | 2             |
| `process-deposit`         | 21             | 21            |
| `stripe-webhook`          | 21             | 21            |
| `whale-signal-engine`     | 18             | 18            |

Inventory count: 10 before, 9 after. Complete metadata for all nine remaining
functions matched, not just their versions. No other function was removed,
deployed, modified or invoked. The previously removed withdrawal slug remains
absent. No migration, provider, identity, Vercel or production-data mutation was
performed.

## Safe negative invocations — PASS

Requests were sent only after authenticated removal/inventory confirmation to
`https://ayrgojoiprxyijeshika.supabase.co/functions/v1/crypto-webhook`.
No real identity, provider credential/signature, money or legitimate event was
used. The unique harmless request marker was:

`gate02-retirement-324e8b6c-15c0-47c1-abc7-f0184d76deb4`.

| Request                                                                    | Status | Body category |
| -------------------------------------------------------------------------- | ------ | ------------- |
| Normal synthetic POST (`name` plus marker)                                 | 404    | NOT_FOUND     |
| Repeated identical POST                                                    | 404    | NOT_FOUND     |
| Malformed JSON POST (`{`)                                                  | 404    | NOT_FOUND     |
| Fake `gate02.synthetic.invalid` event with invalid synthetic authorization | 404    | NOT_FOUND     |
| OPTIONS                                                                    | 404    | NOT_FOUND     |

Every response body was
`{"code":"NOT_FOUND","message":"Requested function was not found"}`.
No 2xx acknowledgement, greeting, acceptance or successful provider state was
returned. No provider event was accepted or execution triggered.

## Zero-mutation evidence — PASS

All twelve tables were discovered in `public` through a read-only catalog query.
Each evidence snapshot was one SELECT statement returning database observation
time, row counts and deterministic sorted whole-row fingerprints. No marker row
was persisted. The snapshot expression for each table was:

```sql
md5(coalesce(string_agg(md5(to_jsonb(t)::text), ''
  order by md5(to_jsonb(t)::text)), ''))
```

Database snapshot times on 2026-09-12 (UTC):

- Before retirement: `2026-09-12 16:39:01.323562+00`.
- Immediately before negative invocations: `2026-09-12 16:39:45.883661+00`.
- Immediately after negative invocations: `2026-09-12 16:39:56.940458+00`.

The Termux client clock differs from the database clock. The proof uses
sequential command ordering (before SELECT, five requests, after SELECT), not
an assumed timestamp window across clocks.

| Table                       | Before rows | After rows | Before/after fingerprint (identical) |
| --------------------------- | ----------- | ---------- | ------------------------------------ |
| `funding_intents`           | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `ledger_journals`           | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `ledger_postings`           | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `portfolios`                | 16          | 16         | `7620ba39d1ac889d9ee441dc6a83c0e3`   |
| `provider_references`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `provider_webhook_inbox`    | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `reconciliation_items`      | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `reconciliation_runs`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `settlement_evidence`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `transactions`              | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `transfer_execution_events` | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |
| `transfer_executions`       | 0           | 0          | `d41d8cd98f00b204e9800998ecf8427e`   |

All counts/fingerprints also match the pre-retirement snapshot. No row or
financial value changed in any compared table. No inbox event, provider
reference, settlement evidence, transfer event/execution, funding intent,
legacy transaction, portfolio balance mutation, ledger state or reconciliation
state was created by verification.

## Remaining deployed-source inspection — PASS

All nine remaining function sources were fetched read-only before retirement
and again afterward. Their content hashes matched, and no crypto-webhook slug,
crypto_webhook/cryptoWebhook alias, Hello placeholder, alternate sample webhook
or delegation was found. This review does not certify unrelated financial
functions or change their behavior. In particular, existing Stripe ingress is
not a copy of this crypto placeholder. The inspected functions are the nine
unchanged functions in the inventory above.

## Meaningful repository references

The baseline tracked-tree scan returned no matches. Remaining references are
only deliberate retirement guards/evidence:

- `supabase/functions/crypto-webhook/index.ts`: fail-closed guard; do not deploy.
- `supabase/config.toml`: pins that guard and retains JWT verification.
- `supabase/test/crypto-webhook-retirement.test.mjs`: regression coverage and
  application/CI caller scan.
- `supabase/README.md`: retirement prohibition, configuration scope and evidence.
- This evidence document: historical production discovery, removal and results.

No application/shared-package caller required removal or rerouting. The CI
workflow invokes the generic retirement-test glob, not the endpoint or deploy
command. No production dependency was identified in repository/deployed sources.

## Repository validation and unrelated Web failure

- PASS — `node --test supabase/test/crypto-webhook-retirement.test.mjs`: 7/7.
- PASS — `node --test supabase/test/*.test.mjs`: 16/16.
- PASS — targeted Prettier, `git diff --check`, reference, ancestry, scope and
  stash-preservation checks.
- FAIL — `pnpm --filter @neptlium/web test` on the Gate 02 branch: 56/58.
- FAIL — the same command in detached current-main worktree at `db034515`: 56/58,
  exactly the same two assertions.

The failures are `marketing-shell.test.mjs:51` (expects `aria-modal="true"` in
`site-header.tsx`) and `production-hardening.test.ts:43` (expects body scroll
locking there). Main moved these behaviors into `mobile-navigation.tsx`, while
those assertions inspect only the header. Web/UI/dependency files are identical
to main (`git diff --exit-code origin/main -- apps/web packages/ui package.json
pnpm-lock.yaml pnpm-workspace.yaml`). Gate 02 only adds an independent retirement
CI job; the web job is unchanged. No unrelated code/test was changed or hidden.

An initial Gate 02 static assertion failed after Prettier inserted whitespace
between `Deno.serve(` and the callback. The assertion now allows whitespace while
still requiring a parameterless callback; all side-effect and behavior checks
remain intact. Final suites pass. The SQL evidence reader initially failed to
parse the MCP untrusted-data wrapper; the read-only SQL succeeded, its captured
result was safely parsed, and matching snapshots were verified. Neither local
issue required any additional production mutation.

NOT RUN — native Deno execution: removal, rather than production handler
deployment, was used. Node VM tests execute the actual dependency-free source.
CI publication/results are recorded in the draft PR; unrelated web failures do
not establish a retirement defect.

## Gate 02 verdict

COMPLETE once the isolated branch is published in its own draft PR and retirement
CI is verified: production source was a placeholder, no legitimate caller or
alternate deployed copy was found, only the target slug was removed, all five
negative requests were NOT_FOUND, all twelve table fingerprints match, and the
anti-resurrection guard/tests are prepared. This does not claim canonical-main
integration, provider readiness or any later gate. The draft must not be merged.
