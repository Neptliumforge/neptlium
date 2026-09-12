# NEPTLIUM Treasury — Remediation Mode

## Authority

Treasury state is a governed operational and accounting domain. A configured wallet/address/provider does not make a treasury rail live. Treasury availability requires verified destination ownership, provider connectivity, settlement evidence, ledger state, and reconciliation.

## Current production state

The production database contains the newer treasury-destination governance model, but at the 2026-09-12 audit there were no production `treasury_destinations` records and no canonical funding/transfer lifecycle had been exercised.

Authenticated treasury RPCs currently enforce Clerk-principal matching and `super_admin` checks. That is a useful defense, but privileged treasury mutations should continue converging on Admin -> API -> service-side database execution.

## Required remediation

Treasury readiness depends on:

- disabling legacy money paths;
- completing provider submission and webhook ingress;
- creating and verifying intentional treasury destinations;
- proving settlement evidence and reconciliation;
- proving omnibus backing;
- minimizing browser-callable privileged RPC surface;
- verifying production provider/environment secrets and scopes.

## Destination lifecycle

Self-custody treasury destinations must remain inactive until ownership verification is proven. Activation must fail closed while operational readiness evidence is incomplete.

Suspension/retirement must also suspend or revoke dependent deposit routes.

## Backing invariant

For every supported asset/network:

```text
customer settled claims <= reconciled treasury assets
customer pending claims <= provider-confirmed pending treasury assets
```

These are accounting safety invariants, not dashboard metrics.

## Final rewrite

After gates 08-16 are complete, rewrite this document with the final custody model, treasury-destination activation contract, supported networks/assets, provider evidence model, and operational runbooks.
