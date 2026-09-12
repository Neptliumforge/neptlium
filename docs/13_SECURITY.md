# NEPTLIUM Security — Remediation Mode

## Current security posture

The production audit confirmed useful fail-closed foundations but also identified live attack/correctness surfaces that must be closed before real-money launch.

## Immediate security priorities

1. Remove production authority from legacy money-mutating Edge Functions.
2. Remove client-side authority to create/mutate financial transaction truth.
3. Preserve default-deny access to canonical financial tables.
4. Minimize authenticated-callable `SECURITY DEFINER` RPC surface.
5. Complete Clerk identity cutover and contain legacy Supabase sessions.
6. Verify official provider webhook authentication and replay protection.
7. Audit production environment-variable presence/scope without exposing values.

## Supabase production findings

At the 2026-09-12 audit:

- many newer canonical financial tables had RLS enabled, no browser policies, and no `anon`/`authenticated` privileges; preserve this server-only/default-deny posture;
- seven treasury/identity `SECURITY DEFINER` functions were authenticated-callable; inspected treasury functions matched the authenticated Clerk principal to the requested actor and required `super_admin`, but the callable surface should still be reduced;
- leaked-password protection was disabled while Supabase Auth remained active;
- RLS performance/migration residue existed, including InitPlan warnings and duplicate permissive policies;
- multiple active Supabase publishable/legacy anon keys existed and should be rationalized after consumer inventory.

## Secret rules

Never expose:

- Supabase service-role/secret keys;
- provider API secrets;
- Circle entity secrets/signing material;
- Stripe webhook/secret keys;
- Clerk privileged secrets;
- private keys, KMS material, recovery data, cookies, bearer tokens, or sensitive provider payloads.

A secret audit records only presence, target environment, project/function scope, rotation status, and successful runtime use.

## Webhook security

Provider ingress must:

- use official signature/authentication verification;
- reject invalid/missing signatures;
- validate timestamp/replay requirements where the provider contract supports them;
- persist event identity before processing;
- enforce uniqueness/deduplication;
- be safe under repeated delivery;
- preserve raw evidence appropriately without leaking secrets or sensitive payloads to logs.

## Identity security

Clerk authentication must resolve to stable Neptlium principals. Authorization must use canonical server-side roles/compliance state. User-editable metadata must not grant privileges.

Until Supabase Auth is retired, legacy sessions must be prevented from reaching legacy financial mutation paths.

## Release rule

Security sign-off is impossible while gates 01-16 in `docs/15_PRODUCTION_READINESS_AUDIT.md` remain open. After those gates close, run a fresh production security audit and rewrite this document with final controls, threat model, incident procedures, and secret-rotation policy.
