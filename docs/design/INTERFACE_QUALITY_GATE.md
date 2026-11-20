# Neptlium interface quality gate

## Authority and scope

Neptlium already has a canonical token authority in `packages/ui/src/styles/tokens.css`, reusable UI primitives in `packages/ui/src/components`, motion constants in `packages/ui/src/theme/motion.ts`, and compatibility utilities in `packages/design-system`. Improve these existing packages; do **not** introduce a competing design system, palette, or app-specific component library.

Design benchmark: Vercel's precise developer ergonomics and Linear's dense, accessible interaction patterns, expressed in Neptlium's own graphite/mineral-teal visual language. References are quality benchmarks, not assets or source code to copy.

## Acceptance criteria

1. **Token authority** — All product colors, typography, spacing, radii, shadows, status, and motion reference canonical shared tokens. No locally invented status semantics or arbitrary colors.
2. **Accessible interaction** — Visible keyboard focus, logical tab order, labeled form controls, semantic landmarks, touch targets, and a reduced-motion path. Automated tests complement manual keyboard and screen-reader review.
3. **Responsive shells** — Capital, Treasury, Pay, and Admin retain readable content and usable navigation at 320px, tablet, and desktop widths. No horizontal overflow in primary workflows.
4. **Financial truth** — Loading, empty, unavailable, pending, restricted, failed, and reconciled states are distinct; client-side visuals cannot imply provider settlement or available capital without API evidence.
5. **Performance** — Prefer server rendering and CSS transitions; avoid animation on critical financial data, layout-shifting motion, and unnecessary client bundles.
6. **Safe rollout** — Visual changes on a feature branch, preview validation only, no auth/ledger/DB/provider capability changes, and no production deployment without review.

## Implementation order

- Inventory existing shared primitives and app imports; record duplication before editing.
- Add static checks for token authority and reduced-motion support; preserve existing theme compatibility.
- Refine one shared component at a time, with tests and accessible keyboard behavior.
- Validate representative Capital, Treasury, Pay, and Admin screens on Preview before extending the pattern.

## Release gate

A passing build alone does not certify design quality. Require component tests, accessibility checks, responsive visual review, and explicit confirmation that financial-state wording still matches server authority.
