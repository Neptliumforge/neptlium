# @neptlium/app

Institutional capital operations dashboard for Neptlium.

## Purpose

Primary web application for institutional investors and operators — authenticated, role-gated, and built entirely on real Supabase data with no fake or hardcoded values.

## Folder Structure

```
app/
  (auth)/             → Unauthenticated auth pages (layout isolated)
    login/            → Sign-in entry point
    sign-up/          → Account creation (3-step OTP flow)
    signup/           → Sign-up redirect alias
    forgot-password/  → Password reset request
    reset-password/   → Password reset confirmation
    unauthorized/     → Role/access error display
    session-expired/  → Session expiry notice
    auth-error/       → Generic auth error fallback
  auth/
    confirm/          → Supabase OTP/email link callback handler
  dashboard/          → Authenticated app shell (requires provisioned user)
    page.tsx          → Overview: KPI cards, recent activity, quick actions
    allocations/      → Capital allocation requests
    documents/        → Document vault
    notifications/    → Notification centre
    portfolio/        → Portfolio holdings and performance
    reports/          → Reporting
    research/         → Research materials
    risk/             → Risk dashboard
    settings/         → Account and app settings
    transactions/     → Transaction history
    treasury/         → Treasury account management
    wallet/           → Custody wallet — balances, deposits, withdrawals
    administration/   → Admin-only controls
  onboarding/         → Post-signup profile and compliance setup
  update-password/    → Authenticated password change
components/           → Shared React components (navigation, security, etc.)
lib/                  → App-local utilities (auth guards, Supabase clients)
```

## Quick Start

```bash
# From monorepo root — development (port 3001)
pnpm --filter @neptlium/app dev

# Build
pnpm --filter @neptlium/app build

# Typecheck
pnpm --filter @neptlium/app typecheck

# Lint
pnpm --filter @neptlium/app lint
```

Or via Turborepo to include workspace dependencies:

```bash
npx turbo run dev --filter=@neptlium/app...
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=https://app.neptlium.com
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the Supabase anon key (renamed from the legacy `ANON_KEY` convention). A `SUPABASE_SERVICE_ROLE_KEY` is **not** used in this app — privileged writes go through SECURITY DEFINER SQL functions called via the authenticated client.

## Architecture

- **Next.js 16 App Router** — server components by default; `"use client"` only for interactivity
- **`@neptlium/lib`** — auth guards (`requireUser`, `requireProvisionedUser`, `requireRole`), Supabase client factories, custody provider abstraction (`CustodyProvider` interface + `InternalLedgerCustodyProvider`)
- **`@neptlium/ui`** — design system: `AppShell`, `Sidebar`, `MobileNavigation`, `Badge`, `Button`, `Card`, tokens
- **`@neptlium/config`** — shared ESLint and TypeScript configs
- **Custody writes via RPC** — `provision_deposit_address` and `request_wallet_withdrawal` are SECURITY DEFINER Postgres functions; no direct INSERT from the client

## Key Pages

| Route | Description |
|---|---|
| `/login` | Sign-in |
| `/sign-up` | Account creation (email → OTP → profile) |
| `/auth/confirm` | OTP/magic-link callback |
| `/onboarding` | Compliance profile setup |
| `/dashboard` | Overview with KPI cards and recent activity |
| `/dashboard/wallet` | Custody balances, provider addresses, withdrawals |
| `/dashboard/portfolio` | Holdings and performance |
| `/dashboard/allocations` | Capital allocation requests |
| `/dashboard/transactions` | Full transaction history |
| `/dashboard/treasury` | Treasury accounts |
| `/dashboard/administration` | Admin controls (role-gated) |

## Auth Flow

1. User signs up → OTP email sent via Resend
2. OTP verified at `/auth/confirm` → Supabase session created
3. New users redirected to `/onboarding` to complete their profile
4. `requireProvisionedUser()` guards all dashboard routes — redirects to `/onboarding` if profile incomplete, `/unauthorized` if role check fails
