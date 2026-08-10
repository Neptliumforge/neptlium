# Transfer Architecture

Transfers are governed movements between Neptlium principals/accounts or to verified external destinations. A recipient lookup, database status, or provider response is not itself a completed transfer.

## CURRENT groundwork

- The legacy schema contains `aliases` linked to `auth.users` and a later `transfer_aliases` table keyed by profile, alias, asset, network, destination, and `verified_at`.
- The migration explicitly requires server-validated alias-to-destination resolution. Verified aliases are readable under RLS; ownership controls mutation.
- `wallet_transactions` recognizes transfer records, and ledger/account primitives can represent internal movements.
- `withdrawal_addresses` and treasury allowlist groundwork represent known external destinations.
- `apps/app` defines a provider-neutral alias transfer service contract and an unavailable-state UI. Its own comment correctly states that no usable backend alias-transfer service exists yet.
- There is no complete versioned Transfer API, atomic reservation flow, or provider execution path. No transfer should be represented as available or settled from this groundwork.

The original `aliases` policy allows broad read access and is legacy. Target resolution must expose only the minimum verified recipient confirmation needed for a transfer and must not reveal raw destinations or personal data to clients.

## TARGET flow

1. **Alias resolution** — normalize the alias server-side, look up the active verified mapping, and bind it to asset/network/account scope.
2. **Recipient verification** — return a safe recipient confirmation and verification state; never return private destination details unnecessarily.
3. **Validation** — verify sender ownership, recipient eligibility, self-transfer policy, asset/network, amount, restrictions, limits, sanctions/compliance state, and available canonical balance.
4. **Transfer intent** — create an immutable, idempotent intent with sender, recipient, amount, purpose, request digest, and lifecycle state.
5. **Authorization** — evaluate policy and collect required step-up authentication or approvals against the exact intent version.
6. **Reservation** — atomically reserve canonical available capital before any submission.
7. **Internal ledger movement** — when both sides are internal and eligible, post a balanced entry between controlled accounts without fabricating an external provider transaction.
8. **Provider execution** — when external movement is required, submit an idempotent instruction through the reviewed provider adapter only after authorization and reservation.
9. **Reconciliation** — compare provider/internal evidence, fees, settlement, and ledger postings; classify and surface mismatches.
10. **Activity history** — expose an immutable customer-readable timeline including intent, approvals, reservation, submission, settlement, failure, reversal, and reconciliation state.

## TARGET lifecycle

Suggested domain states are `created`, `validating`, `awaiting_authorization`, `authorized`, `reserved`, `submitted`, `settling`, `settled`, `cancelled`, `failed`, and `reversed`. Internal transfers may omit provider submission but never authorization, reservation, balanced posting, and reconciliation controls.

## Alias architecture

The target alias is a routing identifier, not an authentication credential and not canonical identity.

- Store normalized and display forms separately.
- Enforce uniqueness within an explicit namespace and supported asset/network scope.
- Bind mappings to a provider-independent Neptlium principal/account.
- Require verification before public resolution.
- Version or audit destination changes and support revocation/expiry.
- Resolve on the server and return minimum disclosure.
- Prevent enumeration with authorization, response shaping, monitoring, and distributed rate limits.
- Revalidate the mapping at intent authorization; do not trust a stale client lookup.

## Failure and reversal

- Validation failure creates no reservation or financial posting.
- Authorization rejection preserves the intent and decision evidence.
- Submission timeout remains unknown/pending until provider lookup and reconciliation resolve it; never retry blindly.
- Failed execution releases the reservation exactly once when policy permits.
- Posted mistakes are corrected with reversal or compensating entries, never edited/deleted postings.

## TRANSITION

1. Treat existing alias tables as groundwork and audit their access policies and data quality.
2. Introduce principal-bound verified mappings without breaking historical references.
3. Implement a server-only resolution API with minimum disclosure and distributed rate limiting.
4. Add transfer intents, authorization evidence, durable reservations, balanced internal posting, and provider-neutral external execution.
5. Add reconciliation and activity projections before enabling the customer action.

No current Circle transfer capability may be inferred: Circle `createTransfer` is explicitly disabled in the foundation adapter.
