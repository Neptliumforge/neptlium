# Admin Operations

`apps/admin` is the internal operational console at `admin.neptlium.com`. It is not customer navigation and it is not itself a financial execution engine.

## CURRENT

Access uses Supabase Auth plus server-side role lookup through the service-role client. Routes require `admin` or higher; selected operations can require `super_admin`. RLS and server authorization remain mandatory.

Current screens include:

- operational overview;
- users and user detail;
- withdrawals;
- allocations;
- deposits;
- transactions;
- login history and trusted devices;
- capability inventory.

Current actions include role updates, account compliance suspension/reactivation, allocation status updates, deposit status completion, and withdrawal approve/reject status updates.

## Critical current limitation

**Database status changes do not prove financial execution.**

Several current server actions directly update legacy tables—for example, marking a wallet transaction `completed` or an allocation request `executed`. Those labels do not prove a provider instruction occurred, a balanced ledger entry posted, a reservation was consumed, settlement completed, or reconciliation matched.

Until migrated, these controls are administrative workflow metadata only. They must not be described to operators or customers as custody, transfer, settlement, allocation execution, or canonical balance authority.

## TARGET operational-control model

Admin becomes a governed client of privileged API commands and read models:

- principal, organization, role, entitlement, and compliance investigation;
- deposit/withdrawal/transfer/allocation review queues;
- policy evaluation and approval evidence;
- reservation and execution-intent inspection;
- provider health and observation timelines;
- reconciliation runs, exceptions, acknowledgment, and resolution;
- ledger entry/posting inspection without mutation;
- webhook/job/dead-letter operations;
- security events, session response, and access review;
- capability/configuration status without secret disclosure.

## Control requirements

- Separate request, approval, execution, and reconciliation permissions.
- Prohibit self-approval and enforce distinct approvers where policy requires.
- Bind every decision to the immutable intent/proposal and policy version reviewed.
- Require explicit reason/evidence for rejection, suspension, override, or exception resolution.
- Use step-up authentication for high-risk actions when implemented.
- Apply idempotency and optimistic/transition checks to every command.
- Record actor, role, request ID, before/after lifecycle state, timestamp, and safe metadata.
- Display provider-observed, canonical, pending, reserved, restricted, failed, and unknown distinctly.
- Do not expose service-role keys, provider credentials, raw secrets, or unnecessary personal data.

## TRANSITION

1. Inventory and label direct database mutations as metadata-only.
2. Introduce API commands for reviewed lifecycle transitions.
3. Require durable reservation, provider/ledger evidence, and reconciliation before financial completion states.
4. Convert admin pages to read canonical projections and exception queues.
5. Add dual control, step-up authentication, and append-only decisions.
6. Remove legacy direct-write paths only after equivalent controlled workflows are proven.

## Operator truth rules

- `approved` means authorization requirements passed, not execution.
- `submitted` means an idempotent instruction was accepted, not settlement.
- `settled` requires canonical ledger and reconciliation criteria.
- `resolved` requires preserved evidence and actor attribution, not deletion of an exception.
- `configured` does not necessarily mean healthy or eligible.
- Unknown or unavailable state stays unknown or unavailable.
