# Architecture

Neptlium is a pnpm and Turborepo monorepo for a crypto-first institutional capital platform.

## Applications

- `apps/web` is the canonical public site for `https://neptlium.com`. It is planned but is not currently present in this checkout.
- `apps/app` is the authenticated customer platform for `https://app.neptlium.com`.
- `apps/admin` is the internal operations console and is not part of customer navigation.

## Shared packages

- `@neptlium/ui` provides application shell and component primitives.
- `@neptlium/design-system` provides design tokens and Tailwind utilities.
- `@neptlium/lib` provides Supabase clients, authorization, custody abstractions, and validation.
- `@neptlium/types` provides shared domain contracts.
- `@neptlium/config` provides engineering configuration.

## Backend

Supabase Auth, PostgreSQL, Row Level Security, Storage, and migrations form the authoritative backend. Browser code uses publishable credentials and RLS. Service-role access remains server-only. Financial execution stays disabled until custody-provider, authorization, reconciliation, and audit controls are connected.

## Customer navigation

The customer shell contains exactly: Overview, Portfolio, Neptlium Wallet, Treasury, and Allocation.
