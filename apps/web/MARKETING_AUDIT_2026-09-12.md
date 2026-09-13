# Neptlium Public Marketing Audit — 2026-09-12

**Status:** Historical audit retained for product-truth and route-policy context. Its visual direction, positioning, navigation hierarchy, homepage sequence, and conversion wording were superseded by Stage 01 in September 2026.

For current marketing design authority use:

- `docs/marketing-design-system.md`
- `apps/web/lib/content/public-architecture.ts`
- `apps/web/lib/content/site.ts`

## Historical scope

This audit established the investor-marketing architecture that preceded Stage 01. It remains useful for financial-truth constraints, route decisions, SEO maturity, and capability classifications. It is not a current visual specification.

## Current Stage 01 overrides

The following historical decisions are no longer authoritative:

- ivory-first visual direction;
- `Capital, made clearer.` as current marketing positioning;
- five-item top-level navigation without Capital;
- `Get Started` as primary acquisition wording;
- the previous homepage section sequence;
- prior PR #68 visual assumptions.

Current Stage 01 marketing direction is black-first, product-first and governed by `docs/marketing-design-system.md`.

## Route decisions retained

Canonical/indexable product surfaces remain:

- `/products`
- `/products/capital-account`
- `/products/treasury`
- `/products/allocation`
- `/products/portfolio-intelligence`

Supporting/noindex product surfaces remain:

- `/products/performance`
- `/products/capital-universe`

Canonical solution surfaces remain:

- `/solutions`
- `/solutions/capital-visibility`
- `/solutions/treasury-coordination`
- `/solutions/allocation-workflows`
- `/solutions/governance-control`

Legacy convergence remains:

- `/about` → `/company`
- `/resources` → `/insights`

## Canonical vocabulary retained

- **Platform** — the connected Neptlium operating environment.
- **Capital** — financial state and context represented by supported evidence; not a synonym for custody.
- **Portfolio** — positions, ownership and portfolio context represented by available evidence.
- **Funding** — account-specific instructions and lifecycle state through supported capabilities.
- **Transaction** — an explicit lifecycle that can include intent, submission, provider evidence, settlement and reconciliation.
- **Investment** — an opportunity or framework described through objective, structure, exposure, risk, liquidity, fees, documentation and suitability.
- **Reporting** — statements, records, documents and portfolio/account context associated with financial activity.
- **Availability** — determined by current supported account/product/infrastructure capability, not roadmap intent.
- **Settlement** — distinct from reconciliation.
- **Liquidity** — access/timing context, never a guarantee of immediate withdrawal or execution.

## Claim integrity retained

### Verified architectural claims

- authenticated account access exists as a distinct identity boundary;
- consequential financial authority is server-side rather than created by browser presentation alone;
- modeled, provider-reported, canonical and reconciled state are distinct concepts;
- public product visuals can represent unavailable or illustrative state without fake customer balances;
- account creation and sign-in have real authenticated destinations;
- portfolio, capital-account, treasury, allocation, reporting and security are established product responsibilities.

### Qualified claims

- funding is available only through account-specific supported capabilities;
- digital-asset routes depend on supported account/infrastructure capability;
- investment availability depends on verified opportunity, documentation, eligibility and operating support;
- liquidity and transaction states depend on evidence and lifecycle state.

### Not marketed as live

- USD capital funding;
- unverified future payment rails;
- unsupported future digital-asset networks or assets;
- a live public investment marketplace where no verified offering source exists;
- substantive original research where none has been published.

### Unsupported claims

The public site must not claim:

- guaranteed returns, yield or earnings;
- fabricated performance;
- AUM, customer counts or transaction volume without verified evidence;
- undocumented regulatory registration, licensing, insurance, certifications or partnerships;
- immediate or infallible settlement;
- unsupported custody, brokerage, investment-management or advisory authority;
- fake testimonials, press or institutional backing.

## Financial-state rules retained

- unknown is not zero;
- configured is not live;
- provider evidence is not canonical financial state;
- modeled is not executed;
- approved is not submitted;
- submitted is not settled;
- settled is not reconciled;
- a described investment framework does not prove a live offering;
- a described funding architecture does not prove every rail is available.

USD funding remains non-live in public marketing unless and until supported production capability is independently verified.

## Current validation requirement

Any marketing release still requires final-head CI, exact-head Vercel Preview readiness, real browser QA, responsive checks, keyboard/focus checks, console/resource checks, and claim sanity review. Browser-dependent evidence must never be inferred from source inspection alone.
