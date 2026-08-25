# Neptlium Web Marketing System

**Status:** Authoritative for `apps/web`  
**Scope:** Public marketing architecture, tone, CTA hierarchy, navigation, footer, responsive behavior, and visual-material direction  
**Category:** Capital Operating Platform

This document refines the Web-specific interpretation of `docs/03_DESIGN_SYSTEM.md`. Where the central design system permits a broad range of marketing expression, this document defines the current public-Web direction.

## 1. Web objective

`apps/web` should make Neptlium feel understandable before it feels impressive.

The public experience is calm, conversational, product-led, institutionally credible, medium-scale, and visually soft without becoming playful, bubbly, glassy, or generic SaaS.

The visitor should quickly understand:

1. what Neptlium brings together;
2. how Portfolio, Capital Account, Treasury, and Allocation relate;
3. why connected capital work matters;
4. how control remains part of the operating model;
5. where to go next.

## 2. Canonical CTA system

The public marketing CTA pair is:

- **Primary:** `Enter Neptlium`
- **Secondary:** `Explore platforms`

`Enter Neptlium` links to the authenticated application entry point. Marketing must not replace it with `Request access` as the default global action.

`Explore platforms` links to `/platform` and is the canonical secondary action in the hero, mobile navigation, footer closing surface, and other broad marketing contexts where a second action is useful.

Contact remains available as a Company destination, not as the primary product-entry action.

## 3. Voice

Write like a clear, informed person explaining a serious product to another informed person.

Prefer:

- short declarative headlines;
- direct verbs;
- one idea per sentence;
- familiar words before institutional jargon;
- product meaning before category theory;
- concise support copy;
- visible outcomes and relationships rather than abstract architecture language.

Avoid:

- category essays as hero copy;
- oversized slogans;
- repetitive `institutional`, `operating environment`, `governed`, or `infrastructure` phrasing when a simpler sentence works;
- engineering-state language;
- startup hype;
- retail-finance language;
- unsupported claims.

A useful test: if a sentence sounds like an internal architecture document rather than something a prospective customer would naturally read, rewrite it.

## 4. Type scale

Neptlium Web does not use giant typography as its main source of authority.

Recommended responsive bands:

- Hero H1: `clamp(3.1rem, 5vw, 4.5rem)`
- Major H2: `clamp(2.25rem, 4vw, 3.6rem)`
- Product/module H3: `1.35rem–2rem`
- Lead: `1.05rem–1.2rem`
- Body: `0.95rem–1.05rem`
- Utility/navigation: `0.78rem–0.9rem`

Authority comes from composition, clarity, restraint, material, and product evidence—not extreme scale.

## 5. Material direction

Canonical colors remain Warm Ivory, Carbon, Mineral Teal, Interaction Teal, Graphite, Stone, and Soft Mist.

Warm Ivory should feel like a digital material, not flat paper. Use subtle tonal layering, quiet high/low surfaces, restrained inset highlights, and low-contrast depth where useful.

Do not use:

- loud gradients;
- glassmorphism;
- high-glow shadows;
- large floating card stacks;
- soft consumer-fintech bubbles;
- decorative blur for its own sake.

Preferred radii:

- 4px for precision controls;
- 8px for buttons and menus;
- 10–12px for contained product surfaces;
- 16px only for rare broad atmospheric panels.

Use shadows sparingly and at low opacity. Borders should encode structure rather than imitate ruled paper.

## 6. Density and rhythm

The Web should feel calm but not empty.

Prefer medium section spacing and keep enough meaningful content in the first viewport to explain the product without scrolling through a poster-sized hero.

Major section spacing generally sits around 80–120px on desktop and 56–80px on mobile, adjusted by content.

Reduce repeated 1px divider rows. Use whitespace, grouping, tonal surface shifts, and alignment before borders.

## 7. Product-led storytelling

Marketing may use clearly illustrative product compositions when they do not fabricate live financial truth.

Illustrations should show relationships such as:

- Portfolio context alongside Treasury;
- Allocation intent before action;
- Capital Account as movement context;
- review and control boundaries;
- connected operating surfaces.

Illustrative states must be obviously demonstrative and must not imply customer balances, execution, settlement, performance, provider availability, or live product data.

Prefer a few medium product compositions over abstract decorative architecture everywhere.

## 8. Homepage architecture

The homepage follows this narrative:

1. **Hero:** simple promise + concise explanation + `Enter Neptlium` / `Explore platforms`.
2. **Connected work:** why portfolio, treasury, capital movement, and allocation belong in one view.
3. **Platform model:** Portfolio, Capital Account, Treasury, Allocation in a compact scannable composition.
4. **Product story:** medium illustrative composition showing how context becomes deliberate action.
5. **Control:** identity, authorization, review, and auditability explained plainly.
6. **Audience:** investment firms, family offices, and treasury teams without persona marketing theatre.
7. **Closing:** conversational final statement + canonical CTA pair.

No homepage section should rely on a huge heading merely to create visual importance.

## 9. Desktop navigation

Canonical groups remain Platform, Solutions, Resources, and Company.

Mega menus are compact soft-surface disclosures, not command palettes. Descriptions are short and conversational.

Examples:

- `Overview` — See how Neptlium fits together.
- `Portfolio` — Understand what you own and where it sits.
- `Treasury` — See liquidity in context.
- `Allocation` — Shape where capital should go.
- `Capital Account` — Keep capital movement organized.

The header primary action is `Enter Neptlium`.

## 10. Mobile navigation

Mobile navigation is a top-origin full-height sheet with:

- canonical brand at the top;
- accordion groups;
- concise child descriptions;
- 44px+ touch targets;
- body scroll lock;
- focus containment and restoration;
- Escape close;
- route close;
- one expanded group where practical.

The bottom action area contains:

- `Enter Neptlium`
- `Explore platforms`

Contact remains inside Company.

## 11. Footer architecture

The footer is not a giant closing poster.

Structure:

1. brand + one conversational proposition;
2. `Enter Neptlium` and `Explore platforms`;
3. compact navigation groups;
4. concise legal/base row.

Preferred closing language should sound natural, for example:

> Keep your capital work connected.

Supporting copy should be one or two short sentences. Avoid oversized footer headlines and repeated category slogans.

## 12. Motion

Motion is quiet and functional.

Use it for disclosure, hover/focus continuity, small product-state illustration transitions, and justified section entrance only.

No continuous decorative motion. No motion that implies financial execution or live market activity.

## 13. Responsive rules

Mobile is not a compressed desktop poster.

At small widths:

- reduce heading size early;
- stack product compositions before they become cramped;
- keep CTA buttons reachable and readable;
- avoid edge-to-edge text blocks;
- preserve useful density;
- keep navigation labels conversational and short.

Validate at `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+`.

## 14. Web implementation architecture

The Web CSS stack should converge toward clear ownership rather than accumulated correction layers.

Preferred responsibilities:

- `globals.css` — reset, shared tokens, base typography, generic accessibility primitives;
- `marketing-shell.css` — header, desktop disclosure, mobile navigation, shared marketing shell;
- `neptlium-visual-direction.css` — current homepage/material direction;
- route-specific CSS only where a route genuinely needs a distinct composition.

Do not create a new global override file for every visual iteration. Delete superseded layers once their rules are migrated.

## 15. Deployment and security

Web deploy configuration must not remove required security headers merely to make a deployment succeed.

The Vercel project for `apps/web` should build Web deterministically. App, Admin, and API projects should independently ignore Web-only commits unless shared dependency changes require their deployment.

Canonical search authority is `https://neptlium.com`; `www.neptlium.com` permanently converges to the apex.

## 16. Validation

Every material Web reconstruction must run:

```sh
git diff --check
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Then validate navigation, keyboard/focus behavior, representative mobile widths, CTA destinations, route/link integrity, canonical/robots/sitemap behavior, social assets, console errors, and production routing.

Report every check as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`.
