# NEPTLIUM API FOUNDATION
## Testing, Deployment, CI & Documentation
### Version 1.0

---

# PURPOSE

This specification defines the production-readiness requirements for the Neptlium API.

Every deployment must be repeatable, verifiable, observable, and safe.

No production deployment may depend on undocumented behaviour.

---

# DEPLOYMENT PHILOSOPHY

Every deployment must be:

- deterministic
- repeatable
- auditable
- reversible
- observable

Production deployments must originate from CI.

Manual production modifications are prohibited.

---

# ENVIRONMENTS

Support four environments.

Local

Development workstation.

Test

Automated testing.

Preview

Pull request deployments.

Production

Live customer environment.

Environment behaviour must be explicitly configurable.

---

# CONFIGURATION

Configuration is environment-driven.

Secrets are never committed.

Secrets are never documented as actual values.

Secrets are never exposed through public endpoints.

Configuration validation occurs during application startup.

Invalid configuration fails immediately.

---

# HEALTH ENDPOINT

Expose:

GET

/v1/health

The endpoint reports:

service status

environment

version

uptime

provider readiness

database readiness

build identifier

No secrets are exposed.

---

# READINESS CHECKS

Application startup validates:

environment

configuration

database connectivity

provider configuration

required services

Failures prevent startup.

---

# LOGGING

Implement structured logging.

Every log contains:

timestamp

request ID

operation

duration

result

environment

Never log:

tokens

API secrets

wallet secrets

service-role keys

provider secrets

private keys

signature material

---

# OBSERVABILITY

Support:

request tracing

structured logs

error tracking

audit events

health monitoring

Metrics must distinguish:

success

failure

validation errors

authentication failures

provider failures

rate limiting

---

# ERROR REPORTING

Errors must be:

structured

deterministic

safe

repeatable

Internal exceptions never leak stack traces to clients.

---

# RATE LIMITS

Document rate-limit policy.

Separate limits for:

health

reads

writes

authentication

webhooks

Administrative operations

Support standard headers.

---

# TESTING PHILOSOPHY

Testing validates business correctness.

Not merely framework behaviour.

Every critical financial rule requires automated tests.

---

# UNIT TESTS

Cover:

environment parsing

validation

authorization

authentication

state transitions

ledger balancing

provider adapters

error serialization

configuration

asset allowlist

---

# INTEGRATION TESTS

Verify:

API routes

Supabase integration

database persistence

idempotency

transaction history

deposit flow

withdrawal flow

provider boundaries

---

# SECURITY TESTS

Cover:

authentication failures

authorization failures

replay attacks

duplicate webhooks

invalid signatures

permission escalation

ownership enforcement

---

# RECONCILIATION TESTS

Verify:

duplicate detection

provider mismatch

ledger mismatch

confirmation mismatch

amount mismatch

network mismatch

classification correctness

---

# PROVIDER TESTS

When credentials are absent:

health succeeds

provider routes fail safely

no wallet is created

no fake address exists

no fake transaction exists

No successful provider behaviour is simulated.

---

# STATE MACHINE TESTS

Deposit transitions.

Withdrawal transitions.

Invalid transitions.

Terminal states.

Cancellation rules.

Replay safety.

---

# IDEMPOTENCY TESTS

Verify:

duplicate request replay

payload mismatch rejection

response reuse

provider submission protection

storage persistence

---

# PERFORMANCE TESTS

Validate:

pagination

large transaction history

ledger reconstruction

database indexing

response latency

---

# BUILD VALIDATION

Every CI execution performs:

installation

lint

typecheck

tests

build

Only successful pipelines are deployable.

---

# CI INTEGRATION

Integrate with:

pnpm workspace

Turborepo

GitHub Actions

Preserve validation for:

apps/web

apps/app

apps/admin

apps/api

shared packages

---

# BUILD MATRIX

CI validates:

Linux

Node version

workspace integrity

dependency graph

No provider credentials required.

---

# DEPLOYMENT REQUIREMENTS

Production deployment requires:

successful tests

successful typecheck

successful build

healthy health endpoint

configuration validation

---

# MIGRATIONS

Migrations remain:

forward-only

versioned

reviewable

Never automatically apply production migrations.

Production migration approval remains manual.

---

# DOCUMENTATION

Update:

README.md

apps/api/README.md

docs/API_FOUNDATION.md

docs/ARCHITECTURE.md

docs/SECURITY.md

docs/SUPABASE.md

docs/DEPLOYMENT.md

docs/ROADMAP.md

Environment documentation

Webhook documentation

Migration documentation

---

# DOCUMENTATION RULES

Documentation must describe:

implemented behaviour

known limitations

provider-disabled behaviour

deployment order

rollback procedure

launch checklist

Never document features that do not exist.

---

# PRODUCTION READINESS CHECKLIST

Before production launch verify:

✓ API builds

✓ Tests pass

✓ TypeScript passes

✓ Lint passes

✓ CI passes

✓ Database migrations reviewed

✓ Health endpoint healthy

✓ Authentication verified

✓ Authorization verified

✓ Ledger validated

✓ Audit logging enabled

✓ Rate limiting enabled

✓ Replay protection enabled

✓ Idempotency enabled

✓ Provider abstraction verified

✓ Provider-disabled mode verified

✓ Documentation updated

---

# TESTNET POLICY

Initial production targets:

Base Sepolia

Bitcoin testnet where applicable

No mainnet asset movement.

Mainnet activation requires a separate readiness review.

---

# LAUNCH GATES

Mainnet launch requires completion of:

Provider verification

Custody validation

Security review

Penetration testing

Operational monitoring

Disaster recovery testing

Incident response plan

Compliance review

Performance validation

Production approval

---

# FUTURE PHASES

Future work may include:

multi-provider routing

institutional custody

hardware signing

policy engine

treasury management

allocation execution

multi-signature workflows

settlement orchestration

risk engine

advanced reconciliation

These are explicitly out of scope for the API Foundation milestone.

---

# ACCEPTANCE CRITERIA

✓ Automated test suite implemented

✓ CI integration complete

✓ Deployment process documented

✓ Production readiness checklist completed

✓ Environment validation implemented

✓ Observability implemented

✓ Documentation updated

✓ Health endpoint operational

✓ Secure deployment process established

The Neptlium API Foundation is considered complete only when all specifications (01–05) are implemented, verified, documented, and pass automated validation.

End of Specification 05.
