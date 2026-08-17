# Transfer Architecture

Transfers are governed movements between Neptlium principals/accounts or to verified external destinations. A recipient lookup, database status, approval, or provider response is not itself a completed transfer.

## CURRENT groundwork

- The legacy schema contains `aliases` linked to `auth.users` and a later `transfer_aliases` table keyed by profile, alias, asset, network, destination, and `verified_at`.
- The migration explicitly requires server-validated alias-to-destination resolution. Verified aliases are readable under RLS; ownership controls mutation.
- `wallet_transactions` recognizes transfer records, and ledger/account primitives can represent internal movements.
- `withdrawal_addresses` and treasury allowlist groundwork represent known external destinations.
- `apps/app` defines a provider-neutral alias transfer service contract and an unavailable-state UI.
- The governed API foundation now models durable transfer intents, reservations, explicit approval states, settlement evidence, canonical ledger posting, and reconciliation primitives. Live outbound execution remains disabled.

The original `aliases` policy allows broad read access and is legacy. Target resolution must expose only the minimum verified recipient confirmation needed for a transfer and must not reveal raw destinations or personal data to clients.

## Governed flow

1. **Alias resolution** — normalize the alias server-side, look up the active verified mapping, and bind it to asset/network/account scope.
2. **Recipient verification** — return a safe recipient confirmation and verification state; never return private destination details unnecessarily.
3. **Validation** — verify sender ownership, recipient eligibility, self-transfer policy, asset/network, amount, restrictions, limits, sanctions/compliance state, and available canonical balance.
4. **Transfer request** — create an immutable, idempotent request with sender, destination reference, amount, rail, request digest, and lifecycle state.
5. **Reservation** — atomically move canonical capital from available to reserved before manual approval can occur.
6. **Pending approval** — place the exact reserved transfer into an explicit review state. The reservation, request version, owner, amount, asset, network, and destination context remain fixed.
7. **Approval** — an authorized administrator approves the exact pending transfer. Approval is persisted and audited but does not create a provider instruction, settlement, or completed withdrawal.
8. **Provider execution** — when external movement is required, submit an idempotent instruction through the reviewed provider adapter only after the transfer is explicitly approved and the reservation remains active.
9. **Settlement evidence** — provider or chain evidence may move a submitted transfer to settled only when matching evidence is verified. Observation alone is not canonical reconciliation.
10. **Canonical settlement and reconciliation** — consume the durable reservation through balanced ledger posting, compare provider/internal evidence, classify mismatches, and mark reconciled only after a matched reconciliation item exists.
11. **Activity history** — expose an immutable customer-readable timeline including request, reservation, pending approval, approval, submission, settlement, failure, reversal, and reconciliation state.

## Governed lifecycle

The production target lifecycle for new external transfers is:

`REQUESTED -> RESERVED -> PENDING_APPROVAL -> APPROVED -> SUBMITTED -> SETTLED -> RECONCILED`

`AUTHORIZED` remains a compatibility-only enum state for already-persisted historical transfer rows. A legacy `AUTHORIZED` row may converge into `RESERVED`, but new transfers do not enter `AUTHORIZED` before reservation.

Important invariants:

- `REQUESTED` cannot jump directly to approval.
- `RESERVED` cannot jump directly to provider submission.
- `PENDING_APPROVAL` cannot submit.
- `APPROVED` does not imply submission or settlement.
- `SUBMITTED` does not imply settlement.
- `SETTLED` does not imply reconciliation.
- Settlement requires matching provider evidence; reconciliation requires a distinct matched reconciliation record.

## Alias architecture

The target alias is a routing identifier, not an authentication credential and not canonical identity.

- Store normalized and display forms separately.
- Enforce uniqueness within an explicit namespace and supported asset/network scope.
- Bind mappings to a provider-independent Neptlium principal/account.
- Require verification before public resolution.
- Version or audit destination changes and support revocation/expiry.
- Resolve on the server and return minimum disclosure.
- Prevent enumeration with authorization, response shaping, monitoring, and distributed rate limits.
- Revalidate the mapping before reservation and approval; do not trust a stale client lookup.

## Approval and audit evidence

Transfer approval is a privileged API operation, not a client-side status update.

- `apps/admin` may authenticate the operator and call `apps/api`; it does not receive service-role financial authority.
- The API resolves the persisted `super_admin` role before privileged approval.
- The transfer owner cannot self-approve a governed external transfer.
- Approval uses an idempotency key and request correlation ID.
- Lifecycle changes are written to append-only transfer execution history.
- Broad service-role updates to canonical transfer state remain revoked; reviewed security-definer operations own state transitions.

## Failure and reversal

- Validation failure creates no reservation or financial posting.
- Failure or cancellation before provider submission releases a durable reservation exactly once through a governed operation.
- A submitted transfer cannot be locally cancelled as though provider execution never happened; provider failure/reversal evidence and reconciliation must resolve the outcome.
- Submission timeout remains unknown/pending until provider lookup and reconciliation resolve it; never retry blindly.
- Posted mistakes are corrected with reversal or compensating entries, never edited/deleted postings.
- Append-only transfer history remains preserved even when a reservation is released or a later reversal is required.

## TRANSITION

1. Keep existing alias tables as groundwork while auditing access policies and data quality.
2. Apply the forward-only transfer approval migrations only through an explicit production migration gate.
3. Keep live transfer request and provider execution capabilities disabled until provider eligibility, custody, signing, webhook verification, settlement evidence, and reconciliation are separately proven.
4. Add the operational processor that moves a validated request through reservation and `PENDING_APPROVAL` without exposing provider execution to the client.
5. Surface governed pending transfers in admin operational views without reintroducing direct Supabase authority.
6. Enable a provider execution path only after explicit production approval and end-to-end reconciliation proof.

No current Circle transfer capability may be inferred from configuration alone. Credentials, a Wallet Set, or provider observation do not enable outbound execution.
