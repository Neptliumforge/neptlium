# Canonical Balances

How Neptlium reports a customer's Capital balance, and how an initialized, genuinely zero account is distinguished from an account whose balance is unknown.

Owner: `apps/api` (domain truth) with `supabase/migrations` (ledger storage). `apps/app` presents the result and never derives balance state itself.

## Principles

- `UNKNOWN != ZERO`. A failed, unavailable or unverifiable read is never shown as `$0.00`.
- `NOT INITIALIZED != ZERO`. An account without an established Capital ledger is not shown as `$0.00`.
- An initialized ledger with no capital postings, or whose capital postings net to zero, is genuinely zero and is shown as `$0.00`.
- Amounts come only from the canonical ledger (`ledger_postings` on `capital:*` liability accounts). Provider observations, funding intents and deposit instructions never contribute.
- Aggregation is complete and exact: it is computed in the database and returned as decimal strings, never as JSON numbers, and never truncated by a row limit.
- Atomic amounts are converted for display only with governed asset precision. An asset without governed precision is shown as unavailable, not as raw units and not as zero.
- USD reporting never assumes a price, peg or exchange rate. A USD total is reported only when it is established: today, only for a zero ledger.

## CURRENT (before this contract)

- `GET /v1/capital-account/balances` returns `state: 'VALUE' | 'EMPTY'` and per-asset atomic strings without precision.
- The API reads every capital posting through the Data API and sums them in application code. `amount_atomic` is `numeric(78,0)`, which PostgREST serializes as a JSON number. Precision is lost above 2^53, and values from about 10^21 become exponent strings that fail `BigInt`. Row limits on the Data API can truncate the read silently.
- Ledger accounts are created lazily on the first posting. Nothing records that an account's Capital ledger exists, so "no postings" cannot be distinguished from "no ledger".
- The application shows "No balance yet" for `EMPTY`, and raw `"<n> atomic <ASSET>"` for any real balance, because precision is missing.

## TARGET contract (version 2)

### Ledger initialization

`public.capital_ledger_initializations` records, once per owner, that Neptlium opened that owner's Capital ledger:

| Column | Meaning |
| --- | --- |
| `owner_id` | Primary key. References `auth.users`. |
| `initialized_at` | When the ledger was opened. Absence of capital postings after this point means zero. |
| `source` | `ONBOARDING` (written atomically when `profiles.provisioned_at` first becomes set) or `BACKFILL` (an owner-approved operation for existing accounts). |

- Initialization is idempotent (`on conflict do nothing`) and append-only. Browser roles have no access. The service role may read, and may write only through `initialize_capital_ledger`.
- Initialization does not create per-asset ledger accounts or postings. Those remain created by governed financial operations.
- Existing capital ledger accounts are themselves ledger evidence. An owner with `capital:*` accounts but no initialization row (an account that predates this contract) is reported from its ledger data, never as not initialized.

### Aggregation

`public.canonical_capital_balance_summary(p_owner_id uuid) returns jsonb` (`security definer`, service-role only) returns:

```json
{
  "initialized_at": "2026-10-21T00:00:00Z",
  "balances": [
    {
      "asset": "USDC",
      "network": "BASE",
      "available_atomic": "0",
      "reserved_atomic": "0",
      "pending_atomic": "0",
      "restricted_atomic": "0"
    }
  ]
}
```

- Sums are computed with `numeric` and cast to `text`. The output has one row per (asset, network) with capital accounts, so its size is bounded by the number of assets and does not depend on posting count.
- `initialized_at` is `null` when no initialization row exists.

### API response

`GET /v1/capital-account/balances` returns `200` with:

```json
{
  "contract_version": 2,
  "state": "NOT_INITIALIZED | ZERO | VALUE",
  "source": "NEPTLIUM_CANONICAL_LEDGER",
  "as_of": "2026-10-21T00:00:00.000Z",
  "ledger_initialized_at": "2026-10-21T00:00:00Z | null",
  "reporting": {
    "currency": "USD",
    "decimals": 2,
    "total_minor": "0 | null",
    "valuation": "ZERO_LEDGER | UNAVAILABLE"
  },
  "balances": [
    {
      "asset": "USDC",
      "network": "BASE",
      "atomic_precision": 6,
      "decimals": 6,
      "total_atomic": "0",
      "available_atomic": "0",
      "reserved_atomic": "0",
      "pending_atomic": "0",
      "restricted_atomic": "0"
    }
  ]
}
```

| State | Condition | `reporting` |
| --- | --- | --- |
| `NOT_INITIALIZED` | No initialization row and no capital ledger accounts. | `total_minor: null`, `valuation: UNAVAILABLE` |
| `ZERO` | Initialized (row or capital accounts exist) and every component of every balance is `0`. | `total_minor: "0"`, `valuation: ZERO_LEDGER` |
| `VALUE` | At least one non-zero component. | `total_minor: null`, `valuation: UNAVAILABLE` until a governed valuation authority exists. |

Failures are not states:

- `503 financial_storage_unavailable`: the ledger could not be read. Never a `200` with empty or zero data.
- `503 canonical_balance_integrity`: a capital component is negative. A liability balance below zero is a ledger integrity defect. It is not shown to the customer as a number.

`atomic_precision` and `decimals` come from the governed asset registry (`apps/api/src/asset-registry.ts`) for the exact (asset, network) pair. Both are `null` when the pair is not governed.

### Application display

| API outcome | Headline | Metrics (Available / Reserved / Pending) |
| --- | --- | --- |
| Request failed or `503` | `—`, "temporarily unavailable" | `—` |
| `NOT_INITIALIZED` | "No balance recorded yet" | `—` |
| `ZERO` | `$0.00` | `$0.00` |
| `VALUE`, one balance with governed precision | Asset amount at governed precision | Asset amounts |
| `VALUE`, several balances | Per-asset amounts; no combined USD figure | `—` (no single denomination) |
| `VALUE`, balance without governed precision | "Amount unavailable" for that asset | `—` |

### Backward compatibility

- Additive fields only; `contract_version` identifies the shape. `EMPTY` is no longer returned.
- An application still on version 1 that receives `ZERO` or `NOT_INITIALIZED` with an empty list renders its existing "No balance yet" copy, which is safe. For `VALUE` it now receives `decimals` and stops printing raw atomic units.
- An application on version 2 that receives a version 1 response (no `contract_version`) treats `EMPTY` as `NOT_INITIALIZED` and never as zero.
- `getCanonicalBalances` (used by allocation and customer projections) reads from the same database aggregation, so those consumers also stop losing precision.

### Deployment order and existing accounts

1. Apply the migration (table, functions, trigger) through the approved production migration process.
2. Deploy the API. Its readiness probe requires `capital_ledger_initializations`, so it will not report ready against a database without the migration. Without the aggregation function, balance reads fail closed (`503`, shown as unavailable).
3. Deploy the application.
4. Backfill only with separate owner approval. Run the read-only count first. Then insert `BACKFILL` rows for provisioned profiles without capital ledger accounts. Until the backfill runs, those existing accounts show "No balance recorded yet", as they do today, and never `$0.00`.

```sql
-- Read-only dry run.
select count(*) from public.profiles p
where p.provisioned_at is not null
  and not exists (select 1 from public.capital_ledger_initializations i where i.owner_id = p.id);

-- Approved backfill (idempotent).
select public.initialize_capital_ledger(p.id, 'BACKFILL')
from public.profiles p
where p.provisioned_at is not null;
```

## Not in scope

- A valuation authority (governed price evidence, source, time and staleness rules) that would allow a USD total for non-zero balances.
- The customer treasury and capital-account state projections (`/v1/customer/treasury`, `/v1/capital-account/state`). They already report an empty or failed read as unavailable; adopting the zero state there is a follow-up.
