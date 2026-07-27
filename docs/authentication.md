# Authentication

Neptlium uses Supabase Auth for identity and sessions, PostgreSQL profiles for application state, and RLS for data authorization. Authentication lives at `https://app.neptlium.com`; the marketing and admin deployments are separate boundaries.

## Flow

Users register or sign in through routes implemented under `apps/app/app/(auth)`. Supabase establishes the session, request middleware refreshes it, and server guards route users through onboarding and role checks. Password recovery returns through `/auth/confirm` and `/update-password`. Dashboard access requires an authenticated, provisioned user.

Email delivery is configured outside this repository. Resend may be used through Supabase SMTP, but repository code and documentation must not be treated as proof that provider or DNS configuration is complete.

## Clients and authorization

`@neptlium/lib` provides browser, request-scoped server, middleware, and server-only admin Supabase clients. Browser clients use publishable credentials and RLS. UI visibility is not authorization. Privileged role assignment and cross-user access require trusted server logic and database policy.

## Variables

Browser-safe:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Server-only where a trusted server workflow actually requires it:

- `SUPABASE_SERVICE_ROLE_KEY`

Never expose server-only values to browser code or logs. Configure allowed production redirects for `https://app.neptlium.com` and explicit local/preview origins in Supabase through a separately authorized process. Do not modify remote Supabase as part of repository work.
