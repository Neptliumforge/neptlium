# Provider Execution Policy Model

Provider execution is subordinate to Neptlium authorization.

A capability may execute only when all of the following are true: the exact provider capability is certified; execution is separately enabled for that capability; the Neptlium principal/owner is authorized; applicable policy/risk requirements are satisfied; and required approvals are satisfied.

Provider capability certification never substitutes for Neptlium authorization. Provider-side authorization never substitutes for Neptlium authorization. Browser intent never substitutes for server authorization.

Alchemy observation/intelligence capabilities remain non-executing by doctrine. Circle and Stripe externally mutating operations require the full execution policy path plus their operation-specific settlement/reconciliation contracts.
