# Neptlium Platform Core v0.2

## Purpose

Platform Core is the shared authority layer beneath Neptlium Capital, Neptlium Treasury, Neptlium Institutional, and Neptlium Infrastructure. Product applications present workflows; they do not create independent financial truth.

## Canonical owner model

Every financial context resolves to one platform owner:

- `individual` — a natural person using Neptlium Capital;
- `organization` — a legal/operating entity using Neptlium Treasury or Institutional surfaces.

`platform_owners` is the canonical ownership registry. An owner subject is immutable after creation. Suspension or retirement changes authority without rewriting identity.

Organization access is never implied by authentication alone. A human user must have an active `organization_memberships` row for the exact organization, and the role must authorize the requested action.

Roles are intentionally separated:

- `owner` / `admin` — administration plus operation and approval;
- `operator` — operational preparation/execution workflow participation, but not approval;
- `approver` — approval, but not operational preparation authority;
- `viewer` / `auditor` — read-only contexts.

This separation is a foundation for maker/checker and higher-order policy rules. It is not, by itself, permission to move money.

## Financial authority

Neptlium has one canonical financial authority path:

1. authenticated principal;
2. resolved platform owner;
3. membership/role/policy evaluation when the owner is an organization;
4. governed financial intent;
5. approval and reservation where required;
6. external execution evidence;
7. canonical ledger journal/postings;
8. reconciliation;
9. immutable audit evidence.

A portfolio observation, blockchain event, provider webhook, semantic transaction classification, UI state, or authenticated browser session is evidence only. None may directly mutate canonical balance.

## Ledger

The existing `ledger_journals`, `ledger_accounts`, and `ledger_postings` remain the canonical double-entry system. Platform Core does not create a second ledger.

The v0.2 migration adds nullable `platform_owner_id` references to existing accounts and journals. This is deliberately additive so historical state is not rewritten without reviewed reconciliation.

A journal must:

- contain at least two postings;
- balance exactly in atomic integer units for each canonical asset;
- never cross platform-owner boundaries;
- be append-only, with corrections represented by reversals rather than mutation.

## Canonical assets

`canonical_assets` establishes deterministic identities using:

`<network_identifier>:<SYMBOL>:<normalized_contract_or_native>`

Examples:

- `ethereum-mainnet:ETH:native`
- `base-mainnet:USDC:0x...`

Asset presence in the registry never implies deposit, withdrawal, trading, custody, or payment capability. Capability enablement remains separately governed.

## Browser and service boundary

The new Platform Core tables have RLS enabled and are not directly granted to `anon` or `authenticated`. The customer-facing API resolves authenticated identity and accesses the control plane through trusted server credentials.

Service-role possession is not business authorization. API handlers must still resolve platform owner, membership, role, policy, idempotency, and resource scope before performing privileged operations.

## Migration stages

### A — Control-plane introduction

Create `platform_owners`, `organization_memberships`, `canonical_assets`, `platform_audit_events`, and nullable ledger owner references. No money-moving capability is activated.

### B — Reviewed owner provisioning

Provision individual and organization platform owners from authoritative identity records. Do not guess or infer ownership from loose metadata.

### C — Dual-write ownership

New canonical ledger accounts/journals receive both existing owner identifiers and `platform_owner_id`. Reconciliation confirms equivalent scope before tightening constraints.

### D — Mandatory canonical ownership

After full backfill/reconciliation, make `platform_owner_id` mandatory for owner-scoped ledger state and route all authorization through Platform Core.

### E — Legacy authority retirement

Retire obsolete owner semantics only after evidence proves no active production path depends on them. Historical migrations and immutable financial/audit history remain untouched.

## Non-goals of v0.2

This tranche does not enable custody, transfers, brokerage, payment submission, autonomous AI execution, or settlement claims. It establishes the authority model those capabilities must satisfy before they can be safely enabled.
