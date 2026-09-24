# Neptlium Product Hierarchy

This document is the canonical naming and product-family contract for Neptlium.

## Master brand

**Neptlium** is the company and platform brand. Product names extend the master brand; they do not create disconnected sub-brands.

Canonical definition: **Neptlium is a capital operating platform for individuals and institutions.**

Public audience language is organized as Individuals, Institutions, Investments and Company. This navigation language does not collapse the durable Capital, Treasury, Institutional and Infrastructure product boundaries below.

## Long-term hierarchy

### Neptlium Capital

Audience: individuals and personal investors.

Primary responsibilities:

- investing;
- personal portfolio visibility;
- wealth and allocation context;
- personal activity and records.

Canonical authenticated application: `apps/app` at `https://app.neptlium.com`.

### Neptlium Treasury

Audience: businesses, finance teams and treasury operators.

Primary responsibilities:

- business treasury;
- payments and receivables;
- stablecoin operations;
- counterparties;
- approvals and policy;
- risk and controls;
- organization reporting and auditability.

Canonical authenticated application: `apps/treasury` at `https://treasury.neptlium.com`.

The root owner is an organization. Human authentication does not itself grant treasury authority. Membership, role, permissions, policy and approval state remain server-owned authorization concerns.

### Neptlium Institutional

Audience: funds, family offices, asset managers and other institutional operators.

This is a long-term product pillar, not a claim of currently deployed capability. It may share infrastructure with Neptlium Treasury while maintaining explicit institutional account, control, reporting and API contracts.

Primary responsibilities:

- institutional account structures;
- institutional controls and approvals;
- advanced reporting;
- programmatic APIs and operational integrations.

No standalone production domain is canonical until a corresponding application is implemented and deployed.

### Neptlium Infrastructure

Audience: developers, integrators and platform operators.

Primary surfaces:

- **Neptlium Pay** — `apps/pay`, `https://pay.neptlium.com`;
- **Neptlium API** — `apps/api`, `https://api.neptlium.com`;
- **Neptlium Docs** — `apps/docs`, `https://docs.neptlium.com`;
- **Neptlium Status** — `apps/status`, `https://status.neptlium.com`.

Infrastructure surfaces expose product capabilities without collapsing authentication, authorization, custody, execution, settlement, ledger and reconciliation boundaries.

## Platform topology

```text
NEPTLIUM
│
├── Capital
│   ├── Individuals
│   ├── Investing
│   ├── Portfolio
│   └── Wealth
│
├── Treasury
│   ├── Businesses
│   ├── Payments
│   ├── Stablecoins
│   ├── Approvals
│   └── Policies
│
├── Institutional
│   ├── Funds
│   ├── Family offices
│   ├── Asset managers
│   └── APIs
│
└── Infrastructure
    ├── Pay
    ├── API
    ├── Docs
    └── Status
```

## Naming rules

1. Customer-facing product names use the `Neptlium <Product>` pattern.
2. The business treasury product is named **Neptlium Treasury** everywhere: source, UI, docs, tests, package identity and deployment topology.
3. New product names require an update to this document and `packages/types/src/product-family.ts` in the same reviewed change.
4. Marketing category labels such as “Business” or “Individuals” describe audiences; they are not product names.
5. Product names must not imply unsupported custody, banking, yield, settlement, regulatory or execution capability.

## Ownership boundary

Financial objects retain explicit owner semantics:

```text
owner_type = INDIVIDUAL | ORGANIZATION
owner_id   = stable owner identifier
```

Neptlium Capital is personal wealth. Neptlium Treasury is organizational capital. The same authenticated human may eventually access both, but the financial contexts remain isolated.
