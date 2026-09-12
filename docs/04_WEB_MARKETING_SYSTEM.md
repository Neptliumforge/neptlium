# Neptlium Web Marketing System

**Status:** Authoritative for `apps/web`  
**Scope:** Positioning, public information architecture, investor acquisition, product storytelling, investment presentation, trust, SEO, responsive behavior, and visual direction  
**Category:** Capital Operating Platform

## 1. Public objective

`apps/web` is the public expression of the same Neptlium system used by authenticated investors. It must explain the platform clearly, build institutional trust, support investor acquisition, and preserve financial truth.

Within seconds the site should answer:

- What is Neptlium?
- Who is it for?
- What does the platform enable?
- Why should an investor trust it?
- How does the investor journey work?
- What is the next appropriate action?

The site is not an engineering-status surface, speculative marketplace, fake dashboard, crypto landing page, or generic SaaS feature directory.

## 2. Positioning

Canonical positioning:

> **Capital, made clearer.**

Supporting description:

> Neptlium is a modern capital platform for portfolio visibility, capital management, funding workflows, reporting, and governed financial activity.

The tone is confident, clear, measured, precise, intelligent, professional, and calm.

## 3. Canonical top-level architecture

The five top-level public domains are:

1. **Platform** — `/platform`
2. **Investments** — `/investments`
3. **Insights** — `/insights`
4. **Security** — `/security`
5. **Company** — `/about`

Products and Solutions remain second-level platform architecture and are reachable through Platform and contextual links.

Canonical product family:

- Capital Account — `/products/capital-account`
- Treasury — `/products/treasury`
- Allocation — `/products/allocation`
- Portfolio Intelligence — `/products/portfolio-intelligence`

Current solution family:

- Capital visibility — `/solutions/capital-visibility`
- Treasury coordination — `/solutions/treasury-coordination`
- Allocation workflows — `/solutions/allocation-workflows`
- Governance and control — `/solutions/governance-control`

Route policy, sitemap authority, navigation, redirects, and metadata must remain synchronized through `apps/web/lib/content/public-architecture.ts` and `next.config.mjs`.

## 4. Homepage role

The homepage is a deliberate institutional narrative, not the entire website.

Canonical sequence:

1. Hero — what Neptlium is and why it matters.
2. Institutional trust — concrete product behavior and control principles.
3. Platform overview — connected capital responsibilities.
4. Investment experience — objective, structure, risk, liquidity, documentation, eligibility.
5. Portfolio intelligence — visibility without fabricated state.
6. Funding infrastructure — digital asset funding and truthful USD availability communication.
7. Investment solutions — disciplined opportunity framework.
8. Security and financial integrity.
9. How Neptlium works — account access through reporting.
10. Investor reporting and documentation.
11. Insights and education.
12. Focused final conversion.

The hero primary exploration action is **Explore the Platform**. Secondary exploration is **View Investment Solutions**. Header conversion exposes **Sign In** and **Get Started**.

Public product demonstrations may use real structural empty/unavailable states. They must never fabricate balances, performance, allocations, returns, holdings, transactions, or investor activity.

## 5. Platform

`/platform` answers: **What does Neptlium enable as one connected system?**

It should explain portfolio visibility, capital management, funding, transactions, documents, reporting, investor communications, security, and account controls in language understandable to a serious investor.

It should preserve Neptlium's core distinctions between observed, modeled, authorized, submitted, settled, and reconciled states without turning the page into engineering documentation.

## 6. Investments

`/investments` is the public investment-discipline surface.

Every public opportunity, when one is genuinely available, should support:

- overview;
- investment objective;
- strategy;
- structure;
- underlying exposure;
- target duration;
- liquidity;
- fees;
- material risks;
- documentation;
- updates;
- eligibility/suitability;
- authenticated account action.

Historical, target, projected, forecast, scenario, and illustrative information must remain explicitly distinguishable.

If no verified live opportunity exists, Neptlium does not manufacture a marketplace, return percentage, offering count, minimum investment, or availability claim. The page may explain the framework without pretending products are open for investment.

## 7. Funding communication

Marketing must reflect actual funding architecture.

### Digital asset funding

Public copy may explain that supported routes are capability-controlled, account-specific, and governed through funding intents. It must not claim a specific asset/network rail is live merely because it exists in target architecture or source code.

### USD funding

USD funding must not be represented as live until a production funding rail has been implemented and verified with customer attribution, validated amount/currency handling, provider evidence, failure/refund behavior, ledger posting, settlement, reconciliation, and auditability.

Configured is not live. A payment-provider integration for another purpose does not establish investment-account funding capability.

## 8. Insights

`/insights` is a premium editorial publication hub.

Content categories may include Markets, Investing, Portfolio Strategy, Digital Assets, Platform, and Investor Education.

Financial content distinguishes fact, data, model output, scenario, estimate, interpretation, methodology, and opinion. Research remains restrained until substantive original dated publications exist; no fake articles, findings, authors, dates, or report inventory may be created for appearance.

Learn remains an education surface. Research may remain noindex until it has independent publication value.

## 9. Security and trust

`/security` explains investor-understandable controls around:

- account authentication;
- session/access boundaries;
- authorization;
- server-side financial operations;
- data and infrastructure boundaries;
- transaction controls;
- financial record integrity;
- monitoring/auditability;
- reconciliation;
- incident-aware operating principles.

`/trust` explains evidence, uncertainty, authority, risk communication, and the distinction between visible state and financial truth.

Do not claim certifications, insurance, penetration-test outcomes, licensing, regulatory approval, or security guarantees without verified current evidence.

## 10. Company

Company content focuses on mission, operating philosophy, technology, investor experience, capital discipline, and long-term vision.

Do not invent headquarters, offices, employees, founders, investors, funding history, partnerships, press coverage, licenses, or registrations.

## 11. Conversion system

Global authenticated actions:

- **Get Started** → `https://app.neptlium.com/auth/sign-up`
- **Sign In** → `https://app.neptlium.com/auth/sign-in`

Homepage exploration:

- **Explore the Platform** → `/platform`
- **View Investment Solutions** → `/investments`

Contextual pages should expose one dominant next step. Contact is available where a direct conversation is more appropriate than account creation.

Avoid repetitive CTA stacks and fake urgency.

## 12. Trust and disclosure system

Trust should be demonstrated through product behavior: authenticated access, explicit transaction states, auditability, reporting, clear risk presentation, documented investment structure, governed funding, and visible support paths.

Reusable disclosures support:

- general informational/investment-advice boundary;
- investment and principal-loss risk;
- digital-asset risk;
- modeled/illustrative/projection labeling;
- liquidity and fees where applicable;
- eligibility/product-availability boundaries.

Critical risk information must remain readable and cannot be hidden in inaccessible footnotes.

## 13. Visual system

Canonical identity remains Warm Ivory `#F5F3EE`, Carbon `#101214`, Mineral Teal `#0F8F86`, Interaction Teal `#20AFA3`, Graphite `#343A3F`, Stone `#D8D5CE`, and Soft Mist `#ECEAE5`.

Public Web is more editorial and cinematic than the authenticated application while remaining recognizably Neptlium.

Use medium-scale editorial typography, generous whitespace, refined grids, structural rules, product compositions, precise numerical typography where real data exists, and restrained motion.

Avoid casino/crypto aesthetics, giant decorative gradients, glassmorphism, neon, generic stock finance imagery, fake luxury, fabricated trading interfaces, token imagery, and card grids as the default information structure.

Teal is a precision signal, not background paint.

## 14. Product visualization

Prefer purposeful Neptlium-native product compositions over generic browser mockups.

Useful visual responsibilities include:

- portfolio state;
- capital/funding state;
- allocation lifecycle;
- investment review structure;
- reporting/documents;
- security/control boundaries.

A public visual may deliberately show `Unavailable`, `No activity yet`, or other truthful neutral states. It must not manufacture financial values to appear populated.

## 15. Navigation and footer

Desktop navigation exposes exactly Platform, Investments, Insights, Security, Company. Every top-level item is a real destination; disclosures supplement rather than replace links.

Mobile navigation is independently designed with direct destinations, large touch targets, focus containment/restoration, Escape close, body-scroll lock, and route-close behavior.

Footer presents real destinations only and includes Platform, Company, Account, Social, Legal, plus concise investor-risk/informational disclosure.

## 16. Responsive, motion, accessibility

WCAG 2.2 AA is the minimum target.

Preserve landmarks, semantic headings, one H1, skip navigation, keyboard support, visible focus, descriptive links, accessible controls, sufficient contrast, 44px+ touch targets, reduced-motion support, and meaningful non-color state cues.

Mobile is a genuine financial/investor composition rather than stacked desktop. Validate representative widths around `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+`.

Motion may reinforce hierarchy, continuity, platform relationships, or progress through explanatory content. It must not imply financial execution, settlement, performance, or success.

## 17. Performance

Favor server components, semantic HTML, CSS, optimized images, minimal hydration, route-level code splitting, stable layout, and small targeted client boundaries.

Do not add large animation/chart dependencies for decorative effects. Product sophistication must not materially damage interaction latency or initial load.

## 18. SEO and discoverability

Every major indexable page requires deliberate metadata, canonical URL, Open Graph, Twitter card, semantic H1/heading hierarchy, descriptive internal links, and appropriate search intent.

Sitemap, robots, route policy, redirects, metadata, navigation, and internal links must describe the same architecture.

Research and other thin/speculative pages remain noindex until they have independent public value. Do not fabricate `lastModified` timestamps.

## 19. CSS architecture

`apps/web/app/neptlium-visual-direction.css` remains the global visual authority.

New reconstructed route families may use scoped CSS modules where that prevents another global override layer and makes ownership explicit. Do not add another globally imported `v2`, `final`, or override stylesheet.

Historical global CSS layers should be removed incrementally only after proving current pages no longer depend on them.

## 20. Validation

Required validation when tooling is available:

```sh
git diff --check origin/main...HEAD
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Also validate browser rendering, keyboard navigation, focus behavior, route/link integrity, responsive widths, reduced motion, console errors, metadata/canonical behavior, favicon/social assets, and internal 404s when browser tooling is available.

Validation is reported only as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Source inspection is not equivalent to a build, browser, accessibility, performance, or production pass.
