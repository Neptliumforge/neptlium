# Provider Migration Policy

Provider migrations must preserve canonical Neptlium identity and financial history.

A migration may change external identifiers, adapter routing or infrastructure, but must preserve or explicitly map Neptlium-owned intent IDs, ledger references, reconciliation evidence and audit history.

During migration, dual observation may be acceptable when explicitly designed; dual uncontrolled execution is not.

The Base-only to multi-chain Alchemy transition must therefore add network-aware configuration/evidence while keeping existing production behavior fail-closed until each network is independently certified.

Provider migrations must be reversible at the capability-routing layer wherever practical and must not require rewriting historical ledger truth.
