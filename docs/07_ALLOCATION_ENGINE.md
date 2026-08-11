# Allocation Engine

Neptlium Allocation is a governed capital-allocation operating system. It observes canonical capital, persists user-defined policy, models target state and drift, creates reviewable plans, records explicit authorization, and is designed to hand future executable movements into the existing reservation / Treasury / Transfer / ledger / reconciliation boundaries. It is not a trading terminal, robo-adviser, recommendation engine, yield optimizer, or autonomous rebalancer.

## Production domain boundary

```text
apps/app
  -> apps/api
    -> Allocation domain
      -> policy / authorization
        -> reservation (future execution preparation only)
          -> Treasury / Transfer / future execution adapter
            -> provider
              -> settlement evidence
                -> canonical ledger
                  -> reconciliation
```

`apps/app` never imports a custody, exchange, chain, or payment provider SDK for Allocation and never writes financial/allocation tables directly. Browser state is not authorization.

## Canonical lifecycle

```text
OBSERVED
-> MODELED
-> AUTHORIZED
-> EXECUTION_PENDING
-> EXECUTING
-> EXECUTED
-> RECONCILING
-> RECONCILED
```

Interruption/terminal states are `CANCELLED`, `FAILED`, `PARTIALLY_EXECUTED`, and `DISCREPANCY`.

The lifecycle is evidence-bearing. `MODELED -> EXECUTED`, `AUTHORIZED -> EXECUTED`, and `EXECUTED -> RECONCILED` are invalid transitions. Authorization permits a plan to enter the execution layer; it does not move assets. Provider submission does not prove settlement. Settlement does not prove reconciliation.

## Observed capital

Observed Allocation state is derived only from owner-scoped Neptlium canonical ledger balances. Each asset/network quantity remains independent. Provider wallet balances, chain indexers, custody balances, browser state, or aggregate provider balances are never customer allocation truth.

No cross-asset portfolio value or percentage is produced unless an explicitly governed, timestamped valuation source exists. Until then the API returns `portfolioValue: null`, and any percentage model that needs cross-asset valuation carries `REQUIRED_UNAVAILABLE` / `Valuation unavailable` rather than synthetic math.

## Allocation policy

`AllocationPolicy` is owner-scoped and versioned. A policy version carries:

- name and objective;
- review frequency;
- reserve requirement;
- drift tolerance;
- allowed assets;
- restricted assets;
- target allocations;
- minimum/maximum target bounds;
- liquidity constraints;
- creator / authorizer identity and timestamps.

Editing an authorized policy creates a new DRAFT version. Previously authorized policy history is not silently overwritten. Policy authorization is an explicit, idempotent server mutation.

### Capital classifications

The governed classifications are `Reserve`, `Core`, `Growth`, `Opportunity`, and `Restricted`. They are user/policy classifications, not investment recommendations. Neptlium does not classify an asset from market opinion. Restricted capital cannot enter an executable movement.

## Validation

The API rejects invalid policy or lifecycle state server-side, including:

- target totals other than exactly 100%;
- negative or >100% basis-point values;
- minimum/maximum conflicts;
- unsupported asset/network targets;
- restricted assets with positive executable targets;
- duplicate target keys / duplicate asset constraints;
- reserve targets below an explicit reserve requirement;
- stale policy versions;
- cross-owner access;
- invalid lifecycle transitions.

Browser validation is only usability assistance and is never financial authority.

## Drift

`AllocationDrift` is a first-class model: observed canonical state versus the selected policy target. Drift rows expose Current, Target, Difference, and one semantic state:

- `Within policy`
- `Review`
- `Outside policy`
- `Restricted`
- `Valuation unavailable`

Drift is not described as loss, underperformance, opportunity, buy signal, or sell signal.

User decisions are distinct:

- **Leave unchanged** records a decision only and creates no execution.
- **Review rebalance** creates a persistent model and plan for review.
- **Update policy** returns to versioned policy editing.

No drift automatically triggers a rebalance.

## Models and plans

An `AllocationModel` freezes:

- policy ID/version;
- observed timestamp and canonical quantity snapshot;
- target snapshot;
- drift snapshot;
- valuation availability;
- creator and creation time.

An `AllocationPlan` freezes the model/policy relationship, observed/target/drift snapshots, constraints, proposed movements, creator, authorization state, and later execution/reconciliation state.

Movement types are:

- `INTERNAL_RECLASSIFICATION`
- `TRANSFER`
- `CONVERSION_REQUIRED`
- `UNEXECUTABLE`

A model is not an order. If a conversion/venue/valuation/execution capability does not exist, the plan remains valid and reviewable with `Execution unavailable`; Neptlium does not fabricate a trade.

## Current execution capability

The first production Allocation build deliberately exposes:

```text
canModel      = true
canAuthorize  = true
canReserve    = false
canExecute    = false
canReconcile  = false
```

Provider configuration is never sufficient to enable execution. Future readiness requires the governed Allocation domain gate plus provider configuration, verified eligibility, and explicit execution enablement. Allocation is independent of pending Coinbase / Fireblocks or any other custody approval.

Authorization does not reserve capital. Reservation begins only when an authorized plan explicitly enters execution preparation and an executable movement exists.

## Reservation and future execution

Before any executable movement can leave Neptlium, canonical `AVAILABLE -> RESERVED` must occur through the governed reservation architecture. Future preparation must atomically reject reservation above canonical available capital, prevent double reservation, and preserve idempotency.

Allocation will never call providers directly. Provider-neutral movement/execution intents hand off to existing Treasury / Transfer / future execution adapters.

## Partial execution

Movement state is tracked independently. A plan with multiple movements cannot become fully executed merely because some movements settled. A mixed settled/failed result is `PARTIALLY_EXECUTED`; optimistic booleans are prohibited.

## Reconciliation

A plan becomes `RECONCILED` only when expected movement, provider/settlement evidence, canonical ledger effect, and reconciliation agree. Any disagreement produces `DISCREPANCY` and preserves evidence for operations review.

## Persistence

The forward-only Allocation migration introduces governed persistence for:

- `allocation_policies`
- `allocation_policy_versions`
- `allocation_targets`
- `allocation_models`
- `allocation_plans`
- `allocation_plan_movements`
- `allocation_events`
- allocation idempotency records and read projections

All Allocation tables enable RLS and grant no direct `anon` / `authenticated` mutation authority. `apps/api` is the mutation/read authority using owner-scoped service operations. Allocation events and target-version records are append-only audit history. The migration is reviewed repository state only and is **not applied to production by this build**.

## API surface

Current governed Allocation endpoints:

- `GET /v1/allocation/capabilities`
- `GET /v1/allocation/workspace`
- `GET /v1/allocation/policies`
- `POST /v1/allocation/policies`
- `GET /v1/allocation/policies/:id`
- `PATCH /v1/allocation/policies/:id`
- `POST /v1/allocation/policies/:id/authorize`
- `POST /v1/allocation/models`
- `GET /v1/allocation/models/:id`
- `GET /v1/allocation/plans`
- `POST /v1/allocation/plans`
- `GET /v1/allocation/plans/:id`
- `POST /v1/allocation/plans/:id/authorize`
- `POST /v1/allocation/plans/:id/cancel`
- `POST /v1/allocation/drift-decisions`
- `GET /v1/allocation/activity`

There is deliberately no LIVE execution endpoint in this phase.

## Application workspace

`apps/app` Allocation is one restrained capital-policy workspace:

- lifecycle indicator;
- current canonical capital;
- policy editor/version state;
- drift review;
- modeled-plan authorization review;
- allocation activity.

The mobile layout converts financial tables to structured rows rather than squeezing desktop tables. Unknown values render as `Unavailable` / `Valuation required`; missing positions render `No position`; fake zeros or money placeholders are prohibited.

## Required invariants

- one owner cannot access another owner's policy/model/plan;
- browser state cannot authorize or advance a plan;
- target totals and asset/network constraints are validated server-side;
- restricted capital cannot become executable;
- execution capability defaults closed;
- provider configuration alone cannot enable execution;
- future reservation cannot exceed canonical available capital;
- duplicate authorization is idempotent;
- partial execution cannot mark a plan fully executed;
- provider settlement does not equal reconciliation;
- reconciliation disagreement becomes `DISCREPANCY`;
- absent valuation never creates a fabricated portfolio value;
- Allocation customer code contains no provider SDK authority.

REAL CAPITAL EXECUTION: **CLOSED**  
PRODUCTION ALLOCATION MIGRATION: **NOT APPLIED**  
AUTONOMOUS REBALANCING: **DISABLED**
