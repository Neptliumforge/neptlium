# Deployment

Neptlium has four independently deployable application boundaries. This document records repository intent; it does not claim a particular remote deployment or environment variable is currently configured.

## Applications

| Application  | Domain               | Boundary                                                                              |
| ------------ | -------------------- | ------------------------------------------------------------------------------------- |
| `apps/web`   | `neptlium.com`       | Public website; no privileged financial authority.                                    |
| `apps/app`   | `app.neptlium.com`   | Authenticated customer application.                                                   |
| `apps/admin` | `admin.neptlium.com` | Role-gated internal operations console.                                               |
| `apps/api`   | `api.neptlium.com`   | Versioned API, provider, repository, webhook, worker, and financial-control boundary. |

The API application exists now. Its Vercel configuration builds the TypeScript service and routes requests through `api/index.js`; it is not a future-only component.

## CURRENT repository deployment model

- Each app has its own package, root directory, example environment file, and Vercel configuration.
- Web, app, and admin are Next.js applications with security headers.
- API is a Node.js/TypeScript serverless service with `/v1` routes and explicit runtime configuration.
- Supabase migrations are a separately reviewed, append-only deployment stream. Application deployment must not silently apply migrations.
- This documentation phase changes no remote project, domain, environment variable, provider credential, or database.

## Environment boundaries

### Public web

No environment variable is currently required. If introduced, only genuinely browser-safe values may use `NEXT_PUBLIC_*`. Public web never receives service-role or provider secrets.

### Authenticated app

Browser-safe current inputs include Supabase URL/publishable key and site URL. `NEPTLIUM_API_URL` is server-side routing configuration for the app-to-API boundary. The customer app does not require the service-role key.

### Admin

Browser-safe Supabase URL/publishable key and site URL are separate from the server-only service-role key. The admin root must never expose the service role to client components or logs.

### API

Server-only configuration covers runtime/build identity, allowed origins, Supabase Auth/data access, Circle, legacy Alchemy/Coinbase webhook groundwork, and provider verification. Mainnet is disabled by code. Circle requires complete testnet configuration and fails closed otherwise.

Future Clerk and Stripe variables are TARGET only and must not be added until their reviewed implementation phase.

## Environment principles

- Separate development, preview/staging, and production projects and credentials.
- Use least-privilege, app-specific variables; do not share a broad `.env` across app roots.
- Never commit real secrets or print them during validation.
- Preview must not point at production financial execution by convenience.
- Provider environment and database environment must agree; mixed testnet/production configurations fail closed.
- Configuration presence does not prove provider health or capability.
- Rotate and revoke credentials through provider/platform controls, not source edits.
- Remote environment mutation requires explicit instruction, approval, and rollback planning.

## Build and release gates

At minimum, run repository-supported formatting, lint, typecheck, tests, and builds proportionate to the change. Financial/provider changes additionally require:

- migration dry-run and review;
- ownership/RLS and negative authorization tests;
- idempotency, concurrency, replay, timeout, and retry tests;
- balanced-ledger and append-only tests;
- provider sandbox/testnet verification;
- webhook official-contract verification;
- reconciliation and rollback/compensation rehearsal;
- observability and secret-redaction review.

No capability is advertised as live from a successful build alone.

## Database migrations

- Do not modify applied migration files.
- Add forward-only corrective migrations with explicit review.
- Review privilege, RLS, locking, data backfill, reversibility, and environment scope.
- Apply staging first and verify invariants before production.
- Application deploy and migration apply are separate approvals.

## Rollback

Code rollback must remain compatible with the deployed schema. Financial events already accepted are not erased by rollback. Use forward fixes, disabled capability flags, compensating entries, reconciliation, and provider lookup as appropriate.

The containment rollback reference under `docs/security` must not be executed automatically.

## TARGET changes

Clerk identity and Stripe funding/Onramp will require separately reviewed variables, callback/webhook origins, secrets, deployment sequencing, and rollback plans. Their mention here is architectural direction, not current configuration.
