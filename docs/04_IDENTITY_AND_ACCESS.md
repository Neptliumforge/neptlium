# NEPTLIUM Identity and Access — Remediation Mode

## Current production state

NEPTLIUM is in an identity transition. Clerk is the target browser/session authority for App/Admin, while canonical Neptlium principal UUIDs remain the ownership identity inside the platform. Supabase Auth is not yet fully retired.

At the 2026-09-12 audit:

- 16 Supabase Auth users existed;
- 16 active `SUPABASE_AUTH` subject mappings existed;
- 5 active Clerk subject mappings existed;
- one super-admin role existed.

Therefore production must not be documented as Clerk-only yet.

## Canonical identity model

```text
external identity provider subject
  -> identity_provider_subjects
  -> identity_principal UUID
  -> profile / ownership / roles / compliance / audit
```

External provider identifiers are authentication evidence. The stable Neptlium principal UUID is the canonical internal identity used by financial ownership and audit records.

## Authorization rules

- browser authentication does not grant financial authority;
- role and compliance decisions come from canonical server-side state;
- user-editable JWT metadata must never grant privileged access;
- Admin financial commands require server-side role checks and separation of duties;
- suspended/revoked principals must fail closed;
- API issuer/audience/JWKS/expiry/subject validation must be explicit and tested.

## Clerk cutover execution

Gate 15 in `docs/15_PRODUCTION_READINESS_AUDIT.md` remains open until:

1. every retained production principal has an intentional identity mapping/status;
2. existing-user dual-session linking is proven;
3. new-user bootstrap is proven;
4. Clerk lifecycle webhook behavior is proven;
5. recovery/MFA/operator access is exercised as applicable;
6. legacy Supabase Auth is removed from ordinary product access;
7. retired Supabase sessions cannot invoke legacy financial paths;
8. App/Admin/API documentation and runtime configuration agree.

## Supabase Auth containment

While Supabase Auth remains live:

- enable appropriate password protections;
- keep legacy sessions away from canonical financial mutation authority;
- do not add new product features that depend on Supabase Auth;
- treat legacy identity paths as migration-only.

## Privileged RPCs

Authenticated-executable `SECURITY DEFINER` functions must validate the real authenticated principal internally and should be minimized. Privileged financial commands should converge on Admin/App -> API -> service-side database execution.

## Final rewrite

After Gate 15 and the overall release gate are complete, rewrite this document with the final Clerk-only authentication contract, final recovery model, final operator authorization model, and the retired Supabase Auth history.
