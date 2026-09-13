# Neptlium Public Marketing Audit — 2026-09-12

**Scope:** `apps/web` and the public marketing architecture
**Branch:** `web/premium-marketing-rebuild`

## Current implementation inspected

The public site is a Next.js 16 / React 19 / TypeScript application deployed independently from the authenticated App, Admin, and API projects.

The Web application already contains strong production foundations:

- App Router routing and server-rendered pages;
- centralized site constants and route architecture;
- canonical metadata helper with Open Graph and Twitter support;
- sitemap and robots infrastructure;
- accessible desktop disclosures and portaled mobile navigation;
- shared Neptlium brand geometry from `@neptlium/ui`;
- product visualization components that can represent unavailable/empty state without fake balances;
- dedicated product, solution, security, trust, company, learn, research, legal, and contact pages;
- route/link integrity tests;
- Vercel monorepo deployment configuration.

## Production inspection status

Repository and deployment-state inspection was possible. Direct browser/render inspection of `https://neptlium.com` remains **BLOCKED** in the current tool environment. The available connectors can inspect source, CI, status checks and deployment state, but they do not provide an interactive rendered browser at controlled desktop/tablet/mobile viewports.

No browser, Lighthouse, Core Web Vitals, or visual-regression result is therefore claimed by this audit.

## Problems found

### Positioning

The previous homepage was sophisticated but still framed Neptlium primarily through internal capital-operating language. It did not answer the prospective-investor questions quickly enough: what the product is, what an investor can do, why the system is trustworthy, how funding/investing/reporting fit together, and what to do next.

### Acquisition and navigation

The public architecture emphasized Products, Solutions, and Resources as equal top-level domains and exposed only a Sign up action. That structure was useful for product documentation but less effective as a concise investor acquisition path.

### Investment presentation

There was no dedicated `/investments` architecture. Existing product pages described capital infrastructure but the public site lacked one place that established the standard for objective, strategy, structure, risk, liquidity, fees, documentation, eligibility, and suitability.

### Editorial authority

Learn and Research existed, but there was no premium `/insights` publication hub organizing investor education, markets, portfolio strategy, digital assets, platform intelligence, and future original research.

### Funding communication

The public architecture needed clearer separation between digital-asset funding concepts and USD funding readiness. Marketing must not convert target rails or unrelated provider integration into a claim that account funding is live.

### Product visualization

The repository contains both cinematic imagery and truthful structured product visuals. The latter are better suited to investor-facing proof because they can demonstrate real responsibilities while explicitly showing unavailable/empty state instead of fabricated customer data.

### CSS ownership

The root layout currently imports multiple historical global CSS layers. They continue to support existing routes, so deleting them during this investor-marketing pass would be unnecessarily destructive. Newly reconstructed routes use scoped CSS modules while the global layers are audited incrementally.

## Architecture established in this pass

Top-level public navigation:

1. Platform
2. Investments
3. Insights
4. Security
5. Company

Products and Solutions remain second-level platform architecture.

Conversion architecture:

- **Get Started** → authenticated account creation;
- **Sign In** → authenticated sign-in;
- **Explore the Platform** → `/platform`;
- **View Investment Solutions** → `/investments`.

Canonical public positioning:

> **Capital, made clearer.**

`/company` is now the canonical Company destination. Legacy `/about` converges to `/company` rather than maintaining two competing company narratives.

## Homepage architecture

The rebuilt homepage now follows this narrative:

1. clear capital-platform proposition;
2. institutional trust through product behavior;
3. connected platform overview;
4. investment-information discipline;
5. portfolio intelligence;
6. truthful funding infrastructure explanation;
7. investment-solutions framework;
8. security and financial integrity;
9. investor journey;
10. reporting/documentation;
11. insights/editorial authority;
12. readable investment disclosures and global conversion.

Public product demonstrations deliberately avoid fabricated balances, returns, allocations, holdings, transaction values, or investor activity.

## Product truth rules

Marketing must preserve these distinctions:

- unknown is not zero;
- configured is not live;
- provider evidence is not canonical financial state;
- modeled is not executed;
- approved is not submitted;
- submitted is not settled;
- settled is not reconciled;
- a described investment framework does not prove a live offering;
- a described funding architecture does not prove every rail is available.

USD funding is not marketed as a live public capability in this pass.

## Product route decision matrix

| Route | Decision | Reason |
| --- | --- | --- |
| `/products` | KEEP | Secondary product-discovery surface; not a competing top-level navigation domain. |
| `/products/capital-account` | KEEP | Distinct account, funding, liquidity and capital-movement responsibility. |
| `/products/treasury` | KEEP | Distinct liquidity/readiness and obligation-context responsibility. |
| `/products/allocation` | KEEP | Distinct modeled-intent, review and authorization responsibility. |
| `/products/portfolio-intelligence` | KEEP | Distinct ownership, exposure, concentration and portfolio-context responsibility. |
| `/products/performance` | KEEP / SUPPORTING NOINDEX | Useful methodology and provenance explanation, but not a primary acquisition/search surface until supported performance data exists. |
| `/products/capital-universe` | KEEP / SUPPORTING NOINDEX | Useful capital-classification context, but deliberately not an asset catalogue or availability claim. |

No retained Product route claims custody, execution, guaranteed outcome or unsupported asset availability.

## Solution route decision matrix

| Route | Decision | Reason |
| --- | --- | --- |
| `/solutions` | KEEP | Problem-led overview that explains why the product surfaces are connected. |
| `/solutions/capital-visibility` | KEEP | Cross-product problem spanning Capital Account and Portfolio Intelligence. |
| `/solutions/treasury-coordination` | KEEP | Problem-led operational framing distinct from the Treasury product description; remains deliberately concise. |
| `/solutions/allocation-workflows` | KEEP | Decision-process framing distinct from the Allocation product surface. |
| `/solutions/governance-control` | KEEP | Cross-cutting authority/evidence problem spanning Security, Trust and consequential workflows. |

These routes stay second-level. They are not promoted into primary navigation and should be consolidated later if they cease to provide distinct search intent or investor comprehension.

## Canonical vocabulary

Marketing copy uses these terms consistently:

- **Platform** — the connected Neptlium operating environment.
- **Capital** — financial state and context represented by supported evidence; not a synonym for custody.
- **Portfolio** — positions, ownership and portfolio context represented by available evidence.
- **Funding** — account-specific instructions and lifecycle state through supported capabilities.
- **Transaction** — an explicit lifecycle that can include intent, submission, provider evidence, settlement and reconciliation.
- **Investment** — an opportunity or framework described through objective, structure, exposure, risk, liquidity, fees, documentation and suitability.
- **Reporting** — statements, records, documents and portfolio/account context associated with financial activity.
- **Digital asset funding** — capability-controlled funding routes exposed only where supported for the authenticated account.
- **USD funding** — not represented as a live public capability in this release.
- **Availability** — determined by current supported account/product/infrastructure capability, not roadmap intent.
- **Settlement** — a lifecycle state that remains distinct from reconciliation.
- **Liquidity** — access/timing context; never a guarantee of immediate withdrawal or execution.

## Claim integrity classification

### VERIFIED

Supported by current repository architecture and public product contracts:

- authenticated account access exists as a distinct identity boundary;
- consequential financial authority is server-side rather than created by browser presentation alone;
- modeled, provider-reported, canonical and reconciled state are treated as distinct concepts;
- product visuals can render controlled/unavailable state without fake money values;
- account creation and sign-in have real authenticated destinations;
- portfolio, capital-account, treasury, allocation, reporting and security are established product responsibilities in the current architecture.

### QUALIFIED

True only under stated conditions and therefore explicitly qualified in copy:

- funding is available only through account-specific supported capabilities;
- digital-asset routes depend on supported account/infrastructure capability;
- investment availability depends on verified opportunity, documentation, eligibility and operating support;
- liquidity and transaction states depend on evidence and lifecycle state;
- operational/replay/data controls are described only where implemented, not as universal certification claims.

### ROADMAP / DEFERRED

Not marketed as live:

- USD capital funding;
- unverified future payment rails;
- new digital-asset networks or assets not exposed by current capability;
- live public investment marketplace content where no verified offering source exists;
- dynamic research/article inventory where substantive editorial content does not yet exist.

### UNSUPPORTED / REMOVED FROM MARKETING AUTHORITY

The public site must not claim:

- guaranteed returns, yield or earnings;
- fabricated performance;
- AUM, customer counts or transaction volume without verified evidence;
- regulatory registration, licensing, insurance, certifications or partnerships without documented support;
- immediate/infallible settlement;
- custody, brokerage or investment-management authority not actually provided;
- fake testimonials, press or institutional backing.

## Funding accuracy

Digital-asset funding language is capability-controlled: the public site describes the operating responsibility without asserting that every asset, network or customer can fund through it.

USD funding remains explicitly non-live in the public marketing narrative. Stripe or other provider infrastructure elsewhere in the repository is not treated as proof that customer capital funding is publicly executable.

## Investment accuracy

`/investments` leads with objective, strategy, structure, risk, liquidity, fees, documentation and suitability. It explicitly requires target, projected, illustrative and historical information to remain distinguishable whenever those categories are used. No current public opportunity, projected return or customer performance is fabricated.

## Insights maturity

`/insights` is a truthful editorial hub with categories for Markets, Investing, Portfolio Strategy, Digital Assets, Platform and Investor Education. It does not invent articles, authors, dates or research findings. `/research` remains supporting/noindex until substantive original publications exist, and legacy `/resources` converges to `/insights`.

## Security completion

`/security` now explains:

- authenticated account access;
- authorization boundaries;
- financial authority outside browser-side presentation;
- transaction lifecycle integrity;
- provider evidence and reconciliation boundaries;
- infrastructure and fail-closed behavior;
- operational review principles;
- sensible investor account-security responsibilities.

The page deliberately avoids undocumented certification, insurance, regulatory, cryptographic or “perfect security” claims.

## Company completion

`/company` now provides one institutional narrative around mission, operating philosophy, platform philosophy, technology/financial integrity and long-term direction. It does not invent founding history, headquarters, offices, employee count, investors, funding rounds, regulatory status, AUM, awards or press recognition.

## SEO and route policy

`/investments`, `/insights`, `/security`, and `/company` are canonical indexable public routes. `/about` and `/resources` are legacy convergence routes. Performance and Capital Universe are supporting/noindex product routes. Research remains supporting/noindex until substantive original publications justify independent search authority.

Metadata, sitemap, navigation, footer and route policy converge around the new architecture.

## Visual direction

The rebuilt surfaces use:

- Warm Ivory `#F5F3EE`;
- Carbon `#101214`;
- Mineral Teal `#0F8F86`;
- Interaction Teal `#20AFA3`;
- Graphite `#343A3F`;
- Stone `#D8D5CE`;
- Soft Mist `#ECEAE5`.

Typography remains editorial but controlled. Teal is used as a precision signal. Layouts prioritize hierarchy, whitespace, structural rules, and purposeful product compositions over gradients, glassmorphism, generic mockups, or decorative finance imagery.

## Implementation status

Completed in this branch:

- site positioning and conversion labels;
- public information architecture;
- desktop and mobile header architecture;
- institutional footer and disclosure copy;
- global conversion CTA;
- homepage reconstruction;
- Platform page reconstruction;
- Investments page;
- Insights page;
- Security page completion;
- Company page completion and `/about` consolidation;
- product and solution route decision audit;
- vocabulary and claim-integrity audit;
- route-scoped premium marketing styles;
- sitemap and route-policy updates;
- `/resources` redirect;
- marketing documentation and source-contract test updates.

## Remaining production verification

Before production merge:

- CI must remain green on the final head;
- Vercel Web preview must be READY on the final head;
- real browser verification must cover desktop, laptop, tablet, mobile and narrow-mobile widths;
- practical keyboard/focus/contrast/accessibility behavior must be checked in the rendered preview;
- production-like performance/Lighthouse checks must be run against the preview;
- final route/redirect/canonical behavior must be smoke-tested in a real browser;
- final diff must be reviewed for unrelated changes, debug output, fake data and abandoned code.

Because the current execution environment does not expose a real interactive browser, browser-dependent release gates remain explicit blockers rather than being inferred from source tests.
