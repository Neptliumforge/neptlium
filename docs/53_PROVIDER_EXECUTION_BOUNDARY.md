# Provider Execution Boundary

A provider adapter may prepare or submit a consequential external operation only after receiving a Neptlium-owned intent that has passed the required upstream authorization/policy/approval gates and after the specific provider capability is execution-enabled.

Provider execution code must never accept browser-supplied claims of authorization as sufficient authority. Server-side state is authoritative.

The adapter returns provider references/evidence to the lifecycle/reconciliation system. It does not directly manufacture canonical available balance.
