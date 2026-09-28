# Web CSS dependency establishment — first-pass evidence

Status: PARTIAL INVENTORY; NO STYLESHEET REMOVAL AUTHORIZED.
Baseline: PR #111 branch `feat/web-experience-convergence-slice-1`, based on main `9c0cc63b95865cf6954dadbaf349b73df5d35a1d`.

## Verified loading and consumers

The root layout imports `@neptlium/ui/styles/nts.css`, `./globals.css`, and `./neptlium-visual-direction.css`. `globals.css` imports Tailwind and `packages/ui/src/styles/tokens.css`. These are runtime global styles; the root layout and shared package must be treated as a single dependency chain.

`app/page.tsx` imports `home-elite.module.css`; `app/portfolio/page.tsx` imports `product-pages.module.css` and `product-light-header.module.css`; `app/investments/page.tsx` imports `product-pages.module.css`; `app/treasury/page.tsx` imports the shared Treasury component and legacy Business content; `components/business-product-pages.tsx` imports `business-product-pages.module.css`.

`test/production-hardening.test.ts` explicitly requires the root layout to retain `neptlium-visual-direction.css`, and asserts that seven retired override stylesheets are NOT imported by the layout. Those files' existence is not proof of runtime use.

## Inventory (21 CSS files, including CSS Modules)

| File | Lines observed | First-pass classification |
| --- | ---: | --- |
| app/globals.css | 1872 | Active root global; canonical-token consumer; requires selector-level audit |
| app/neptlium-visual-direction.css | 1781 | Active root global; compatibility aliases and route compositions; test-protected |
| app/marketing-shell.css | 446 | Legacy global candidate; not root-imported; test excludes layout import |
| app/marketing-production.css | 252 | Legacy global candidate; imports shared brand tokens; test excludes layout import |
| app/unified-design.css | 291 | Legacy global candidate; own root token literals; test excludes layout import |
| app/apple-calibration.css | 199 | Legacy global candidate; test excludes layout import |
| app/product-showcase-calibration.css | 284 | Legacy global candidate; test excludes layout import |
| app/route-product-consolidation.css | 1028 | Legacy global candidate; test excludes layout import |
| app/detail-product-consolidation.css | 200 | Legacy global candidate; test excludes layout import |
| app/home-elite.module.css | 68 | Homepage consumer verified |
| app/marketing-platform.module.css | 125 | Production-hardening test reads this file; route consumer still to verify |
| app/product-pages.module.css | 15 | Portfolio/Investments/Allocation consumers verified |
| app/product-light-header.module.css | 3 | Portfolio/Capital consumers verified |
| app/unified-marketing.module.css | 729 | Business/Company consumers verified |
| app/personal/personal.module.css | 1209 | Route module; consumer and global escapes require tracing |
| app/products/product-depth.module.css | 323 | Product-route module; consumers to verify |
| app/insights/insights.module.css | 2 | Consumer to verify |
| app/investments/investments.module.css | 5 | Consumer to verify |
| app/security/security.module.css | 2 | Consumer to verify |
| components/business-product-pages.module.css | 1 | Shared business-product component consumer verified |
| components/site-chrome.module.css | 360 | Shared chrome consumer to verify |

The inventory contains 21 distinct CSS files.

## Authority conflicts requiring analysis

1. Root global styling exists in both `globals.css` and `neptlium-visual-direction.css`. Inspect selector cascade and route-specific selectors before migration.
2. The retired global files contain independent root declarations and/or broad selectors. Do not import them back into the root layout to make a visual fix.
3. `unified-design.css` hardcodes its own root palette; `marketing-production.css` aliases shared brand tokens. They represent different design generations, not interchangeable token authorities.
4. `production-hardening.test.ts` currently asserts some exact source structure. A valid future consolidation must update tests to enforce semantic behavior and one authority rather than preserving obsolete file names.
5. CSS Modules may contain `:global` rules; module filename alone does not guarantee local scope.

## Reproducible static inventory\n\nRun `node apps/web/scripts/css-dependency-report.mjs --json > web-css-dependencies.json` from the repository root. The read-only script scans Web and shared UI source files, records CSS import edges, candidate class/token consumers, root rules, global escapes and media-query counts. The JSON report is an input to manual verification, not a deletion certificate. This report has been committed as a tool; execution against a checked-out branch and browser baseline are still pending.\n\n## Safe migration order

1. Finish a complete TS/TSX/CSS import graph including dynamic imports and CSS `@import` references; include shared package style exports.
2. For each active stylesheet, map selector definitions to JSX class usage, `:global` escapes, root variables, media queries, and test dependencies.
3. Build a route-by-route visual baseline (mobile and desktop) before modifying broad global rules.
4. Migrate one selector family at a time into canonical shared UI tokens, Web global chrome, or route module. Keep legitimate route-specific visual compositions.
5. Remove an old file only when import graph, selector usage, tests, build and visual comparisons establish zero remaining consumers.
6. Require Web CI, browser QA, keyboard/mobile and reduced-motion verification. No financial/backend/provider changes.

## Explicit limitation

This document establishes a verified first-pass map, not an exhaustive selector-to-JSX graph. No stylesheet is certified unused or safe to delete on this evidence alone.
