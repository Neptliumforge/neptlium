# Clerk primary identity migration — production safety contract

Status: implementation branch only; **not approved for production deployment**.
Canonical application origin: https://app.neptlium.com
Repository application: apps/app; Vercel project: neptlium-app.

## Verified baseline
- The application currently uses Supabase Auth via `apps/app/proxy.ts` and `refreshSupabaseSession`.
- `apps/app/app/layout.tsx` has no Clerk provider; `apps/app/package.json` has no direct Clerk SDK dependency.
- Production Vercel has variables named `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; key validity, live/test classification, and issuer matching have NOT been verified.
- The canonical production origin is already asserted by `apps/app/lib/runtime-config.ts`.
- A verified domain does not establish a healthy production deployment.

## Required engineering gates (all mandatory)
1. Inventory Supabase Auth users, session entry points, server authorization checks, and Supabase RLS dependencies without disclosing credentials or personal data.
2. Specify immutable mapping between Clerk subject and existing internal user/tenant identifiers. Reject unlinked identities by default; never equate an unverified email address to ownership.
3. Verify Clerk production instance domain, authorized redirect URLs, session security and live key classification through safe, non-disclosing checks. Keep production secrets exclusively server-side.
4. Add and pin compatible `@clerk/nextjs` with a lockfile update. Implement Clerk provider, Next.js proxy authentication, sign-in/up, sign-out, server session validation, and API authorization on this branch.
5. Provide a deliberate migration/rollback path for existing Supabase sessions and user records; do not silently swap providers or bypass RLS.
6. Run unit, integration, authorization-isolation, redirect, build and browser E2E tests on Preview with nonproduction keys. Explicitly test unauthenticated, authenticated, expired, wrong-tenant, and rollback cases.
7. Obtain independent review and release approval; deploy only after all gates pass and production backups and recovery are certified.

## Hard restrictions
- No live-key values in source, logs, CI artifacts, or pull request comments.
- No automatic production deployment, database mutation, auth-provider cutover, or merging this draft.
- Never use Clerk authentication alone as a substitute for Supabase row-level or application authorization.
- Preserve existing Supabase authentication until a proven reversible migration is approved.

## Current acceptance status
Architecture baseline: inspected. Implementation: pending. Test evidence: pending. Production cutover: BLOCKED.
