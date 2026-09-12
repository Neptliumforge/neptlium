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

Repository and deployment-state inspection was possible. Direct browser/render inspection of `https://neptlium.com` was **BLOCKED** in the current tool environment: external DNS access was unavailable from the execution container, Web search did not return the domain, Vercel deployment listing returned a permission error, and deployment lookup by status identifier did not resolve.

No browser, responsive-render, Lighthouse, Core Web Vitals, or visual-regression result is therefore claimed by this audit.

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

The root layout currently imports multiple historical global CSS layers. They continue to support existing routes, so deleting them during the first investor-marketing pass would be unnecessarily destructive. Newly reconstructed routes therefore use scoped CSS modules while the global layers are audited incrementally.

## Architecture established in this pass

Top-level public navigation:

1. Platform
2. Investments
3. Insights
4. Security
5. Company

Products and Solutions remain part of the platform architecture and retain their canonical routes.

Conversion architecture:

- **Get Started** → authenticated account creation;
- **Sign In** → authenticated sign-in;
- **Explore the Platform** → `/platform`;
- **View Investment Solutions** → `/investments`.

Canonical public positioning:

> **Capital, made clearer.**

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

## SEO and route policy

`/investments` and `/insights` are now canonical indexable public routes. `/resources` is classified as a legacy route and permanently converges to `/insights`. Research remains a supporting noindex surface until substantive original publications justify independent search authority.

Metadata, sitemap priority, navigation, footer, and route policy are being converged around the new architecture.

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

## First-pass implementation status

Completed in this branch:

- site positioning and conversion labels;
- public information architecture;
- desktop and mobile header architecture;
- institutional footer and disclosure copy;
- global conversion CTA;
- homepage reconstruction;
- Platform page reconstruction;
- new Investments page;
- new Insights page;
- route-scoped premium marketing styles;
- sitemap updates;
- `/resources` redirect;
- marketing documentation and source-contract test updates.

## Remaining production work

The next passes should:

- validate and refine the rebuilt pages in an actual browser across mobile/tablet/desktop widths;
- rebuild Security and About/Company surfaces into the same investor-facing visual rhythm where needed;
- audit individual product and solution pages for old architecture language and visual duplication;
- build the future dynamic `/insights/[slug]` content model only when substantive content exists;
- introduce investment-detail routes only when a verified opportunity source exists;
- consolidate historical CSS layers once route ownership is proven;
- verify performance, accessibility, SEO rendering, route redirects, social metadata, and production links;
- maintain marketing/product parity as the authenticated dashboard and deposit architecture mature.
