# NEPTLIUM Deployment — Remediation Mode

## Release posture

A successful build or deployment does not prove financial production readiness. Deployment is only one step inside the remediation gates defined in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

## Current production topology

The repository deploys separate Web, App, Admin, and API surfaces. Production Supabase is active and contains the newer governed financial schema. The connected Vercel audit path currently exposes the Neptliumforge team but no projects, so production Vercel environment-variable metadata is not yet independently certified.

## Deployment rules during remediation

- deploy only focused changes needed to close a remediation gate;
- do not enable real-money capability merely because code is deployed;
- preserve explicit provider/environment feature gates;
- do not expose secret values during verification;
- after any migration/configuration change, verify runtime behavior and database state;
- legacy Edge Functions must be disabled/removed in production as their gates close;
- rollback must never restore an unsafe legacy money path as authoritative.

## Production environment audit

Gate 16 requires visibility into the actual production projects and verification of environment-variable metadata for Web/App/Admin/API.

The audit must confirm, as applicable:

- Supabase project URL and server credential wiring;
- Clerk publishable/server verification configuration;
- API auth mode and issuer/JWKS/audience configuration;
- Circle credentials/entity-secret/KMS or signing configuration;
- provider webhook verification secrets/configuration;
- Stripe/Alchemy configuration where in scope;
- canonical service origins and allowed domains;
- feature/capability gates;
- project/environment targeting (`production`, `preview`, `development`) and accidental cross-scope leakage.

Record names/presence/scope/status only. Never record secret values.

## Deployment completion evidence

For a production-sensitive gate, record:

- canonical `main` SHA;
- migration/config/function version where applicable;
- target environment;
- deployment state;
- runtime health result;
- controlled positive/negative test results;
- durable database evidence;
- rollback/containment readiness.

## Financial canary rule

No real-funds canary may occur until legacy mutation paths are contained, canonical provider orchestration/webhooks are complete, controlled production-equivalent funding and withdrawal lifecycles reconcile, ledger/backing invariants pass, identity cutover is certified, and production environment configuration is audited.

A real-funds canary requires explicit authorization separate from repository/deployment authorization.

## Final rewrite

After all gates close, rewrite this document as the final deployment/runbook authority including project mapping, environment contract, migrations, rollout, rollback, monitoring, and incident procedures.
