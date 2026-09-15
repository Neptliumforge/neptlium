# Provider Terminology

Use these terms consistently across engineering and operational documentation.

- **Provider adapter:** server-side integration translating between Neptlium contracts and an external provider.
- **Provider evidence:** external observation/event/result that is non-canonical until governed settlement/reconciliation.
- **Configured:** required configuration for a capability is present and valid; says nothing about connectivity or availability.
- **Connectivity verified:** the exact provider/environment/network or rail has been successfully reached/identified under a controlled check.
- **Capability certified:** the exact capability contract has passed its required technical and financial-control gates.
- **Execution enabled:** a certified externally mutating capability has separately authorized execution permission.
- **Observed:** external evidence has been received/read.
- **Confirmed:** evidence satisfies the operation-specific confirmation/finality rule; does not universally imply canonical settlement.
- **Settled:** the applicable Neptlium settlement contract has been satisfied.
- **Reconciled:** durable Neptlium intent/state, external evidence and canonical accounting have been correlated under the reconciliation contract.
- **Ambiguous outcome:** submission may have had external effect but success/failure is not yet known; requires controlled lookup, not blind retry.

Never use `connected`, `enabled`, `live`, `complete` or `successful` as substitutes when one of the more precise states above is intended.
