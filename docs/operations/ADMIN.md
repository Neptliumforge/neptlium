# Admin Operations

`apps/admin` is Neptlium's internal operational and control environment at `admin.neptlium.com`. It is not customer navigation and it is not itself a financial execution engine.

## Access

Supabase Auth is the active operator authentication and session authority. Admin server code sends the current Supabase access token to `api.neptlium.com`; the API resolves the `SUPABASE_AUTH` subject to a stable Neptlium principal and applies Neptlium-owned role and policy authorization.

An authenticated session alone does not grant admin or financial authority. Routes and commands require the appropriate Neptlium role, ownership/policy state, compliance state, and operation-specific authorization.

Supabase service-role credentials remain server-side infrastructure authority and never become operator credentials.

## Operational surfaces

Current and target admin surfaces include:

- operational overview;
- users/principals and user detail;
- organizations and roles;
- deposits;
- withdrawals;
- treasury/transfers;
- allocations;
- transactions/activity;
- security events;
- capability inventory;
- reconciliation and provider evidence.

## Financial truth boundary

**A database or UI status change does not prove financial execution.**

Approval, submission, provider observation, settlement and reconciliation are distinct. Admin controls must not label an operation as financially complete without the required durable evidence.

## Governed control model

Admin is a client of privileged API commands and canonical read models for:

- principal, organization, role, entitlement, and compliance investigation;
- deposit/withdrawal/transfer/allocation review queues;
- policy evaluation and approval evidence;
- reservations and execution-intent inspection;
- provider health and observation timelines;
- reconciliation runs, exceptions and resolutions;
- ledger/posting inspection without destructive mutation;
- webhook/job/dead-letter operations;
- security events and access review;
- capability/configuration state without secret disclosure.

## Control requirements

- Separate request, approval, execution and reconciliation permissions.
- Prevent self-approval where policy requires dual control.
- Bind decisions to immutable intent/proposal and policy versions.
- Require reason/evidence for rejection, suspension, override or exception resolution.
- Apply step-up authentication for high-risk actions when implemented.
- Apply idempotency and transition checks to every command.
- Record actor, role, request ID, before/after state, timestamp and safe metadata.
- Display provider-observed, canonical, pending, reserved, restricted, failed and unknown distinctly.
- Never expose service-role keys, provider credentials, access/refresh tokens or unnecessary personal data.

## Operator truth rules

- `approved` means authorization requirements passed, not execution.
- `submitted` means an idempotent instruction was accepted, not settlement.
- `observed` means provider/chain evidence exists, not canonical availability.
- `settled` requires the system's settlement criteria.
- `reconciled` requires matching governed evidence and canonical state.
- `configured` does not necessarily mean healthy, eligible or enabled.
- Unknown or unavailable state remains unknown or unavailable.
