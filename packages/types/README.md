# @neptlium/types

`@neptlium/types` is the shared domain model package for Neptlium. It centralizes typed interfaces and reusable domain contracts across the monorepo to support institutional capital operating software.

## Purpose

- Provide a single source of truth for shared domain models.
- Prevent duplicate interface definitions across applications and packages.
- Enforce explicit, immutable, production-ready types for core business domains.

## Domain organization

The package is organized by bounded contexts:

- `Authentication` — user identity, session state, roles, permissions.
- `Common` — API payloads, pagination, metadata, error shaping.
- `Investor` — investor profile, organization, and entity details.
- `Portfolio` — portfolio composition, holdings, performance, allocation.
- `Treasury` — accounts, wallets, ledger entries, transactions, balances.
- `Operations` — notifications, audit logs, workflow activity.
- `Risk` — scores, exposures, alerts.
- `Documents` — document metadata and attachments.
- `Database` — shared database utility types and Supabase schema placeholder.

## Export strategy

This package exposes a flat public API from the package root. Consumers can import any shared model directly:

```ts
import { Portfolio, User, Notification, ApiResponse } from "@neptlium/types";
```


## Dependency rules

- `@neptlium/types` is a pure type package and does not implement application logic.
- No Supabase client behavior is defined here; only shared database types and schema utilities.
- This package is intended to be consumed by `@neptlium/lib`, `@neptlium/ui`, and application layers.

## Usage examples

```ts
import { Investor, Portfolio, Transaction, ApiResponse } from "@neptlium/types";

const response: ApiResponse<Portfolio> = {
  status: "success",
  data: {
    id: "portfolio-123",
    investorId: "investor-456",
    name: "Global Growth",
    currency: "USD",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
```


## Build

Use the package scripts from the package root:

```bash
pnpm --filter @neptlium/types build
pnpm --filter @neptlium/types typecheck
pnpm --filter @neptlium/types lint
```
