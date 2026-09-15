# Provider Rollback Runbook

If a provider capability is unsafe or degraded:

1. Disable the narrow affected execution/capability gate; avoid unrelated global shutdown when unnecessary.
2. Preserve durable Neptlium intents, provider evidence, provider references and audit history.
3. Stop blind retries for ambiguous externally mutating operations.
4. Perform controlled provider lookup and classify in-flight outcomes.
5. Reconcile confirmed/settled operations before changing customer-visible financial truth.
6. Keep provider health/degradation separate from canonical balances.
7. Correct canonical financial history only through governed reversals/compensating entries.
8. Remediate configuration/code/provider issue and rerun applicable release gates before re-enabling.
9. Record exact production evidence and validation status.

Never delete provider evidence or rewrite ledger history to make a rollback appear clean.
