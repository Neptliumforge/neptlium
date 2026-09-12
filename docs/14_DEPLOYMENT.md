# Deployment

Neptlium deploys four independently versioned application boundaries from `Neptliumforge/neptlium`:

| Application | Domain | Boundary |
| --- | --- | --- |
| `apps/web` | `neptlium.com` | Public institutional marketing |
| `apps/app` | `app.neptlium.com` | Authenticated customer application |
| `apps/admin` | `admin.neptlium.com` | Operator application |
| `apps/api` | `api.neptlium.com` | Authorization, data, provider, ledger, webhook and audit boundary |

## Authentication deployment model

Clerk is the only authentication/session provider across App, Admin and authenticated API requests.

Required runtime principles:

- App/Admin use Clerk publishable and server secret configuration.
- API verifies Clerk bearer tokens and restricts authorized parties to approved Neptlium origins.
- No `SUPABASE`, `DUAL`, or legacy password-link runtime authentication mode is supported.
- Supabase configuration in API/server infrastructure is persistence-only and must not be interpreted as authentication configuration.
- Historical legacy identity rows may remain in the database but are inert for runtime authentication.

The Clerk-only identity cutover migration is a forward database migration and must be applied through the normal separately reviewed migration process. Application deployment must not silently apply database migrations.

## Existing-account continuity

Before enabling Clerk-only bootstrap in production, verify:

1. current principal/ownership UUIDs are preserved;
2. exact normalized profile-email matches are unique;
3. no existing principal has conflicting active Clerk mappings;
4. the forward bootstrap migration is applied;
5. existing user, new user, MFA/recovery, role and ownership smoke tests pass;
6. legacy Supabase Auth credentials are no longer accepted anywhere in runtime.

## Environment boundaries

### Web

No privileged authentication or financial secrets.

### App

Clerk publishable/server configuration plus `NEXT_PUBLIC_SITE_URL` and `NEPTLIUM_API_URL`. No Supabase browser/auth variables and no provider/service-role secrets.

### Admin

Clerk publishable/server configuration plus Admin/API origins. Operator role and financial authorization remain API concerns.

### API

Server-only configuration includes Clerk verification, durable database persistence, providers, webhook secrets, allowed origins, capability gates and observability. Supabase URL/service-role values may support persistence, but user authentication is Clerk-only.

## Provider and financial release principles

- Configuration presence does not prove capability.
- Capability verification does not itself authorize live execution.
- Provider observations remain evidence until canonical posting/reconciliation.
- Stripe subscription webhook support does not imply Stripe capital funding support.
- Crypto deposit networks/assets and USD deposit rails are enabled only from verified server capability state.
- Preview/staging must not point at production financial execution by convenience.

## Build and release gates

Run typecheck, lint, tests and production builds proportionate to each change. Identity/financial changes additionally require negative authorization tests, migration review, idempotency/replay tests, provider sandbox verification, webhook verification, reconciliation checks, observability and secret-redaction review.

A Vercel READY/SUCCESS state proves deployment completion, not financial capability certification.

## Database migrations

- Never rewrite applied migrations.
- Use forward-only reviewed corrective migrations.
- Review privilege, locking, RLS, backfill, reversibility and environment scope.
- Application deployment and migration application are separate approvals.

## Canonical domains

- `https://neptlium.com`
- `https://app.neptlium.com`
- `https://admin.neptlium.com`
- `https://api.neptlium.com`

All auth authorized-party configuration, redirects, API origins and production links must agree with this model.
