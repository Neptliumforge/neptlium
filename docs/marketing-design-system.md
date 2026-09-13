# Neptlium Marketing Design System

**Status:** Authoritative for marketing design and marketing frontend in `apps/web`  
**Effective:** Stage 01 — September 2026  
**Supersedes:** prior ivory-first homepage direction and visual assumptions in PR #68 documentation

## Product principle

Neptlium marketing is a premium, product-first investment-platform experience. The visual system combines high-confidence editorial hierarchy, black-first cinematic pacing, restrained interaction, and Neptlium-specific financial-governance storytelling. External products may be quality references, never templates or sources of proprietary trade dress.

Financial truth outranks visual drama. Modeled is not executed. Submitted is not settled. Settled is not reconciled. Provider evidence is not canonical ledger truth.

## Core palette

- `--npt-black: #050505` — primary marketing canvas
- `--npt-black-raised: #0D0D0D` — raised black product surfaces
- `--npt-surface: #141414` — secondary product surface
- `--npt-white: #F7F7F2` — primary type
- `--npt-muted: #A7A7A1` — secondary type
- `--npt-line: rgba(255,255,255,0.10)` — dark-surface rules
- `--npt-teal: #35D5C1` — primary Neptlium identity/action signal
- `--npt-teal-soft: #8CE8DC` — restrained supporting accent
- `--npt-ivory: #F3F0E8` — intentional contrast sections only
- `--npt-ink: #101010` — type on ivory and teal

Teal is controlled. No Robinhood green, neon flooding, random gradients, generic crypto glow, or decorative color without product meaning.

## Typography

- Hero display: `clamp(64px, 8vw, 128px)`
- Major section: `clamp(48px, 6vw, 88px)`
- Secondary feature: `clamp(36px, 4vw, 64px)`
- Lead: 20–24px
- Body: 17–20px
- Navigation: 14–16px
- Disclosure: 12–14px

Display copy uses tight tracking, restrained weight and short line lengths. Numeric/product typography must remain clean and tabular where required. No weak section hierarchy or tiny feature copy.

## Layout and rhythm

Desktop content width is approximately 1440–1600px through `--npt-shell`. Major sections use 112–192px vertical rhythm; compact sections use 88–136px. Mobile major rhythm remains 72–112px.

Prefer full-width cinematic sections, asymmetry, large product canvases and deliberate sticky copy. Avoid generic feature-grid cadence, card spam and admin-dashboard density.

## Navigation

Canonical primary navigation:

1. Platform — `/platform`
2. Investments — `/investments`
3. Capital — `/products/capital-account`
4. Insights — `/insights`
5. Security — `/security`
6. Company — `/company`

Account actions are **Sign in** and **Open account**. The mobile menu is a modal dialog with focus containment, Escape close, focus restoration and body scroll lock.

## Buttons

Primary actions use teal on dark or another high-contrast treatment. Secondary actions use restrained border/ghost styling. Editorial actions are text links with directional arrows. Default target height is 54px for major conversion controls. Radius is restrained; never bubbly.

## Product visuals

Marketing visuals must originate from Neptlium concepts:

- capital state;
- treasury lifecycle;
- portfolio intelligence;
- allocation lifecycle;
- activity timeline;
- company/investment context;
- reporting/document surfaces;
- mobile account frame.

Illustrative surfaces must be labeled when they could be mistaken for live state. No fake balances, AUM, returns, customer counts, opportunity inventory or transaction history.

## Motion

Motion explains hierarchy or state. Use CSS/native capabilities by default. Entry motion is short and non-perpetual. State transitions may illustrate capital flow or lifecycle progression. `prefers-reduced-motion` must collapse animation and transition duration. No gratuitous spring systems or GPU-heavy ambience.

## Accessibility

Every page requires one H1, semantic landmarks, keyboard navigation, visible focus, accessible names, high contrast and responsive reading order. No critical meaning may depend on color or animation alone. Mobile navigation must preserve focus and prevent background scroll.

## Disclosure and claims

Public financial features must be framed as live, limited, coming soon, illustrative or informational when availability requires qualification. Do not imply unsupported USD funding, unsupported digital-asset rails, guaranteed performance, licensing, regulatory status, advisory authority, partnerships or product inventory.

Reusable claim copy comes from `apps/web/lib/content/site.ts`; reusable rendering is available through `MarketingDisclosure`.

## Homepage architecture — Stage 01

1. Hero — **Capital, intelligently managed.** with governed capital-state visual.
2. Product system reveal — Capital → Treasury → Allocation → Portfolio.
3. Capital — Available / Reserved / Allocated.
4. Treasury — Fund → Settle → Reconcile → Available.
5. Investment experience — conservative capability labels.
6. Portfolio intelligence — Positions / valuation context / allocation / activity / reporting.
7. Allocation — MODEL → REVIEW → APPROVE → RESERVE → EXECUTE → RECONCILE.
8. Security and financial governance — authority / execution / evidence / reconciliation.
9. Activity and documents — illustrative evidence timeline.
10. Insights — editorial hierarchy, not a generic blog-card grid.
11. Global conversion — **Your capital deserves a better operating system.**

## Responsive contract

Validate at 1440, 1280, 768, 390 and 360 CSS-pixel widths. Mobile is recomposed rather than shrunk: product grids stack, lifecycle arrows collapse, sticky copy becomes static, display typography stays powerful, controls remain touch-safe and no horizontal overflow is permitted.

## Implementation authority

Stage 01 source of truth:

- `apps/web/app/marketing-system.css`
- `apps/web/app/homepage-stage01.module.css`
- `apps/web/components/homepage-product-visuals.tsx`
- `apps/web/components/site-header.tsx`
- `apps/web/components/mobile-navigation.tsx`
- `apps/web/components/site-footer.tsx`
- `apps/web/components/global-conversion-cta.tsx`
- `apps/web/components/marketing-disclosure.tsx`

Legacy marketing styles remain temporarily available for routes not yet migrated. Future page stages should consume this system and retire route-specific legacy CSS as those routes are rebuilt.
