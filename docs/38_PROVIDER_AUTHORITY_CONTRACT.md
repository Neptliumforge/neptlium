# Provider Authority Contract

All Circle, Alchemy and Stripe responses enter Neptlium as non-canonical provider evidence unless a more specific server-side contract classifies a field as operational metadata only.

Provider evidence carries provider identity, provider reference, observation time, network/rail where relevant and normalized payload. The evidence object itself cannot claim canonical financial authority.

Canonical financial state is produced only through Neptlium-owned authorization, lifecycle, ledger posting and reconciliation contracts.

This rule is enforced in the API foundation through the provider doctrine/evidence modules and regression tests.
