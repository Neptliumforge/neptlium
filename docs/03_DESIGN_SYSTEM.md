# Neptlium Design System

**Status:** Authoritative  
**Doctrine:** Capital Precision  
**Runtime token authority:** `packages/ui/src/styles/tokens.css`

> Complex capital, rendered with absolute clarity.

## Architecture

The visual dependency direction is:

```text
packages/ui/src/styles/tokens.css
  → shared UI primitives
  → design-system utilities (when needed)
  → application composition
```

Applications import `@neptlium/ui/styles/tokens.css` directly. The design-system package is not a palette authority. Its `tokens.css` export is a deprecated compatibility forwarder only; it must never define or override tokens. Design-system utilities consume canonical semantic variables.

Do not create application-local palettes or duplicate semantic tokens. Add a canonical semantic token only when an existing token cannot express a real reusable role.

## Capital Precision

Neptlium is an institutional capital operating platform. Interfaces must be precise, quiet, engineered, premium, information-first, financially serious, and excellent on mobile.

The product must not resemble a crypto exchange, retail brokerage, gaming interface, neon Web3 product, generic SaaS dashboard, or card-heavy template. Prefer hierarchy, alignment, spacing, typography, tonal separation, and restrained borders over decoration.

## Color

Near-black and blue-black establish the canvas and surfaces. Neutral whites carry primary information; cool neutrals carry secondary and muted information.

Neptlium blue is the sole brand and action accent. Use it for identity, links, focus, selection, information, and primary actions.

Green, amber, and red are semantic only:

- green: positive or successful state
- amber: warning, review, or pending state
- red: negative, failed, or destructive state
- blue: information, selection, or action
- neutral: inactive, unavailable, or unknown state

A value's existence does not make it green. Gold is not a premium, VIP, or brand signal. Emerald and purple are not alternate brand accents. Decorative multicolor gradients and glow are prohibited. The current blue logo gradient is a temporary geometry-level exception.

The implemented appearance is dark. Do not add light-theme overrides until a complete, tested light appearance is intentionally designed.

## Typography

Use the existing repository font strategy. `--font-sans` is the product family and has a system fallback; `--font-mono` is reserved for technically meaningful values.

Application hierarchy remains compact:

- application page title: approximately 22–28px
- section title: approximately 18–22px
- subsection or operational title: approximately 15–18px
- body: 14–16px
- metadata: 12–13px
- micro labels: 11–12px

Use regular 400, medium 500, and semibold 600 by default. Avoid oversized dashboard headings and unnecessary bold weight.

## Financial numerics

Balances, quantities, percentages, rates, and aligned financial columns use the sans product family with `font-variant-numeric: tabular-nums`. Preserve stable width, clear decimal alignment, and a visible hierarchy between primary figures and supporting units.

Use monospace for wallet addresses, transaction hashes, identifiers, API values, and code-like information. Ordinary balances must not look like developer tooling.

## Surfaces

Canonical surface roles are:

- `--color-canvas`: application canvas
- `--color-sidebar`: persistent side navigation
- `--color-topnav`: top navigation
- `--color-surface-primary`: primary working surface
- `--color-surface-secondary`: secondary grouped surface
- `--color-surface-raised`: elevated or floating surface
- `--color-surface-inset`: recessed controls or data regions
- `--color-surface-floating`: popovers and dialogs
- `--color-surface-overlay`: modal scrim

Do not default every group to a card. Use a surface only when it communicates grouping, hierarchy, interaction, or elevation.

## Borders

Borders are subtle and structural. Use hairlines for quiet separation, default borders for controls and explicit boundaries, and strong or interactive borders only for emphasis and state. Do not outline every block.

## Radii

Operational controls and surfaces generally use 6–10px. The canonical scale provides 4px, 6px, 8px, 12px, and 16px values. Reserve 12–16px for dialogs and large composed containers. Pill geometry is for status and compact controls only.

## Elevation

Depth comes first from tonal surface separation. Shadows are restrained and correspond to hierarchy: none for canvas, shallow for working surfaces, moderate for floating content, and strongest only for critical overlays. Glow is not an elevation model.

## Motion

Motion communicates state, hierarchy, continuity, and confirmation:

- fast: 120ms
- normal: 180ms
- slow: 250ms

Use controlled ease-out or ease-in-out curves. Loading indicators may repeat while work is active. Settled UI becomes still. Normal shell and navigation logos are static; only an explicitly loading mark may use the loading animation.

All applications must respect `prefers-reduced-motion`.

## Accessibility

Maintain visible keyboard focus, semantic HTML, programmatic labels, sufficient hit areas, and contrast suitable for financial data. Never rely on color alone for status. Pair status color with text, iconography, or another accessible signal. Preserve readable zoom, reflow, and screen-reader announcements for meaningful state changes.

## Responsive principles

Mobile is a primary composition, not compressed desktop. Preserve hierarchy and financial truth at narrow widths, support safe areas and thumb-reachable actions, and allow dense data to scroll or recompose without truncating authoritative values. Avoid reproducing desktop card grids as a long mobile stack when a simpler hierarchy is clearer.

## Logo usage

Preserve the current Neptlium SVG geometry in this phase. The current blue gradient may remain. Normal application chrome uses a static mark. Indefinite logo animation is restricted to an explicit active-loading context and must honor reduced-motion preferences.

## Governance

New UI work must consume canonical semantic variables or shared primitives. Compatibility aliases are deprecated, documented in the canonical token file, and must not be used by new or modified code. Remove an alias only after repository-wide consumer inspection.

This document defines foundations only. It does not claim that unimplemented components, complete light appearance, page redesigns, or future brand-motion rules exist.
