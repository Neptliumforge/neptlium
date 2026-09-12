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

## CURRENT production retirement — PASS

Project identity was confirmed through authenticated project-scoped MCP:
`https://ayrgojoiprxyijeshika.supabase.co`, reference `ayrgojoiprxyijeshika`.

The deployed legacy function was independently downloaded and inspected:

- Slug: `process-withdraw`; ID: `407b75b6-22e3-4474-a5f5-fb65b4eb08fb`.
- Before: ACTIVE, version 21, `verify_jwt=true`.
- Source SHA-256: `ed3d7084aabdc0022e2e1b071b5e1e362472058c7f3d94ec79a55efc31d77e2d`.
- Source used Supabase user authentication and a service-role client, read
  `portfolios.total_value`, inserted a pending `transactions` withdrawal, directly
  decremented portfolio value, marked the transaction completed, logged payout
  intent, and returned success without a real payout. CORS used `netlium.co`.
- The legacy deployment differed from the tracked tombstone. Its source was
  retained in a protected untracked evidence directory and was not published as
  an executable historical implementation.

The [official Management API function-delete operation](https://supabase.com/docs/reference/api/v1-delete-a-function)
was available through the authenticated OAuth session. As the safely supported
true removal mechanism, it was used instead of deploying another callable
handler. Only `/v1/projects/ayrgojoiprxyijeshika/functions/process-withdraw` was
removed. DELETE returned HTTP 200. Subsequent authenticated GETs returned HTTP
404 and the deployed inventory no longer contains the function. There is no
after-version or remaining production function configuration. JWT verification
was not weakened or toggled; it was true on the removed version. The tracked
410 tombstone and JWT-enabled configuration remain the resurrection guard.

### Authenticated access and credential-store diagnosis

`.mcp.json` is not Codex's TOML MCP configuration. A project-scoped command-line
override recognized the server. Native OAuth reported success, but independent
connections remained `authenticationRequired` with no tools. Explicit file-store
OAuth subsequently failed on its aggregate-store lock with `try_lock() not
supported`. A keyring login reported success, but a fresh process still returned
`notLoggedIn`. In-process OAuth did not establish usable project tools either.
Earlier retries also encountered invalid default scopes and metadata timeouts.

Access was obtained using Supabase's published OAuth discovery/registration/
authorization/token endpoints and standard PKCE S256. The browser approved a
fresh dynamic client, a loopback callback checked state and issuer when supplied,
and the code was exchanged without printing secrets. Credentials were retained
only in a mode-0600 temporary file inside a mode-0700 directory. Requests supplied
Authorization internally, never as visible command-line arguments. Authenticated
MCP initialize/tools-list/project-URL/function-source/database calls returned
HTTP 200. No authentication check was weakened. The native Codex persistence
failure remains a local tooling issue, not a production-access blocker for this
verification.

### Safe removed-endpoint invocation equivalent — PASS

Because the function was authenticated-confirmed absent, a harmless negative
invocation of that removed endpoint was used as the permitted safe equivalent
rather than creating or impersonating a customer test identity. No valid user,
service-role, provider, or financial credential was supplied to the endpoint.

Endpoint: `/functions/v1/process-withdraw` on the confirmed project URL.
Marker: `gate01-retirement-62af0a09-394f-435f-b8ac-02c6639d32fd`.
POST payload had `amount: 0` and the non-real destination `gate01-test.invalid`.

| Request                                   | Result        |
| ----------------------------------------- | ------------- |
| Primary POST                              | 404 NOT_FOUND |
| Repeated POST                             | 404 NOT_FOUND |
| Malformed JSON POST                       | 404 NOT_FOUND |
| POST with invalid synthetic authorization | 404 NOT_FOUND |
| OPTIONS preflight                         | 404 NOT_FOUND |

Every response body was:

```json
{ "code": "NOT_FOUND", "message": "Requested function was not found" }
```

No success, withdrawal completion, transfer, ledger, or provider state was
returned. No real-money withdrawal occurred. The negative requests cannot
execute the removed financial handler.

### Zero-mutation database evidence — PASS

Read-only, single-statement snapshots collected counts and deterministic full-row
fingerprints of all five required tables before retirement, immediately before
the five negative requests, and afterward. This detects portfolio updates as
well as inserts/deletes; counts alone were not used as update proof.

Database-observed timestamps (UTC):

- Before retirement: `2026-09-12 15:51:45.954529+00`.
- Before invocation: `2026-09-12 15:53:12.705236+00`.
- After invocation: `2026-09-12 15:53:43.890815+00`.

The client clock differs from the database clock. Evidence relies on sequential
snapshot/request execution and the unique marker, not a cross-clock timestamp
window.

| Table                 | Before retirement | Before invocation | After invocation | Full-row fingerprint (all three)   |
| --------------------- | ----------------- | ----------------- | ---------------- | ---------------------------------- |
| `transactions`        | 0                 | 0                 | 0                | `d41d8cd98f00b204e9800998ecf8427e` |
| `portfolios`          | 16                | 16                | 16               | `7620ba39d1ac889d9ee441dc6a83c0e3` |
| `transfer_executions` | 0                 | 0                 | 0                | `d41d8cd98f00b204e9800998ecf8427e` |
| `ledger_journals`     | 0                 | 0                 | 0                | `d41d8cd98f00b204e9800998ecf8427e` |
| `ledger_postings`     | 0                 | 0                 | 0                | `d41d8cd98f00b204e9800998ecf8427e` |

Fingerprint expression, aggregated over every row and sorted by row digest:

```sql
md5(coalesce(string_agg(md5(to_jsonb(t)::text), ''
  order by md5(to_jsonb(t)::text)), ''))
```

All counts and fingerprints matched across all three snapshots. No new legacy
withdrawal transaction, portfolio balance change, transfer execution, journal,
or posting was observed. No row or financial value changed in the compared
snapshots. The removed endpoint has no code that can read or mutate any table.

### Alternate deployed-copy inventory — PASS

The project originally exposed 11 deployed functions. All ten other deployed
function sources were fetched read-only and inspected for withdrawal/payout
references, the legacy mutation/completion pattern, and delegation to the old
slug. None contained a withdrawal/payout reference or an alternate copy/delegate.
After retirement, exactly those ten functions remain, with their full function
metadata unchanged. No other function was deployed, removed, or invoked.

| Remaining function        | Unchanged version |
| ------------------------- | ----------------- |
| `allocate-portfolio`      | 18                |
| `calculate-risk-score`    | 18                |
| `calculate-yield`         | 18                |
| `create-checkout-session` | 21                |
| `crypto-webhook`          | 18                |
| `market-signal-engine`    | 22                |
| `noop-check`              | 2                 |
| `process-deposit`         | 21                |
| `stripe-webhook`          | 21                |
| `whale-signal-engine`     | 18                |

This inventory claim is scoped to project `ayrgojoiprxyijeshika`. No other
project, provider, identity configuration, migration, or production data was
changed. Other functions were read only to exclude a Gate 01 alternate copy;
this was not later-gate remediation.

## Repository publication and validation

The corrected implementation commit is
`2f7cd105486edfd0fecff6200e77b0834fa439a0`. Draft
[PR #64](https://github.com/Neptliumforge/neptlium/pull/64) contains only Gate 01
files and commits; PR #62 remains untouched. The user explicitly prohibited
merging PR #64 in this continuation. Repository integration therefore remains
pending that separate instruction; this record proves production retirement
and does not assert a canonical-main merge or platform readiness.

- PASS — `node --test supabase/test/process-withdraw-retirement.test.mjs`: 7 tests.
- PASS — `node --test supabase/test/*.test.mjs`: 16 tests.
- PASS — targeted Prettier, staged/diff whitespace, reference, ancestry, and
  before/after stash-list checks.
- PASS — authenticated project/source inventory, official function removal,
  repeated absent-function GETs, five negative invocations, and three matched
  database snapshots.
- NOT RUN — native Deno execution of the tombstone; no production deployment of
  that handler was needed because supported removal was used.

## Gate 01 production verdict

Production retirement and verification are COMPLETE. The old function is absent,
negative calls return NOT_FOUND, all five financial tables are unchanged in the
observed snapshots, and no deployed alternate copy exists in this project.
The repository tombstone remains prepared and published. PR #64 is to remain
draft and unmerged as instructed. No Gate 02 work was performed.
