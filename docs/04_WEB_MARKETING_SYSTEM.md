# Neptlium Web Marketing System

**Status:** Authoritative for `apps/web`
**Scope:** Public information architecture, content roles, navigation, conversion, SEO, responsive behavior, and visual direction
**Category:** Capital Operating Platform

This document refines `docs/03_DESIGN_SYSTEM.md` for the public Web. Repository implementation and tests must converge on this architecture rather than preserve superseded route organization.

## 1. Public-Web objective

`apps/web` explains Neptlium as one capital operating environment for understanding, organizing, governing, and operating capital.

The site is not a feature directory, engineering-status surface, authenticated dashboard, or collection of disconnected landing pages. It should progressively establish what Neptlium is, why it exists, how the system works, what products form it, what operating problems it addresses, how intelligence/security/trust fit, and where the visitor should go next.

## 2. Canonical top-level architecture

The five public domains are exactly:

1. **Platform** — how Neptlium works as one system.
2. **Products** — the components that form the system.
3. **Solutions** — the operating problems the system is designed to address.
4. **Resources** — product understanding, security, trust, and substantive research when available.
5. **Company** — the organization and principles behind Neptlium.

Each domain has a real hub destination: `/platform`, `/products`, `/solutions`, `/resources`, `/company`.

A top-level label must not exist only as a dropdown trigger.

## 3. Platform

Platform answers **“What is Neptlium as a whole?”**

It explains the unified capital operating environment, system model, visibility, organization, product relationships, intelligence, governance, operating lifecycle, and architectural principles. Platform must not become a duplicate Products directory.

## 4. Products

Products answers **“What does Neptlium provide?”**

Canonical product family and URLs:

- Capital Account — `/products/capital-account`
- Treasury — `/products/treasury`
- Allocation — `/products/allocation`
- Portfolio Intelligence — `/products/portfolio-intelligence`
- Performance — `/products/performance`
- Capital Universe — `/products/capital-universe`

The product model may explain strategic relationships and intended product semantics without implying unsupported production capability. Performance never manufactures returns. Capital Universe never turns strategic architecture into an asset/network/custody/execution-availability claim.

Superseded root product URLs permanently converge to the nested canonical family.

## 5. Solutions

Solutions answers **“What operating problem does Neptlium help me reason about?”**

Current need-based taxonomy is Capital visibility, Treasury coordination, Allocation workflows, and Governance and control. Do not invent customer/persona segmentation without evidence.

Solutions connects problems to relevant products and resources without simply renaming product features.

## 6. Resources

Resources separates different kinds of authority:

- **Learn** — concepts, terminology, workflows, and product understanding.
- **Security** — public security/control architecture principles.
- **Trust** — product truth, uncertainty, privacy boundaries, risk communication, and control boundaries.
- **Research** — substantive, dated original analysis only when it genuinely exists.

Research remains a truthful non-indexable publication surface until real publications are available. Never invent articles, findings, reports, certifications, or dates to make the library look mature.

## 7. Company

Company is the institutional hub.

- `/company` explains the organization and operating principles.
- `/about` goes deeper into the Neptlium product/company thesis.
- `/contact` provides direct contact.
- `/press` provides verified company/media information and remains noindex until a substantive publication surface exists.

Do not fabricate employees, locations, investors, funding, customers, awards, partnerships, press coverage, licenses, or regulatory status.

## 8. Supporting, legal, and system routes

Public supporting/noindex surfaces include Pricing/Access, Research, Press, Privacy, Terms, Cookie Policy, and Risk Disclosure unless later evidence justifies a different search role.

Authentication and system routes remain outside marketing search authority. Generated metadata/assets remain infrastructure surfaces rather than navigation destinations.

Route classification is centralized in `apps/web/lib/content/public-architecture.ts` and must agree with sitemap, redirects, navigation, tests, and page metadata.

## 9. Homepage role

The homepage establishes Neptlium and routes visitors into the wider architecture. It is not the entire website.

The canonical proposition is deliberately category-defining and minimal:

> **The operating system for capital.**
>
> See, coordinate and govern capital across treasury, allocation and portfolio context.

The headline should work the way the strongest infrastructure brands do: one clear category statement, followed by one short explanatory sentence. Do not stack slogans, decorate the proposition with unnecessary microcopy, or force line breaks for spectacle.

The homepage moves through proposition → operating model → products → solution relevance → intelligence/governance/trust → company rationale → next action.

It remains image-independent: brand authority comes from typography, space, system relationships, product concepts, information, and controlled motion rather than decorative hero art.

## 10. CTA system

Primary global action: **Enter Neptlium** → authenticated application sign-in.

Broad exploration action: **Explore platform** → `/platform`.

Contextual pages may use more precise next actions such as Explore products, Explore Security, or About Neptlium. Contact is a Company destination, not the default product-entry CTA.

## 11. Navigation

Desktop navigation exposes exactly Platform, Products, Solutions, Resources, Company.

Each top-level domain has a direct hub link. Disclosures expose concise hierarchy and must not become mini landing pages or command palettes.

Required behavior includes keyboard operation, ArrowDown entry where implemented, Escape close, outside/focus close, visible focus, `aria-expanded`, `aria-controls`, and `aria-haspopup` where applicable.

Mobile navigation is designed independently as a top-origin full-height structure with direct hub links plus expandable child navigation, 44px+ touch targets, body-scroll lock, focus containment/restoration, Escape close, and route-close behavior.

## 12. Footer

Footer hierarchy mirrors Platform, Products, Solutions, Resources, Company, and Legal.

Do not retain dead destinations for symmetry. Do not add unverified social links. GitHub may be exposed as the verified repository destination.

## 13. Voice and content

Copy is clear, calm, specific, economical, confident, institutional, and human.

Prefer mechanisms and relationships over slogans. Avoid startup hype, category essays, repeated internal architecture jargon, and unsupported outcome language.

Every section must answer a question. Remove sections that exist only to create visual length.

Marketing remains independent from repository progress, App/Admin/API completion, migrations, provider configuration, deployment health, feature flags, and release-readiness chronology.

## 14. Visual system

Canonical public identity: Warm Ivory, Carbon/near-black, Mineral Teal as a precision signal, editorial serif where useful, precise sans-serif interface typography, medium-scale hierarchy, purposeful negative space, thin structural rules, restrained geometry, and minimal elevation.

Do not use neon crypto visuals, generic gradients, glassmorphism, floating card stacks, fake dashboards, decorative coins, stock photography, random 3D forms, blur-heavy atmosphere, or card grids as the default solution to every section.

Product explanation should use Neptlium-native operating representations and neutral states without fabricated balances, returns, transactions, AUM, customers, asset availability, providers, or execution readiness.

## 15. Responsive system

Design intentionally for large desktop, laptop, tablet, mobile, and small mobile. Validate approximately 1440, 1280, 1024, 768, 430, 390, 360, and surrounding transitions.

Mobile is not collapsed desktop. Reassess heading wrapping, navigation, section rhythm, structural rules, product representations, CTA sizing, footer layout, legal readability, and touch targets at each range.

## 16. Accessibility

WCAG 2.2 AA is the minimum target. Preserve landmarks, one appropriate H1 per page, coherent heading hierarchy, skip navigation, keyboard operation, focus visibility, disclosure semantics, contrast, descriptive links, touch targets, form labels, and reduced motion.

Important meaning must never depend on color or motion alone.

## 17. SEO and indexing

Only pages with independent public search value belong in the sitemap.

Canonical product URLs are the nested `/products/*` family. Legacy root product URLs must not compete with them and permanently redirect in one hop.

Every canonical page requires purpose-specific metadata and canonical URL. Supporting noindex pages stay out of sitemap authority. Do not fabricate `lastModified` timestamps from build/request time.

`robots.txt`, sitemap, route policy, redirects, metadata, navigation, and internal links must describe the same architecture.

## 18. Engineering ownership

Prefer server components, semantic HTML, CSS, and small targeted client boundaries. Do not add hydration or large dependencies for decorative effects.

The canonical current Web visual authority is `apps/web/app/neptlium-visual-direction.css`. Reconstructed global surfaces must be consolidated there rather than creating another `v2`, `final`, or override stylesheet.

Historical route-specific CSS may remain only where current untouched routes still depend on it. When a reconstructed surface is fully owned by the canonical layer, remove superseded overlapping imports/files after proving they are no longer required.

## 19. Truthfulness

Never invent or imply customer assets, returns, AUM, live transactions, live providers, custody availability, execution availability, certification, regulatory approval, partnerships, customer logos, pricing, or asset support without verified authority.

Marketing can explain product concepts and intended operating relationships without publishing internal engineering readiness.

## 20. Validation

At minimum:

```sh
git diff --check origin/main...HEAD
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

On Termux/Android, use `pnpm --filter @neptlium/web exec next build --webpack`.

Also validate the actual build route inventory, redirects/indexing policy, static links, keyboard navigation, representative responsive widths, and rendered pages when browser tooling is available.

Report every check as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Never infer browser/visual certification from compilation alone.
