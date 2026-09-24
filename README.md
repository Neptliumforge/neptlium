# Neptlium

**Capital Operating Platform**

Capital, intelligently managed.

Neptlium provides the operating layer for managing capital,
positions, movement, evidence and financial operations across
individual and organizational contexts.

> Every movement has authority. Every position has evidence.

## Platform

| Surface | Responsibility |
| --- | --- |
| Web | Public product experience |
| Capital | Individual capital operating experience |
| Treasury | Organizational capital operations |
| Admin | Internal operations and controls |
| API | Platform and financial-domain APIs |
| Pay | Payment presentation |
| Docs | Developer documentation |
| Status | Platform availability |

## Architecture

Neptlium is a pnpm/Turborepo monorepo.

apps/
packages/
supabase/
docs/
scripts/

The Neptlium ledger is canonical financial truth.

Provider state is evidence.

Intelligence is observational unless a domain contract explicitly
states otherwise.

## Core invariants

- Ledger authority belongs to Neptlium.
- Provider confirmation does not establish available capital.
- Policy and preflight fail closed.
- Intelligence cannot mutate financial truth.
- Provider execution requires explicit capability activation.
- Financial mutations are auditable and idempotent.

## Development

pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build

## Documentation

Start with:

- Product
- Architecture
- Financial invariants
- Design system
- Provider architecture
- Security
- Deployment

See `docs/README.md`.

## Deployment

Production applications are deployed independently.

See `docs/operations/DEPLOYMENT.md`.

## Security

Never commit credentials, provider secrets, service-role keys,
wallet secrets or production tokens.

See `SECURITY.md`.

---

© Neptlium
