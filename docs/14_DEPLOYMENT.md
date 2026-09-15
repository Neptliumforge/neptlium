# Deployment

Neptlium deploys independently versioned application boundaries from `Neptliumforge/neptlium`. Current repository applications may include Web, App, Neptlium Treasury, Pay, Docs, Status, Admin, and API; deploy only applications that actually exist and are configured.

## Authentication deployment model

Supabase Auth is the sole active authentication/session provider across App, Admin, authenticated Neptlium Treasury surfaces, and authenticated API requests.

Required runtime principles:

- Browser applications use `NEXT_PUBLIC_SUPABASE_URL` and the publishable client key only.
- Server components use reviewed Supabase SSR/server-session helpers.
- API verifies Supabase access tokens and resolves the immutable authenticated subject to a stable Neptlium principal.
- No alternate runtime authentication mode is supported.
- Supabase service-role values remain server-only persistence/infrastructure authority and are never browser credentials.
- Historical identity-provider rows may remain as migration evidence but are inert for runtime authentication.

Identity cutover migrations are forward database migrations and must be applied through the normal separately reviewed migration process. Application deployment must not silently apply database migrations.

## Existing-account continuity

Before declaring the authentication migration complete in production, verify:

1. current principal/ownership UUIDs are preserved;
2. each active Supabase Auth user resolves to exactly one active Neptlium principal;
3. no conflicting active identity mappings remain;
4. the approved forward migration is applied;
5. existing-user, new-user, recovery/session, role, ownership and logout smoke tests pass;
6. retired-provider credentials are no longer accepted anywhere in runtime.

## Environment boundaries

### Web

No privileged authentication or financial secrets.

### App

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and server-only `NEPTLIUM_API_URL` as required. No service-role or provider secrets.

### Neptlium Treasury

Browser-safe Supabase Auth configuration plus application/API origins. Organization, treasury, approval and payment authority remain server-owned.

### Admin

Browser-safe Supabase Auth configuration plus Admin/API origins. Operator role and financial authorization remain API concerns.

### API

Server-only configuration includes Supabase token verification/principal resolution, durable database persistence, service-role infrastructure, providers, webhook secrets, allowed origins, capability gates and observability.

### Pay / Docs / Status

Keep these applications public/minimally privileged unless a reviewed feature explicitly requires authentication. Provider and financial secrets remain outside these clients.

## Provider and financial release principles

- Configuration presence does not prove capability.
- Capability verification does not itself authorize live execution.
- Provider observations remain evidence until canonical posting/reconciliation.
- Stripe webhook support does not imply capital-funding support.
- Crypto deposit networks/assets and fiat funding rails are enabled only from verified server capability state.
- Preview/staging must not point at production financial execution by convenience.

## Build and release gates

Run typecheck, lint, tests and production builds proportionate to each changed workspace. Identity/financial changes additionally require negative authorization tests, migration review, idempotency/replay tests, provider sandbox verification where applicable, webhook verification, reconciliation checks, observability and secret-redaction review.

A Vercel READY/SUCCESS state proves deployment completion, not financial capability certification.

Browser release QA should prefer local production builds where possible so visual validation is not coupled to preview authentication or deployment queues.

## Database migrations

- Never rewrite applied migrations.
- Use forward-only reviewed corrective migrations.
- Review privilege, locking, RLS, backfill, reversibility and environment scope.
- Application deployment and migration application are separate approvals.

## Canonical domains

Configured production domains should map one-to-one to their authoritative application owners, for example:

- `https://neptlium.com`
- `https://app.neptlium.com`
- `https://treasury.neptlium.com`
- `https://pay.neptlium.com`
- `https://docs.neptlium.com`
- `https://status.neptlium.com`
- `https://admin.neptlium.com`
- `https://api.neptlium.com`

Only claim or configure domains that actually exist in Vercel/DNS. Auth redirect origins, API origins and production links must agree with the deployed model.
