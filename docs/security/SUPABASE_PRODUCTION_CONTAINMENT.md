# Supabase production-security containment

Phase 1 prevents browser and service-role callers from invoking legacy financial mutation paths before real custody, webhook verification, and controlled execution exist. It does not apply migrations or change production.

## Findings and containment

- Legacy `SECURITY DEFINER` RPCs could credit balances, confirm unverified deposits or Stripe intents, replace pooled addresses, and create withdrawal records. Their original definitions are retained under `contained_*` names with all API execution revoked; public names are deny-only `SECURITY INVOKER` stubs.
- Internal reference generation and simulated wallet withdrawal RPCs are disabled for every API role.
- Allocation request submission, cancellation, strategy mutation, rebalancing writes, and placeholder provider-event writes are disabled. Read policies and historical records remain intact.
- `allocations` and `signals` now use invoker security so underlying grants and RLS apply. Anonymous view access is revoked.
- Required authentication/provisioning trigger functions remain enabled with a fixed `pg_catalog, public` search path and no direct browser execution.
- Active legacy `USD`, `WIRE`/fiat, `internal`, and `NLM-*` destinations are snapshotted in `security_containment_archive` and retired or archived. No record is deleted.
- Authentication, profiles, owned dashboard reads, audit logs, and existing financial history are unchanged.

Deposit, withdrawal, webhook confirmation, balance crediting, and allocation execution must remain unavailable until provider authentication, signature verification, idempotency, reconciliation, authorization, and audit controls are reviewed in a later phase. No provider secrets are introduced here.

## Review and rollback

Validate against a disposable local database or staging first. Review the dry-run before any remote apply. The rollback script is [`rollback-production-containment.sql`](./rollback-production-containment.sql). It deliberately restores unsafe pre-containment capabilities and must only be run in a maintenance window after incident-owner and security approval.

Suggested staging sequence:

```sh
supabase db reset
supabase db lint --level warning
supabase db push --dry-run
```

Manual rollback:

```sh
psql "$STAGING_DATABASE_URL" --set ON_ERROR_STOP=1 --file docs/security/rollback-production-containment.sql
```

Do not use the rollback against production merely to re-enable a UI. Build and approve real custody operations instead.
