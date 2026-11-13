# Clerk Preview identity integration — Phase 1 verification ledger

Status: SOURCE IMPLEMENTED; DATABASE AND RUNTIME NOT CERTIFIED. No production cutover.

## Resolved relationship

A verified Clerk subject resolves to an ACTIVE `identity_provider_subjects` CLERK row. Its `principal_id` resolves to an ACTIVE `identity_principals` record. The SAME principal must have exactly one ACTIVE SUPABASE_AUTH subject, which is an `auth.users.id` UUID. `organization_memberships.user_id` references that Supabase Auth UUID, NOT the Neptlium principal. The organization membership must match the requested organization and be active, non-suspended and non-revoked. Any missing, ambiguous or unavailable data denies access.

The preview-only implementation is `apps/api/src/clerk-preview-identity.ts`. It is NOT registered as the production `createPrincipalAuthenticator` in `apps/api/src/app.ts`. In particular, do not use its tenant decision as a substitute for per-resource authorization or financial execution policy.

## Evidence and blocker

On 2026-11-12 a read-only query of Supabase project **Neptlium Dev** (`ntbaoylcrwkowqqvzkno`) found no public application tables: `identity_provider_subjects`, `identity_principals`, `organization_memberships`, and `organizations` were absent. The dev database therefore cannot support live integration tests yet. Do not run migrations against the production Supabase project (`udghxwlhztwxvkjaefjh`).

Fixture-based tests are in `apps/api/test/clerk-preview-identity.test.mjs`. Test execution, typecheck, actual schema presence, migration applicability, Clerk Preview JWKS/key rotation, API wiring, and Preview deployment remain unverified.

## Required next steps

1. Prepare and review the dependency-ordered application schema migration plan for the isolated Dev database; confirm the full migration history and backup/restore readiness before applying.
2. After schema installation, create disposable test users, identity principals, CLERK and SUPABASE_AUTH links and organization memberships **only in Dev**. Verify allowed, missing, duplicate, revoked, suspended, cross-tenant and unavailable scenarios.
3. Run API build/typecheck/unit tests and verify the live Preview issuer, audience, authorized party and JWKS rotation using nonproduction credentials.
4. Add an isolated, read-only Preview route or dedicated Preview middleware. Do not globally replace the existing Supabase authenticator or authorize financial routes.
5. Review CI, Vercel build-rate-limit failure and deployment evidence; obtain independent security review before merge.

## Security notes

Never auto-link by email; never infer membership from a Clerk organization claim; never expose service-role credentials; never accept a caller-supplied principal or organization as verified. No change to production auth, ledger, payments, domains or credentials is authorized.
