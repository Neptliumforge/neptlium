# Provider Activation Checklist

Use this checklist for each specific provider capability. Never certify a provider globally when only one operation has been validated.

## Identity

- Provider:
- Capability:
- Environment:
- Asset/currency:
- Network/rail:
- Eligible principal scope:
- Release/deployment SHA:

## Gates

| Gate | Status |
| --- | --- |
| Domain contract reviewed | NOT RUN |
| Server-only configuration validated | NOT RUN |
| Environment/network mismatch tests | NOT RUN |
| Non-consequential connectivity | NOT RUN |
| Authentication/signature verification | NOT RUN |
| Idempotency | NOT RUN |
| Duplicate event handling | NOT RUN |
| Out-of-order event handling | NOT RUN |
| Ambiguous timeout recovery | NOT RUN |
| Policy/risk/approval enforcement | NOT RUN |
| Settlement definition | NOT RUN |
| Ledger posting contract | NOT RUN |
| Reconciliation | NOT RUN |
| Observability/audit | NOT RUN |
| Disable/kill path | NOT RUN |
| Customer eligibility/compliance review where applicable | NOT RUN |
| Production execution authorization | NOT RUN |

Only `PASS`, `FAIL`, `BLOCKED`, and `NOT RUN` are valid statuses.

## Certification decision

A capability is not execution-enabled until every required gate is `PASS` and the production execution decision is explicitly authorized.

Provider credentials alone never satisfy this checklist.
