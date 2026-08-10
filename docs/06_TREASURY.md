# Treasury

Treasury is the read and intelligence layer over canonical ledger, reservations, policies, provider evidence, and reconciliation. It is not the transfer engine and must never mutate provider or ledger state merely because a user views or filters treasury data.

## CURRENT

- `apps/app` exposes a Treasury route and a read-only view with Available liquidity, Reserve, and Committed placeholders. It correctly renders unavailable values when data is absent.
- The application treasury module is skeletal and returns no fabricated accounts or transactions.
- `apps/api/src/treasury.ts` defines withdrawal-policy evaluation: supported asset/network, positive and maximum amount, destination allowlist, single/dual approval thresholds, distinct approvers, rejection handling, and self-approval prohibition.
- Migration groundwork includes `treasury_policies`, `treasury_destination_allowlist`, append-only `withdrawal_approvals`, wallet/ledger records, and reconciliation records. These private operational tables are revoked from browser roles.
- The API has no complete customer Treasury route or durable treasury repository. Memory contracts are not production authority.

This is groundwork, not an operational treasury system. Database rows or UI labels do not prove liquidity, reservation, custody, settlement, or execution.

## TARGET liquidity model

For every supported scope—account, asset, network, legal entity, or strategy—Treasury distinguishes:

- **Available:** canonically posted capital eligible for new use after restrictions and reservations.
- **Reserved:** capital held against an approved withdrawal, allocation, transfer, fee, or settlement obligation.
- **Committed:** capital contractually or operationally committed through an approved intent but not yet fully settled.
- **Pending:** provider-observed or in-flight capital that is not yet canonical/available.
- **Restricted:** capital blocked by compliance, legal, mandate, asset, network, counterparty, or operational policy.

These categories must reconcile to the ledger and must not be computed by summing unrelated UI records.

### Reserve requirement and coverage

The **reserve requirement** is the policy-determined amount that must remain protected for obligations, settlement risk, withdrawals, fees, or other governed needs. **Reserve coverage** compares eligible reserve assets to that requirement, with valuation time, source, scope, and reconciliation status.

Coverage must not treat pending deposits, unverified provider balances, restricted capital, or stale prices as fully eligible. Any haircut, valuation source, or netting rule is explicit and versioned.

### Liquidity state

The target state is derived from canonical quantities and policy, for example:

- `healthy`: available and eligible reserves satisfy requirements with approved headroom;
- `watch`: headroom or data freshness is below policy threshold;
- `constrained`: obligations or restrictions materially reduce deployable capital;
- `breach`: reserve coverage is below requirement;
- `unknown`: canonical or reconciled inputs are missing.

Names and thresholds are policy-owned and versioned; `unknown` must never be coerced to `healthy`.

## TRANSITION

1. Define ledger-backed read models for each liquidity category.
2. Add durable reservations and link them to approved intents.
3. Connect policy versions, approvals, provider observations, and reconciliation freshness.
4. Expose read-only API projections with as-of timestamps and explicit unavailable/unknown states.
5. Add alerts and admin investigation paths before any automated action.

## Boundaries

- Treasury may explain, aggregate, forecast, alert, and recommend.
- Allocation and Transfer domains create governed intents.
- Ledger posts canonical movements.
- Provider adapters execute external instructions only after authorization.
- Reconciliation compares external evidence with canonical state.

Treasury never calls a provider solely to make a dashboard number appear complete, never marks transactions settled, and never bypasses approval or reservation policy.
