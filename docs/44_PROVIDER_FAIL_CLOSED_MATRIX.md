# Provider Fail-Closed Matrix

| Condition | Required behavior |
| --- | --- |
| Provider secret missing | Capability unavailable; no guessed fallback |
| Partial provider configuration | Reject configuration/capability |
| Environment/network mismatch | Reject configuration |
| Provider health unknown | Do not infer execution availability |
| Webhook signature invalid | Reject event |
| Duplicate event | Idempotent no-duplicate financial effect |
| Ambiguous submission timeout | Lookup/recover before retry |
| Policy/approval incomplete | Do not submit |
| Provider reports success but reconciliation incomplete | Do not claim reconciled state |
| Alchemy supports chain but Neptlium chain capability disabled | Do not expose economic action |
| Circle configured but execution gate closed | Observation/configuration only |
| Stripe billing configured but funding contract absent | Do not expose capital funding |
| Conflicting Circle/Alchemy evidence | Exception/review; no silent winner |

Fail-closed behavior must preserve recoverability and audit evidence; it must not erase or fabricate state.
