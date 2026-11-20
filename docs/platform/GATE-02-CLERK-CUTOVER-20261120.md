# Gate 02 — Clerk authentication cutover (implementation gate)

Status: **BLOCKED — production registration fails; no production cutover authorized.**

## Verified production defect
- `app.neptlium.com/auth/sign-up` displays the generic account-creation error.
- On `main`, `apps/app/app/auth/sign-up/page.tsx` and sign-in import `SupabaseAuthForm`.
- `SupabaseAuthForm` invokes `supabase.auth.signUp`, logs only the error code to the browser console, and replaces the failure with the observed generic text.
- Production Vercel has Clerk environment variable names, but the deployed entry pages do not use Clerk.
- Existing branch `app/clerk-identity-production-cutover` is **830 commits behind main**; do not merge or deploy it directly.
- Existing PR #158 is a fail-closed principal identity gate, **not** a complete production onboarding cutover.

## Implementation sequence (preview only)
1. Rebase/cherry-pick *reviewed individual changes*, not the stale cutover branch. Reconcile with PR #158 and the existing independent JWT verifier, durable principal mapping and tenant membership authorization.
2. Pin `@clerk/nextjs` to a reviewed version compatible with Next.js 16 and update the workspace lockfile. Verify Clerk's current documentation and security advisories before release.
3. Add ClerkProvider and Next.js proxy/middleware to the app without regressing theme, runtime-config checks, public routes or protected-route fail-closed behavior.
4. Replace the SupabaseAuthForm entry pages with Clerk SignIn/SignUp, preserving validated internal redirect destinations and never accepting open redirects.
5. Implement a server-only, idempotent post-sign-up identity bootstrap that creates/links an API-owned principal only after verified Clerk identity. Do not treat email equality as account ownership or grant organization membership implicitly. Existing customer linking requires explicit proof of control and reconciliation.
6. Keep Supabase as the database; remove customer-facing Supabase Auth session authority only after the Clerk identity resolver and all protected API routes enforce the same verified principal. Never expose service-role keys to browsers.
7. Update obsolete tests asserting SupabaseAuthForm, add negative-path tests for forged JWT, wrong issuer/audience/azp, missing principal, wrong tenant, duplicate signup, replay and bootstrap failure.
8. Configure **Preview-only** Clerk publishable/secret keys in Vercel via secure settings; never commit credentials or print decrypted values.
9. Run install, lint, typecheck, tests, build and Preview end-to-end sign-up, email verification, sign-in, logout, session persistence, onboarding, dashboard and rollback checks.
10. Require reviewed evidence, a backup/recovery plan and explicit production approval before any production promotion or auth-data migration.

## Release blockers
- No successful registration or authenticated dashboard verification.
- Preview Clerk credentials not confirmed.
- Vercel Git integration may still reference the former repository owner; confirm the organization installation and Preview build path.
- Identity bootstrap, existing-account linking and database membership invariants require evidence.
- Do not merge, deploy, alter production Supabase, or enable financial execution as part of this preparation.
