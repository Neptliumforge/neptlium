# Provider Governance

## Strategic set

The current strategic financial/chain provider set is Circle, Alchemy and Stripe. Adding another strategic provider is an architecture decision, not an incidental SDK installation.

## Change requirements

A provider change must state:

- capability being added/replaced;
- why the existing strategic provider set is insufficient;
- financial authority impact;
- data/security impact;
- failure/recovery model;
- ledger/reconciliation impact;
- migration/rollback plan;
- product-surface impact;
- production certification plan.

## No accidental provider drift

Open branches and historical code may mention previous or experimental providers. Such references do not become canonical merely by being merged through unrelated work. Any active provider-specific assumption outside the strategic set must be removed, isolated as historical evidence, or explicitly approved as a new provider decision.

## Provider replacement

Because Neptlium owns domain identity, intents, ledger and reconciliation, replacing an external provider should occur at adapter/capability boundaries. Product applications should not require a domain rewrite merely because infrastructure changes.

## Emergency controls

Neptlium must be able to disable a provider capability without corrupting canonical state. In-flight intents remain recoverable and auditable; provider degradation never licenses silent duplicate execution.
