# Neptlium

**Capital Operating Platform**  
*Capital, intelligently managed.*

Neptlium is an operating layer for individual and organizational capital: positions, movements, evidence, policy, and financial operations across governed workflows.

> Every movement has authority. Every position has evidence.

**Production:** [neptlium.com](https://neptlium.com) · **Capital application:** [app.neptlium.com](https://app.neptlium.com)

## Platform surfaces

| Surface | Responsibility |
| --- | --- |
| Web | Public product experience and discovery |
| Capital (`apps/app`) | Individual capital operating experience |
| Treasury | Organizational capital operations |
| Admin | Restricted internal operations, governance, and controls |
| API (`apps/api`) | Identity-aware platform and financial-domain APIs |
| Pay | Payment presentation and approved payment journeys |
| Docs | Developer and integration documentation |
| Status | Service availability and operational communications |

A surface being present in the repository does **not** certify that a particular financial capability is enabled or production-ready.

## Architecture

Neptlium is a **pnpm/Turborepo monorepo**, organized by deployable applications, shared packages, database assets, documentation, and automation.

```text
apps/       # Independently deployable product surfaces and API
packages/   # Shared domain, UI, integration and infrastructure libraries
supabase/   # PostgreSQL schema and migrations
docs/       # Product, engineering, security and operational contracts
scripts/    # Repository tooling and automation
```

**Authority model**

- **Neptlium ledger:** canonical financial truth, subject to governed posting and reconciliation.
- **Providers:** infrastructure and evidence sources, never automatic financial authority.
- **Policy and authorization:** explicit, server-enforced, tenant-scoped, and fail-closed.
- **Intelligence:** observational unless an explicitly reviewed domain contract grants additional authority.

```text
Customer / Operator
        ↓
Neptlium Product Surface
        ↓
Verified Identity → Stable Principal → Tenant Authorization
        ↓
Policy / Domain Workflow / Capability Gate
        ↓
Provider Adapter → Verified Evidence
        ↓
Governed Posting / Reconciliation
        ↓
Canonical Ledger / Customer Projection
```

## Identity and infrastructure direction

**Clerk is the designated customer authentication provider** for sign-in, sign-up, sessions, MFA, and recovery. **Supabase remains the PostgreSQL and persistence platform**, including application data, migrations, constraints, and row-level security.

**Migration status:** Clerk is the *target architecture*, not a completed production cutover. Existing customer application and API authentication paths still depend on Supabase Auth. The `feat/clerk-primary-auth-migration` branch contains Preview verification foundations; full Clerk SDK integration, verified identity linking, database authorization tests, rollback, and production certification remain required. Do not interpret this README as approval to disable Supabase Auth or delete legacy user references.

The API must independently verify identity tokens and resolve them to a stable Neptlium principal. Account ownership is never inferred from email matching, browser claims, or provider sessions alone. Admin and Treasury identity boundaries require separate verification.

See [Provider architecture](docs/platform/PROVIDERS.md) and [Clerk migration contract](docs/security/clerk-primary-auth-migration.md).

## Core invariants

1. Ledger authority belongs to Neptlium; external balances and confirmations are evidence, not available capital.
2. Every financial mutation requires authorization, auditability, idempotency, and reconciliation controls.
3. Policy, eligibility, preflight, and tenant access **fail closed**.
4. Provider capabilities must be explicitly configured, reviewed, and activated for their environment and operation.
5. Intelligence cannot independently mutate financial truth.
6. Secrets, signing authority, and service-role credentials never enter customer browsers.
7. Identity-provider changes must preserve existing account ownership, access isolation, and recoverability.

## Local development

Use a supported Node.js runtime and the repository-pinned pnpm version. Install from the monorepo root:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Before submitting changes, run the applicable repository checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Commands above describe the expected workflow; they are **not** a claim that all checks currently pass.

## Documentation

Start at [Documentation index](docs/README.md). Key references:

- [Provider architecture](docs/platform/PROVIDERS.md)
- [Security policy](SECURITY.md)
- [Deployment operations](docs/operations/DEPLOYMENT.md)
- [Clerk migration safety contract](docs/security/clerk-primary-auth-migration.md)

Product, financial-domain, architecture, and design-system specifications are indexed in `docs/README.md`.

## Deployment and release governance

Applications deploy independently. A successful provider configuration or build does not establish production eligibility, payment readiness, or safe financial execution.

Changes to authentication, authorization, ledger, custody, and financial integrations require environment-specific verification, security review, and a tested rollback path. Production migrations must not proceed without recoverability evidence.

See [Deployment operations](docs/operations/DEPLOYMENT.md).

## Security

Never commit credentials, Clerk secret keys, Supabase service-role keys, provider tokens, wallet signing material, or production session tokens. Report vulnerabilities through the process in [SECURITY.md](SECURITY.md).

---

© Neptlium
