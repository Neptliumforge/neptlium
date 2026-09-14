# Neptlium Unified Marketing Design System

**Status:** Authoritative for marketing design and marketing frontend in `apps/web`

**Architecture:** one company, two product journeys

- **Personal / Neptlium Capital** — individual investors and capital customers
- **Business / Neptlium Treasury** — organizations and treasury teams

This document supersedes the former Stage 01 Personal-first navigation, PR #68 visual assumptions, ivory-first direction, and any guidance that treats `black-first` as `black-only`. It does not override the product constitution, canonical financial authority, authenticated App/Admin architecture, API authority, ledger logic, Gate 04/05 evidence, security boundaries or provider architecture.

## Brand thesis

Neptlium is one financial company serving invested capital and operational capital.

> **Financial infrastructure and capital systems for people and businesses.**

Neptlium uses contrast as a brand system. Personal and Business share typography, spacing, header, footer, interaction language, product-frame language, motion principles, disclosures and financial-truth rules. Journeys differ through content, surface rhythm, information density and workflows rather than separate brand identities.

## Public architecture

Canonical top-level navigation:

1. Personal — `/personal`
2. Business — `/business`
3. Platform — `/platform`
4. Insights — `/insights`
5. Security — `/security`
6. Company — `/company`

Canonical product/story routes include `/personal`, `/business`, `/platform`, `/investments`, `/capital`, `/portfolio`, `/allocation`, `/treasury`, `/insights`, `/security`, `/company` and `/risk-disclosure`.

## Semantic surface system

Marketing pages are composed from six semantic environments. Pages must not introduce arbitrary background hex values; use the surface contract in `apps/web/app/marketing-surfaces.css`.

### Carbon

Tokens: `--npt-carbon-950` through `--npt-carbon-800`, `--npt-on-carbon`, `--npt-on-carbon-muted`.

Use for premium hero moments, security, governance, financial architecture, selected product canvases and high-confidence closing statements. Carbon is precise and serious, not cyberpunk or crypto-neon.

### White

Tokens: `--npt-pure-white`, `--npt-soft-white`, `--npt-ink`, `--npt-ink-secondary`.

White is a major Neptlium surface, not an exception. Use it for investor narratives, company storytelling, portfolio explanations and operational clarity. White sections depend on generous spacing and disciplined typography rather than decoration.

### Ivory

Tokens: `--npt-ivory`, `--npt-ivory-deep`.

Use for Personal, editorial finance, Insights and quiet narrative transitions where pure white would feel too clinical.

### Cloud

Tokens: `--npt-cloud-50`, `--npt-cloud-100`, `--npt-cloud-200`.

Cloud is an airy architectural neutral. It may use restrained radial light and tonal depth. It must not become a literal-cloud motif or SaaS-blue gradient treatment.

### Mineral

Tokens: `--npt-mineral-950` through `--npt-mineral-600`, plus `--npt-mineral-100` and `--npt-mineral-50`.

Mineral is a core identity environment for modern institutional finance. It is deliberately deeper and quieter than consumer-trading neon green. Use it for selected Business moments, allocation/governance stories and conversion resets. Do not make every CTA, icon, card and background Mineral.

### Mineral Light

Use `--npt-mineral-50` / `--npt-mineral-100` for policy, control and transition sections that need a green identity signal without the visual weight of a full Mineral field.

## Surface contract

Use semantic section attributes:

```tsx
<section data-npt-surface="carbon">…</section>
<section data-npt-surface="white">…</section>
<section data-npt-surface="ivory">…</section>
<section data-npt-surface="cloud">…</section>
<section data-npt-surface="mineral">…</section>
<section data-npt-surface="mineral-light">…</section>
```

The surface layer derives foreground, muted text, line color and raised treatment. Product UI may intentionally cross environments. Use `data-npt-product-canvas="dark"` to preserve a dark product canvas when it is staged on White, Ivory, Cloud or Mineral.

Do not build a page as Carbon → Carbon → Carbon. Typical rhythm should alternate visual weight, for example Carbon → Cloud → White → Mineral → Carbon → Ivory.

## Route surface intent

- **Home:** Carbon hero; meaningful Cloud/White/Ivory storytelling; a major Mineral Business moment; Carbon only where it adds authority.
- **Personal:** lighter consumer-investor experience led by Ivory/White/Cloud, with selected Mineral and Carbon control moments.
- **Business / Neptlium Treasury:** stronger Mineral identity with White operational clarity, Cloud breathing room and Carbon payment/audit canvases.
- **Platform:** architectural Carbon → Cloud/White → Mineral/Carbon progression.
- **Security:** Carbon for authority, but White/Cloud/Mineral must carry explanatory sections.
- **Company:** primarily White/Ivory/Cloud with selective dark or Mineral resets.

## Typography

Neptlium uses one modern sans-serif stack. The implementation continues to use the existing Geist-led production-safe stack in `globals.css`; do not add decorative font pairings merely for marketing pages.

Scale:

- Hero: `clamp(64px, 7.5vw, 124px)`
- Major section: `clamp(44px, 5.5vw, 84px)`
- Feature: approximately 34–60px
- Editorial: 32–52px
- Lead: 20–24px
- Body: 17–20px
- Navigation: 14–16px
- Fine print: 12–14px

Rules:

- display type uses slightly tight tracking and intentional line breaks;
- use `text-wrap: balance` for large display headings where supported;
- avoid 4–6 line desktop hero headings and orphaned last words;
- body measure should generally remain near 60–72 characters;
- financial/product numerics use tabular lining numerals;
- avoid all-caps paragraphs, tiny low-contrast copy and unnecessary weight proliferation.

## Spacing and composition

Major desktop sections use approximately 120–200px of vertical rhythm. Light surfaces require generous negative space. Product visuals are allowed to dominate a section rather than being squeezed into card grids.

Reduce card dependence. Prefer open typography, full-width product stages, split editorial composition, restrained dividers and large statements. Cards are appropriate only when the content is genuinely a grouped object or comparison.

## Header and footer

The header is surface-aware at the page top. It supports light-on-dark, dark-on-light and light-on-Mineral. After scrolling it resolves to the stable Carbon command bar so section transitions do not make navigation flash between treatments.

The Carbon footer remains the stable family endpoint unless a future visual QA pass demonstrates a better system-level treatment.

## Product visual language

Personal concepts: Capital state, Portfolio intelligence, Allocation lifecycle, Activity and documents.

Business concepts: Treasury state, Payment lifecycle, Approvals and policy, Preflight, Risk evidence, Audit.

Shared concepts: Identity, Authority, Evidence, Ledger, Reconciliation, Audit.

Product visuals should intentionally cross surface environments: dark Capital UI on White, dark Neptlium Treasury command center on Cloud or Mineral, and light content fields against Carbon where appropriate. Any structural example that could be mistaken for live state must be labeled illustrative. No fake balances, AUM, returns, customer counts, payment history, opportunity inventory, licensing or partner relationships.

## Financial truth

`UNKNOWN != ZERO`.

Configured is not live. Provider evidence is not canonical state. Modeled is not executed. Submitted is not settled. Settled is not reconciled. A wallet observation is not automatically canonical treasury truth.

Investment categories must be labeled truthfully as live, limited, informational or developing where appropriate. Business capabilities must not imply unsupported rails or onboarding.

## AI boundary

AI may explain, summarize, detect, prepare or recommend when such capability exists. AI may not be marketed as authority to approve, sign, override policy, change ledger truth or rewrite audit history.

## Accessibility, motion and performance

WCAG 2.2 AA is the minimum target. Every Carbon, White, Ivory, Cloud, Mineral and Mineral Light pairing must preserve readable text, muted copy, links, focus state and controls. Motion explains hierarchy or state and must respect `prefers-reduced-motion`.

Keep the typography system to one tightly controlled family. Preload only critical resources, use appropriate font-display behavior, and avoid decorative media that causes layout shift or unnecessary transfer cost.

## Responsive QA contract

Release widths: 1440, 1280, 768, 390 and 360.

At each width inspect hero and section line breaks, body measure, navigation, buttons, labels, product numerics, disclosures and footer. Reject horizontal overflow, clipped headings, headings touching the viewport edge, trapped sticky sections, unreadable disclosures and inconsistent weights.

## Current implementation authority

- `apps/web/app/marketing-system.css`
- `apps/web/app/marketing-surfaces.css`
- `apps/web/app/unified-shell.css`
- `apps/web/app/unified-marketing.module.css`
- `apps/web/components/unified-product-visuals.tsx`
- `apps/web/components/site-header.tsx`
- `apps/web/components/mobile-navigation.tsx`
- `apps/web/components/site-footer.tsx`
- `apps/web/components/global-conversion-cta.tsx`
- `apps/web/lib/content/public-architecture.ts`
- `apps/web/lib/content/site.ts`

Legacy marketing CSS remains only for routes that have not completed migration and should be retired rather than expanded.
