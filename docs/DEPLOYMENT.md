# Deployment

Neptlium applications deploy independently from the monorepo while sharing packages and one Supabase backend.

- Public site: `apps/web` → `https://neptlium.com` (planned; absent from this checkout)
- Customer platform: `apps/app` → `https://app.neptlium.com`
- Internal console: `apps/admin` → restricted operations access

Set production environment values in the hosting provider, never in tracked files. Configure the customer origin and Supabase authentication redirects for `https://app.neptlium.com`.

Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` before a release. Review Supabase migrations separately and validate them against a disposable or staging database before any remote apply.

This document describes deployment boundaries only. It does not authorize a deployment or a database change.
