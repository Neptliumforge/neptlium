# Allocation Engine

The allocation engine evolves existing allocation groundwork; it is not a rebuild from zero. Modeling is non-executing. Execution requires authorization, reservation, provider/venue capability where applicable, ledger posting, and reconciliation.

## CURRENT groundwork

- Legacy schema includes strategies, strategy allocations, allocation views, portfolio relationships, target-percentage validation, and historical rebalancing records.
- `capital_allocation_requests` records owner, wallet, portfolio, asset, network, amount, status, idempotency key, review metadata, and notes.
- Production containment removed authenticated mutation policies and disabled simulated/direct allocation execution while preserving reads and history.
- `apps/app` contains allocation routes, Observe/Model/Authorize presentation groundwork, an allocation service contract, eligibility checks, request models, and honest unavailable states.
- `apps/admin` can list/review allocation-request records. A status update is administrative metadata; it does not itself execute or settle capital.
- The ledger and operations migrations provide primitives needed for future reservations, approvals, jobs, execution tracking, audit, and reconciliation, but do not constitute a complete allocation executor.

## TARGET lifecycle

Every allocation decision progresses through explicit, auditable states:

```text
Observed
→ Modeled
→ Proposed
→ Under Review
→ Approved
→ Reserved
→ Submitted
→ Settling
→ Settled
```

Terminal or exceptional states such as rejected, cancelled, expired, failed, partially settled, and reversed must preserve the preceding history. State transition eligibility is enforced server-side and is idempotent.

## Capital buckets

- **Reserve:** protected liquidity held against requirements and obligations.
- **Core:** strategic, policy-aligned long-horizon exposure.
- **Growth:** governed growth-seeking exposure within mandate limits.
- **Opportunity:** bounded, time-sensitive deployment with explicit risk budget.
- **Restricted:** capital unavailable for allocation because of legal, compliance, operational, settlement, or mandate constraints.

Buckets are ledger/policy classifications, not decorative portfolio labels. Capital cannot be counted in multiple available buckets.

## Domain model

- **Mandates** define who owns the capital, permissible objectives, authority, horizon, constraints, and approvers.
- **Policies** encode versioned eligibility, concentration, liquidity, reserve, counterparty, asset, venue, and approval rules.
- **Targets** express desired exposures by bucket and governed dimension.
- **Drift** compares reconciled observed exposure with approved targets at a stated valuation time.
- **Scenarios** are immutable modeling inputs and outputs; they never move capital.
- **Proposals** convert a selected scenario into explicit intended changes with rationale and policy evidence.
- **Approvals** are append-only decisions by authorized, distinct principals against a specific proposal version.
- **Reservations** hold canonical available capital for an approved proposal and prevent double spending.
- **Execution intents** translate an approved, reserved proposal into idempotent internal or provider/venue instructions.
- **Reconciliation** matches execution evidence, ledger postings, positions, fees, and exceptions.
- **Decision ledger** records observations, model versions, proposals, policy evaluations, approvals, reservations, submissions, outcomes, exceptions, and reversals.

## Lifecycle meaning

| State        | Required meaning                                                                     |
| ------------ | ------------------------------------------------------------------------------------ |
| Observed     | Reconciled holdings, balances, constraints, and valuations captured as-of a time.    |
| Modeled      | One or more non-executing scenarios evaluated against a mandate.                     |
| Proposed     | A specific versioned action set and rationale submitted.                             |
| Under Review | Required policy and human reviews are outstanding or in progress.                    |
| Approved     | All required approvals and policy checks passed for that exact version.              |
| Reserved     | Required canonical capital is atomically held and cannot be reused.                  |
| Submitted    | Idempotent execution intents were accepted by internal/provider boundaries.          |
| Settling     | Execution evidence exists but canonical completion criteria are outstanding.         |
| Settled      | Provider/venue evidence, ledger postings, positions, fees, and reconciliation agree. |

## TRANSITION

1. Map existing strategies, allocation requests, and historical events into the target vocabulary without rewriting history.
2. Keep Observe and Model available only where source data is labeled and honest.
3. Add proposal/version, policy-evaluation, approval, and decision-ledger persistence.
4. Add atomic reservations before enabling any submission.
5. Add provider-neutral execution intents and durable workers.
6. Reconcile partial fills, fees, failures, timeouts, and reversals before declaring settlement.

## Invariants

- A model, proposal, approval, admin status change, or job row never proves execution.
- Approval is bound to an immutable proposal and policy version.
- Reservation precedes submission and is released or converted exactly once.
- Provider evidence does not override canonical ledger truth.
- No exposure, performance, price, liquidity, or execution result is fabricated.
