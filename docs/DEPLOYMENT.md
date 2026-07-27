# Deployment

Each Next.js application is a separate Vercel project. Configure Root Directory in Vercel and rely on framework detection and the root pnpm lockfile.

| Vercel project   | Root Directory | Production domains                 |
| ---------------- | -------------- | ---------------------------------- |
| `neptlium-web`   | `apps/web`     | `neptlium.com`, `www.neptlium.com` |
| `neptlium-app`   | `apps/app`     | `app.neptlium.com`                 |
| `neptlium-admin` | `apps/admin`   | `admin.neptlium.com`               |

A future `neptlium-api` project is not created on this branch. It will be separate at `api.neptlium.com`; see [API Foundation](API_FOUNDATION.md).

## Git integration and previews

Connect each project to this repository and its listed Root Directory. Enable pull-request preview deployments and production deployments only from the protected production branch. Keep preview domains non-authoritative and out of production DNS. Require CI before merge and production promotion. Review Vercel ignored-build behavior so changes to shared packages rebuild affected apps.

Preview authentication needs explicitly approved Supabase redirect URLs; never broaden production redirects without review. Admin previews remain access-controlled.

## Environment categories

- Public website: public site/origin configuration only if consumed.
- Authenticated app: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.
- Admin: browser-safe Supabase variables consumed by the app plus server-only `SUPABASE_SERVICE_ROLE_KEY` only where the existing trusted admin runtime requires it.
- Future API: server-only provider and service credentials documented in [API Foundation](API_FOUNDATION.md).

Separate Development, Preview, and Production values. Never copy production secrets into previews, expose server keys with `NEXT_PUBLIC_`, or store secret values in Git. Missing Coinbase CDP or Alchemy credentials do not block these frontend deployments because neither integration is complete.

## First deployment checks

1. Confirm project name, Root Directory, framework detection, Node/pnpm version, install from the frozen root lockfile, and no manual output directory override.
2. Confirm CI typecheck, lint, configured tests, and all three Linux builds pass.
3. Verify security headers, page rendering, assets, robots/sitemap behavior, canonical URLs, and no unexpected redirects.
4. For app/admin, verify missing-variable failure behavior, Supabase connectivity, sign-in/out, authorization boundaries, callback URLs, cookie security, and tenant/role isolation.
5. Verify mobile navigation, keyboard focus, error/loading states, logs, analytics consent behavior, and absence of secret values or fabricated financial data.
6. Smoke-test preview first, then production using a documented checklist and accountable approver.

## DNS sequencing

Deploy and verify the Vercel-generated domain first. Add the domain to the correct Vercel project, verify ownership, then create the requested DNS records with a controlled TTL. Attach `www.neptlium.com` to `neptlium-web` and choose one canonical redirect direction. Confirm TLS issuance and HTTP/HTTPS/canonical behavior before changing user-facing links. Sequence app and admin subdomains independently. Do not create `api.neptlium.com` until the separate API project exists and passes its deployment gates.

## CI gates

Required gates are frozen-lockfile install, workspace typecheck, workspace lint, configured tests, and Linux production builds for web, app, and admin. Add secret scanning, dependency review, and migration review where applicable. Supabase migrations use a separate reviewed staging process; a frontend deployment does not authorize remote migration application.

## Rollback

Retain the last known-good Vercel deployment for each independent project. If a release fails verification, stop promotion or immediately reassign the production alias to that known-good immutable deployment. Record the failing deployment, scope, and checks; preserve logs and database state. Frontend rollback must not revert append-only migrations or remote Supabase data. Re-run smoke, auth, authorization, and domain checks after rollback before reopening promotion.

## Future API separation

The API has its own project, domain, secrets, release gates, observability, rollback, and provider-webhook lifecycle. Frontend projects must not absorb API runtime code or provider secrets. Provider webhooks are configured only after deployed API endpoints verify signatures and reliably return verified 2xx responses. This document authorizes no deployment, project linking, DNS change, or remote database change.
