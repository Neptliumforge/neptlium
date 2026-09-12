# NEPTLIUM Admin Operations — Remediation Mode

## Admin role

`apps/admin` is the operator interface for visibility, investigation, approvals, exception handling, and auditability. It is not a direct financial database console.

## Current transition

Admin contains legacy direct Supabase workflow mutation paths protected by a fail-closed feature guard. Those paths must be fully migrated to governed API commands or removed before production completion.

## Target command path

```text
Admin operator
  -> Clerk-authenticated Admin session
  -> Neptlium API
  -> principal/role/compliance checks
  -> step-up/reason capture where required
  -> durable governed command
  -> provider/ledger/reconciliation lifecycle
  -> immutable audit event
```

## Required operator visibility

Admin should expose enough evidence to investigate financial state without inventing certainty:

- canonical transaction/execution ID;
- owner/principal;
- current lifecycle state;
- reservation/approval evidence;
- provider and provider reference;
- webhook/provider-event state;
- settlement evidence;
- ledger journal IDs;
- reconciliation run/item and discrepancy codes;
- request/idempotency identifiers;
- audit actor and reason.

## Privileged-action rules

- browser UI controls are not authorization;
- super-admin or other privileged role must be validated server-side;
- transfer owner must not self-approve where separation of duties applies;
- direct status editing must never substitute for provider execution or settlement;
- replay/idempotency must be enforced for repeated operator actions;
- failed/unknown provider states require explicit recovery workflows rather than manual success marking.

## Remediation dependencies

Admin production readiness depends on gates 05-16, especially removal of direct-write authority, canonical reconciliation visibility, identity cutover, and production environment certification.

## Final rewrite

After remediation closes, rewrite this document with the final role matrix, approval procedures, exception workflows, reconciliation operations, incident runbooks, and audit retention requirements.
