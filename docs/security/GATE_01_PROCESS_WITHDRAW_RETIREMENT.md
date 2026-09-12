# Gate 01 — process-withdraw retirement evidence

## CURRENT repository baseline

- Branch: `remediation/gate-01-disable-process-withdraw`.
- Original starting commit: `97d23006a43ff0dc76b9693d1432c6dac931e2d2`; clean working tree.
- Corrected baseline: `b0c87d5445ffb80ac0fbeff58fa8ee15e0164134`.
- Canonical GitHub main inspected: `b0c87d5445ffb80ac0fbeff58fa8ee15e0164134`.
- Neither baseline contains `supabase/functions` or tracked Edge Function config.
- `git log --all --oneline -- supabase/functions` found no historical source.
  `git log --all --oneline -S process-withdraw -- .` found remediation-document
  changes on the open documentation branch, not an implementation.
- Initial repository-wide scan found no `process-withdraw`, `functions.invoke`,
  or `netlium.co` references in this checkout. Withdrawal service declarations in
  `apps/app/lib/services/withdrawal.ts` and the custody adapter in
  `packages/lib/src/custody/internal-ledger.ts` do not invoke this endpoint.
- PR #63 is documentation-only remediation work. PR #62 concerns Circle
  submission and remains untouched. Original Execution 2 ancestry was removed
  from this branch by the authorized correction, without editing Circle source.
- All Gate 01 changes were preserved in a binary patch and original committed
  state in local branch `backup/gate-01-before-ancestry-correction-20260912`.
  No user stash was applied, popped, dropped, or changed. All three existing stash
  entries were compared before/after and are identical.
- The branch was reset to the requested verified main baseline and only the six
  Gate 01 files restored. The merge base matches the requested baseline and no
  Execution 2 commits remain ahead of main. Current main has newer public-Web
  commits; the PR diff uses the merge base and contains only Gate 01 work.

## TRANSITION repository retirement

The tracked tombstone in `supabase/functions/process-withdraw/index.ts` returns
HTTP 410 and `WITHDRAWAL_ENDPOINT_RETIRED` for all requests. There are no imports,
request parsing, financial reads/writes, secret access, network calls, transaction
completion, provider execution, canonical transfer/ledger creation, or replacement
delegation. OPTIONS also returns 410; no CORS origin is granted. Historical
implementation is not copied into executable source.

The minimal function config preserves gateway JWT verification and pins the
entrypoint. CI executes retirement regression checks. Tests execute the actual
entrypoint in a Node VM with a captured `Deno.serve` callback and side-effect
traps. They cover all methods, malformed payloads, missing/invalid and synthetic
authorization, 100 repeated calls, and a request throwing on every property
access. These are handler tests, not Supabase authentication or production
proof. Source/config and app/package/CI scans guard against resurrection; they
cannot certify deployed aliases or external callers.

## CURRENT production evidence — BLOCKED

Configured MCP project reference: `ayrgojoiprxyijeshika`. Project identity still
requires authenticated confirmation before any production mutation.

The user-supplied audit states the legacy function was active with
`verify_jwt=true`, inserted a legacy transaction, decremented portfolio value,
marked it completed, and only logged payout intent. This session has not
independently inspected that deployment or its version/source.

- Supabase CLI dependency `2.109.1` rejects this Android host with
  `Unsupported platform: android`.
- No Supabase access-token environment variable, CLI stored access token, project
  link, database credential, or safe test-session credential is available in the
  inspected environment. Inspected local env files contain Vercel OIDC tokens
  only; values were not printed or used.
- `.mcp.json` configures Supabase, but `codex mcp list` reports no configured
  servers. Codex requires its TOML MCP configuration; a command-line override
  recognizes the project-scoped server without changing global configuration.
- OAuth login with that override reported success, but an independent Codex
  app-server MCP connection returned `authenticationRequired` and zero tools.
  No credential file was present. No model turn or delegated agent was started.
- A file-store OAuth retry failed with HTTP 400 during dynamic registration
  because Supabase rejected default scopes. A retry with explicit
  `projects:read,database:read,edge_functions:read,edge_functions:write` failed
  during metadata discovery with `route-aware request timed out`. No usable
  authenticated tooling or credential file resulted. No secret was pasted or
  printed, and no production function/data/configuration mutation occurred.
- No production source inspection, deployment/deletion, authenticated invocation,
  function-alias inventory, or before/after table query was performed. No
  real-money withdrawal or production data mutation was made by this execution.

| Required table        | Before  | After   | Zero mutation proven? |
| --------------------- | ------- | ------- | --------------------- |
| `transactions`        | BLOCKED | BLOCKED | No                    |
| `portfolios`          | BLOCKED | BLOCKED | No                    |
| `transfer_executions` | BLOCKED | BLOCKED | No                    |
| `ledger_journals`     | BLOCKED | BLOCKED | No                    |
| `ledger_postings`     | BLOCKED | BLOCKED | No                    |

No claim is made that any financial row changed or remained unchanged in
production. No authenticated invocation occurred in this execution.

## Executed local checks

- PASS — `node --test supabase/test/process-withdraw-retirement.test.mjs`:
  7 tests passed; captured entrypoint runtime only.
- PASS — `node --test supabase/test/*.test.mjs`: 16 tests passed.
- PASS — unauthenticated MCP reachability probe returned HTTP 401 as expected;
  this establishes reachability only, not authenticated access.
- BLOCKED — `node_modules/.bin/supabase --version` and
  `node_modules/.bin/supabase functions --help`: unsupported Android launcher.
- PASS — canonical-main fetch via authenticated GitHub HTTPS after SSH fetch
  was blocked by unavailable SSH authentication. No remote configuration changed.
- NOT RUN — native Deno/Supabase runtime test; Deno is unavailable.
- BLOCKED — deployed-source inspection, retirement, authenticated invocation,
  alternate-copy inventory, and before/after production database verification.

## Repository publication and remaining integration

Original Gate 01 commits are preserved in the backup branch. The corrected branch is based on the requested canonical-main commit and contains
only the six Gate 01 files. Its original ancestry was already published, so the
GitHub branch is to be recreated without force-pushing, after verifying its old
SHA and absence of an existing Gate 01 PR. A focused draft PR is the publication
target. Do not merge until production verification passes. PR #62 remains untouched.

- PASS — targeted Prettier checks and staged whitespace checks.
- PASS — handoff link exists and all five table evidence entries are present.
  TOML semantics are covered by the configuration regression test.

## TARGET production acceptance — pending authenticated tooling

1. Confirm project identity, enumerate deployed functions/aliases, securely
   download existing function source into an untracked evidence directory, and
   record version/config without secret or customer-data output.
2. Compare deployed source with audited legacy behavior and the tracked tombstone.
   Prefer an authenticated delete/disable operation if safely supported.
   Otherwise deploy only `process-withdraw` from the tracked tombstone, preserving
   `verify_jwt=true`. Never deploy all functions or push global config.
3. Reinspect deployment/source/config and inventory for alternate copies of the
   same legacy handler. This does not authorize retirement of other functions.
4. Capture counts and deterministic full-row fingerprints or equivalent targeted
   records for the five required tables in read-only consistent snapshots. Counts
   alone cannot detect portfolio updates. Include relevant ownership records and
   other financial tables used by a discovered alternate handler; disclose
   concurrent unrelated activity rather than attributing it to the invocation.
5. Only after retirement is confirmed, invoke using an existing nonprivileged
   authenticated test identity and harmless payload. Repeat malformed/unauthorized
   requests. Expect 410 when the tombstone runs, gateway auth rejection for
   unauthorized requests, or confirmed not-found when deleted; never withdrawal
   success/completion. Do not submit a real payout or create/fund a portfolio.
6. Repeat database checks and capture safe request IDs, timestamps, status/error
   responses, version/source hashes, and unchanged-row evidence. Verify no legacy
   transaction, portfolio decrement, completed withdrawal, canonical transfer,
   journal, or posting was produced.

Gate 01 remains **PARTIALLY COMPLETE** until production checks pass and repository
publication/integration requirements are satisfied. No later gate is authorized by this evidence record.
