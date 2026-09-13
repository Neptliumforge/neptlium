# Neptlium Unified Marketing Design System

**Status:** Authoritative for marketing design and marketing frontend in `apps/web`

**Architecture:** one company, two product journeys

- **Personal / Neptlium Capital** — individual investors and capital customers
- **Business / VaultRail** — organizations and treasury teams

This document supersedes the former Stage 01 Personal-first navigation, PR #68 visual assumptions, ivory-first marketing direction, and any documentation that treats VaultRail as a separate company or treats Neptlium Capital as the entire public product family.

It does not override the product constitution, canonical financial authority, authenticated App/Admin architecture, API authority, ledger logic, Gate 04/05 evidence, security boundaries or provider architecture.

## Brand thesis

Neptlium is one financial company serving invested capital and operational capital.

> **Financial infrastructure and capital systems for people and businesses.**

The website must feel like one brand. Personal and Business share typography, black-led surfaces, Mineral Teal, spacing, header, footer, buttons, product-frame language, motion principles, disclosures and financial-truth rules. Journeys differ through product content, information density and workflows rather than separate visual identities.

## Public architecture

Canonical top-level navigation:

1. Personal — `/personal`
2. Business — `/business`
3. Platform — `/platform`
4. Insights — `/insights`
5. Security — `/security`
6. Company — `/company`

Canonical product/story routes:

- `/personal`
- `/business`
- `/platform`
- `/investments`
- `/capital`
- `/portfolio`
- `/allocation`
- `/treasury`
- `/insights`
- `/security`
- `/company`
- `/risk-disclosure`

Legacy product URLs redirect into the canonical product-story routes where appropriate.

## Product destinations

- Neptlium Capital — `app.neptlium.com`
- VaultRail — `vault.neptlium.com`
- Public payment / invoice experience — `pay.neptlium.com`
- External API — `api.neptlium.com`
- Developer documentation — `docs.neptlium.com`
- Internal operations — `admin.neptlium.com`
- System status — `status.neptlium.com`

Do not route business users through the Personal investor login. Do not replace the Personal app with VaultRail.

## Visual system

Core palette:

- `--npt-black: #050505`
- `--npt-black-raised: #0D0D0D`
- `--npt-surface: #141414`
- `--npt-white: #F7F7F2`
- `--npt-muted: #A7A7A1` accessible refinement of the muted target
- `--npt-line: rgba(255,255,255,0.10)`
- `--npt-teal: #35D5C1`
- `--npt-teal-soft: #8CE8DC`
- `--npt-ivory: #F3F0E8`
- `--npt-ink: #101010`

Black is the dominant canvas. Ivory is deliberate contrast. Teal is a precision signal, never a neon flood or a separate Business color brand.

## Typography and layout

- Hero: `clamp(64px, 8vw, 128px)`
- Major section: `clamp(48px, 6vw, 88px)`
- Secondary feature: `clamp(36px, 4vw, 64px)`
- Lead: 20–24px
- Body: 17–20px
- Navigation: 14–16px
- Disclosure: 12–14px

Desktop content width is approximately 1440–1600px. Major sections use 112–192px vertical rhythm; mobile major rhythm remains 72–112px. Mobile is recomposed, not compressed desktop.

## Navigation and account entry

The global header exposes the six canonical public domains. `Sign in` and `Get started` may present a lightweight product chooser:

- Personal → Neptlium Capital
- Business → VaultRail

Personal account creation may route to the verified app sign-up destination. Business uses VaultRail directly for returning users and a contact/request-access path until a verified onboarding URL is established.

## Product visual language

Marketing visuals originate from Neptlium product concepts:

Personal:
- Capital state
- Portfolio intelligence
- Allocation lifecycle
- Activity and documents

Business:
- Treasury state
- Payment lifecycle
- Approvals and policy
- Preflight
- Risk evidence
- Audit

Shared:
- Identity
- Authority
- Evidence
- Ledger
- Reconciliation
- Audit

Any structural example that could be mistaken for live state must be labeled illustrative. No fake balances, AUM, returns, customer counts, payment history, opportunity inventory, licensing or partner relationships.

## Financial truth

`UNKNOWN != ZERO`.

Configured is not live. Provider evidence is not canonical state. Modeled is not executed. Submitted is not settled. Settled is not reconciled. A wallet observation is not automatically canonical treasury truth.

Investment categories must be labeled truthfully as live, limited, informational or developing where appropriate. Business capabilities must not imply unsupported rails or onboarding.

## AI boundary

AI may explain, summarize, detect, prepare or recommend when such capability exists. AI may not be marketed as authority to approve, sign, override policy, change ledger truth or rewrite audit history.

## Motion and accessibility

Motion explains hierarchy or state and must respect `prefers-reduced-motion`. No financial result may be implied by animation. WCAG 2.2 AA is the minimum target: one H1, semantic landmarks, keyboard navigation, visible focus, accessible names, 44px+ touch targets, high contrast and no critical meaning conveyed by color or motion alone.

## Responsive contract

Release widths:

- 1440
- 1280
- 768
- 390
- 360

No horizontal overflow, clipped display headings, trapped sticky sections or unreadable disclosures.

## Current implementation authority

- `apps/web/app/marketing-system.css`
- `apps/web/app/unified-shell.css`
- `apps/web/app/unified-marketing.module.css`
- `apps/web/components/unified-product-visuals.tsx`
- `apps/web/components/site-header.tsx`
- `apps/web/components/mobile-navigation.tsx`
- `apps/web/components/site-footer.tsx`
- `apps/web/components/global-conversion-cta.tsx`
- `apps/web/lib/content/public-architecture.ts`
- `apps/web/lib/content/site.ts`

Legacy marketing CSS remains only for routes that have not yet completed migration and should be retired rather than expanded.
