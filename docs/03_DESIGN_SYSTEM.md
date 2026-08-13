# Neptlium — Unified Design Direction

**Status:** Authoritative  
**Scope:** `neptlium.com`, `app.neptlium.com`, shared UI  
**Category:** Digital Capital Operating Infrastructure  
**Primary expression:** Capital, organized around you.

> Marketing establishes authority and meaning. The application establishes control and operation.

This document supersedes the previous Capital Precision visual doctrine wherever it conflicts with this direction. Marketing and product are one institution at two levels of intensity, not separate brands.

## 1. Surface relationship

### Marketing
Editorial · Institutional · Dimensional · Composed · Memorable.

Marketing may use larger typography, broader negative space, controlled optical depth, restrained brand motion, selective dark authority sections, larger system diagrams and stronger compositional transitions. Expression must communicate architecture or meaning; decoration alone is not a reason.

### Authenticated product
Operational · Precise · Quiet · Dense · Controlled.

The application uses tighter rhythm, fewer effects, stronger information density, immediate financial readability, explicit state hierarchy and disciplined action placement. It is the same institution after the ceremony ends and the work begins.

### Shared DNA
Both surfaces share mark geometry, proportions, Precision Blue, dark-foundation family, spacing semantics, border/radius philosophy, accessibility, writing tone and motion principles.

## 2. Typography

Marketing display family: **Universal Sans**. Use for homepage H1, major page titles, high-level section statements and closing institutional propositions.

| Role | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- |
| Hero | 64–72px | 500–600 | .98–1.04 | -.035em |
| Major display | 52–64px | 500–600 | 1.00–1.06 | -.030em |
| Page title | 44–52px | 500–600 | 1.04–1.10 | -.025em |
| Section title | 30–38px | 500–600 | 1.10–1.18 | -.018em |
| Editorial lead | 20–24px | 400 | 1.45–1.60 | normal |

Product family: **Geist**. Use for navigation, balances, account values, tables, forms, labels, history, allocation controls, status, metadata, settings and authentication.

| Role | Size | Weight |
| --- | --- | --- |
| Page title | 28–32px | 550–600 |
| Section title | 20–24px | 550–600 |
| Financial primary value | 28–40px | 500–600 |
| Component title | 16–18px | 550 |
| Body | 14–16px | 400 |
| Label | 13–14px | 500 |
| Metadata | 11–13px | 400–500 |

Financial values use tabular numerals. Monospace is reserved for hashes, addresses, request IDs and genuinely technical identifiers. Universal Sans is not used for dense financial operation.

Font binaries are not committed merely to imitate the target family. Until approved assets are available, runtime stacks must degrade safely without changing hierarchy.

## 3. Color architecture

### Dark foundation

```text
Absolute Black       #000000
Obsidian             #05060B
Blue Black           #050B15
Ink Black            #0A111F
Midnight Surface     #0C1324
Deep Navy            #0D162A
Structural Navy      #151F3D

Primary text         #F8F9FC
Secondary text       #E7EAF0
Supporting text      #B7BBC6
Muted metadata       #9297A4
```

### Precision Blue

```text
Primary interaction  #258BE5
Hover                 #319EED
Structural accent     #16A8E8   rare
Optical highlight     #12C6E3   rare
```

Blue indicates primary action, current navigation, selection, keyboard focus, active system path, limited visualization emphasis and meaningful links. It must not become the canvas, every border, every heading, every icon, every metric or a generic decorative effect.

### Light foundation

```text
Canvas                #FFFFFF
Secondary canvas      #F8F9FC
Cool canvas           #F3F5F8
Recessed surface      #EEF2F7
Primary text          #05060B
Strong secondary      #0A111F
Body text             #273247
Muted text            #596579
Quiet metadata        #778296
Quiet border          #E5E9F0
Standard border       #D8DEE8
Elevated border       #C8D1DF
```

Precision Blue remains `#258BE5` in both themes.

## 4. Theme behavior

Authenticated Neptlium supports **System · Light · Dark**. Default is System. A manual preference overrides system state and persists. Resolve the theme before hydration to avoid an obvious flash. Browser color metadata should reflect light/dark mode where technically appropriate. Logo geometry never changes between themes.

Marketing remains intentionally composed rather than mechanically theme-inverted; selective light/dark sections are part of its editorial architecture.

## 5. Motion

Marketing motion: 320–500ms editorial transitions, controlled fade/translate entrances, slow system-line illumination, restrained path progression and rare one-time reveal moments. No continuous floating, scroll hijacking or motion that competes with reading.

Product motion: instant 80–120ms, interface 140–200ms, panel 180–240ms, drawer 220–300ms. Animate navigation, accordions, state changes, hover/focus and panel transitions. Never theatrically animate balances, transaction amounts, reconciliation, deposits or withdrawals.

Typing is a brand primitive only. It may type a proposition once at 30–40ms per character with a thin cursor that disappears. Never use typing to imply financial progress. Reduced-motion users receive complete text immediately.

## 6. Scroll behavior

Marketing earns cinematic feel through composition and spacing, never altered browser physics. Sticky architecture is allowed only when genuinely useful. Product scrolling remains native, immediate and non-narrative.

## 7. Operational Overview

Hierarchy: **capital position → account state → activity → operating surfaces**.

A confirmed zero may render `$0.00`. Unknown state must never render as zero. Infrastructure explanations do not replace genuine zero balances.

Primary financial values are high-contrast, medium-weight, tabular and unadorned. No gradients, blue-number styling, ticker behavior or decorative LIVE labels.

## 8. Surfaces and cards

Neptlium is not a card collection. Prefer sections, rows, grouped surfaces, hairline separators and compositional planes. Marketing cards may be larger/editorial. Product cards are flatter, tighter, lower-radius, quieter and denser. No floating glass tiles or giant rounded rectangles.

## 9. Buttons

Primary controls use solid `#258BE5`, white text and `#319EED` hover. No gradient and no glow. Secondary controls use a quiet structural border appropriate to the active theme.

A visible control without a functional backend must remain financially inert and must never create fake state.

## 10. Navigation

Marketing navigation is editorial and spacious. Product navigation is compact and permanent where useful.

Canonical product primary navigation:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

Blue indicates active location without turning navigation into a blue interface.

## 11. Forms

Financial forms use descriptive labels, persistent errors, inline validation and explicit review before consequential actions. Preserve the sequence **input → review → authorization → outcome**. A button click must never visually imply settlement.

## 12. Tables and mobile activity

Desktop comparison uses compact rows, aligned numerics, muted metadata and restrained status. Mobile transforms tables into structured records rather than squeezing desktop columns.

## 13. Empty, loading and error states

Empty states communicate readiness: `No holdings yet.` / `Deposit` rather than exposing provider plumbing.

Loading reserves space with subtle skeletons and minimal shimmer. Never invent a number while loading and never show `$0.00` until zero is confirmed.

Errors are concise and user-facing, for example: `Balance unavailable. We couldn't load your latest account state. Retry.` Internal provider/storage/reconciliation detail belongs in logs, admin or diagnostics.

## 14. Marketing character

Marketing uses Universal Sans, broader grids, architectural diagrams, larger whitespace, midnight authority transitions, limited optical blue/cyan and an expressive brand mark. Restraint remains mandatory.

## 15. Product character

Product uses Geist, tighter spacing, smaller radii, fewer effects, stronger data alignment, less copy, immediate action structure and consistent state presentation. The intended feeling is: **I am now operating the system.**

## 16. Experience transition

On `neptlium.com`: **This is a serious capital infrastructure company.**  
On `app.neptlium.com`: **I am inside the capital operating environment.**

Moving into the app increases density, quiets motion, removes decoration, makes actions explicit and puts capital state at the center without changing institutional identity.

## 17. Governing expression

> Black and midnight establish authority.  
> White establishes clarity.  
> Precision Blue establishes direction.  
> Typography establishes hierarchy.

> Marketing explains the institution.  
> The application operates it.

## 18. Runtime authority

Shared brand semantics live in `packages/ui/src/styles/brand.css`. Operational semantic compatibility remains in `packages/ui/src/styles/tokens.css`. `apps/web` may add marketing-only composition layers; `apps/app` may add product-only operational mappings. Neither surface may invent a competing palette.

Older cobalt/electric-blue, Paper-only, Capital Precision, gradient-button, glow-heavy or single-font assumptions are non-authoritative where they conflict with this document.
