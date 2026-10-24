# Marketing Website Audit — 2026-10-22

**Status:** CURRENT evidence for `apps/web` at branch `ccr-ac327ff5-db5l9v` (base `main` 8aa8a2e3).
**Design authority:** [`docs/experience/DESIGN_SYSTEM.md`](../../../docs/experience/DESIGN_SYSTEM.md), which includes the new §8 "Marketing surface specification".

## Method and limits

- **Inventory:** from source. Routes, `ROUTE_POLICY`, `next.config.mjs` redirects, sitemap, robots and metadata assets.
- **Browser evidence:** a local production build (`next build && next start`) driven by Playwright Chromium 1194 with axe-core 4.12.1.
  - Run: 51 routes × 6 widths (360, 390, 430, 768, 1024, 1440) × Dark and Light, with reduced motion.
  - Axe ran at 390 and 1440 with the WCAG 2 A/AA and best-practice rule sets.
- **Production `neptlium.com`:** BLOCKED. The session's egress proxy refuses the host, so no production claim is made.
- **Lighthouse and Core Web Vitals:** NOT RUN. Lighthouse is not installed, and field data needs production access.

## Route inventory

**Canonical and indexable (27, all in the sitemap):**

- `/`, `/capital`, `/portfolio`, `/allocation`, `/investments`
- the five `/investments/[slug]` collections
- `/treasury`, `/payments`, `/institutional`, `/infrastructure`, `/platform`, `/intelligence`
- `/insights`, `/learn`, `/solutions`, `/solutions/capital-visibility`, `/solutions/treasury-coordination`
- `/company`, `/contact`, `/security`, `/trust`, `/accessibility`

**Public supporting, noindex (13):**

- `/research`, `/pricing`, `/press`
- `/products`, `/products/performance`, `/products/capital-universe`
- `/legal`, `/privacy`, `/terms`, `/cookie-policy`, `/risk-disclosure`, `/e-delivery`, `/aml-kyc`, `/complaints`

**System, noindex and disallowed in robots:**

- the eight `/auth/*` routes
- `/maintenance`
- the 404 page

**Legacy permanent redirects (all 308):**

| From                               | To                           |
| ---------------------------------- | ---------------------------- |
| `/personal`                        | `/capital`                   |
| `/business`                        | `/treasury`                  |
| `/about`                           | `/company`                   |
| `/resources`                       | `/insights`                  |
| `/capital-account`                 | `/capital`                   |
| `/capital-activity`                | `/capital`                   |
| `/portfolio-intelligence`          | `/portfolio`                 |
| `/products/capital-account`        | `/capital`                   |
| `/products/treasury`               | `/treasury`                  |
| `/products/allocation`             | `/allocation`                |
| `/products/portfolio-intelligence` | `/portfolio`                 |
| `/products/infrastructure`         | `/infrastructure`            |
| `/performance`                     | `/products/performance`      |
| `/capital-universe`                | `/products/capital-universe` |
| `/neptlium-link`                   | `/platform`                  |
| `/solutions/allocation-workflows`  | `/allocation`                |
| `/solutions/governance-control`    | `/trust`                     |

**External destinations:**

- `/docs` → `docs.neptlium.com`
- `/status` → `status.neptlium.com`
- sign-in and sign-up → `app.neptlium.com/auth/*`
- Treasury access → `treasury.neptlium.com`
- social profiles (Bluesky, X, YouTube, TikTok)

**Generated metadata assets:** `/robots.txt`, `/sitemap.xml` (26 URLs), `/opengraph-image`, `/apple-icon`, `/icon.svg`.

## Prioritized defects found

| Severity | Defect                                                                                                                                      | Root cause                                                                                                                  | Outcome                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Nine routes rendered as unstyled text: Learn, Research, Pricing, Press, Contact header, two solution details, Performance, Capital Universe | Their layout classes were never defined in any loaded stylesheet                                                            | Fixed with the shared editorial grammar in `globals.css`                                                                                  |
| P0       | Capital, Portfolio, Allocation, Platform and Company had illegible dark-mode panels and headings, and zero page gutters                     | #101 removed the `--npt-*` alias layer while four modules still consumed it (`width: var(--npt-shell)` resolved to nothing) | Fixed by mapping the modules to canonical tokens                                                                                          |
| P0       | `/capital` appended the whole legacy Personal page below its own closing section (15,731px)                                                 | `CapitalPage` rendered `PersonalLegacyContent`                                                                              | Removed; the page is now 6,667px                                                                                                          |
| P0       | Light mode showed invisible H1s on `/solutions` and `/trust`                                                                                | `--web-ivory-high` was a fixed light colour under theme-relative ink                                                        | Derived from the theme's ivory                                                                                                            |
| P1       | 2,449 colour-contrast failures across 51 routes                                                                                             | Fixed teal labels on light, muted ink on deep backgrounds, hard-coded greys, white on teal buttons                          | Reduced to 0                                                                                                                              |
| P1       | `/products`, `/products/performance` and `/products/capital-universe` were indexable despite their noindex policy                           | `createPageMetadata` defaulted to indexing                                                                                  | It now follows `ROUTE_POLICY`; unit test added                                                                                            |
| P1       | 404, maintenance and auth pages declared the homepage as canonical                                                                          | Root layout `alternates.canonical: '/'`                                                                                     | Removed from the layout                                                                                                                   |
| P1       | Circular CTAs: `/capital` → `/personal` → `/capital`; `/platform` → `/personal` and `/business`                                             | Legacy identities in copy                                                                                                   | Linked to Capital, Portfolio and Treasury                                                                                                 |
| P2       | Heading-order violations on Allocation and Treasury                                                                                         | H3s inside illustrative mocks                                                                                               | Replaced with non-heading labels                                                                                                          |
| P2       | Touch targets under 24px (756 at 390px; footer and breadcrumbs at 20–22px)                                                                  | Inline links                                                                                                                | Footer links 24px (44px on touch), breadcrumbs and legal directory 24px; 66 remain (inline prose links and the visually hidden skip link) |
| P2       | Homepage hero label sat under the overlay header at 390px                                                                                   | Fixed padding below header height                                                                                           | Derived from `--header-marketing`                                                                                                         |
| P2       | `/about` returned 307                                                                                                                       | `redirect()`                                                                                                                | Changed to `permanentRedirect()` (308)                                                                                                    |
| P3       | About 3,600 lines of CSS never loaded                                                                                                       | Retired layers kept on disk                                                                                                 | 10 files removed (see `css-dependency-audit.md`)                                                                                          |

## Page-by-page matrix

Contrast/heading figures are axe violations summed over 390 and 1440 in Dark and Light. Height is the dark 1440 full-page height.

| Route                               | Policy                    | Status                | Robots           | Axe before → after | Height before → after | Outcome                                                                                                                |
| ----------------------------------- | ------------------------- | --------------------- | ---------------- | ------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| /                                   | canonical-indexable       | 200                   | index/follow     | 63 → 0             | 8142 → 8208           | Pass after fix: light-mode label contrast; hero clears the overlay header at 390px.                                    |
| /capital                            | canonical-indexable       | 200                   | index/follow     | 138 → 0            | 15731 → 6667          | Pass after fix: dark-mode illegible mock and bands; duplicated legacy Personal page removed; circular `/personal` CTA. |
| /portfolio                          | canonical-indexable       | 200                   | index/follow     | 132 → 0            | 7586 → 7612           | Pass after fix: retired token aliases; illustrative node contrast.                                                     |
| /allocation                         | canonical-indexable       | 200                   | index/follow     | 96 → 0             | 8119 → 8145           | Pass after fix: tokens; decorative H3 inside the illustration removed from the outline.                                |
| /investments                        | canonical-indexable       | 200                   | index/follow     | 58 → 0             | 4826 → 4852           | Pass (contrast inherited from shared fixes).                                                                           |
| /investments/ai-compute             | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3242 → 3248           | Pass after shared fixes.                                                                                               |
| /investments/cloud-software         | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3242 → 3248           | Pass after shared fixes.                                                                                               |
| /investments/digital-infrastructure | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3242 → 3248           | Pass after shared fixes.                                                                                               |
| /investments/energy-power           | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3242 → 3248           | Pass after shared fixes.                                                                                               |
| /investments/global-innovation      | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3242 → 3248           | Pass after shared fixes.                                                                                               |
| /treasury                           | canonical-indexable       | 200                   | index/follow     | 56 → 0             | 5670 → 5696           | Pass after fix: decorative H3; label contrast; 9px text raised to 11px. Local palette is TRANSITION.                   |
| /payments                           | canonical-indexable       | 200                   | index/follow     | 112 → 0            | 6865 → 6894           | Pass after fix: secondary ink on the teal and carbon bands. Local palette is TRANSITION.                               |
| /institutional                      | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 3149 → 3175           | Pass after shared fixes.                                                                                               |
| /infrastructure                     | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 3081 → 3107           | Pass after shared fixes.                                                                                               |
| /platform                           | canonical-indexable       | 200                   | index/follow     | 62 → 0             | 5900 → 5933           | Pass after fix: zero page gutter; legacy Personal/Business CTAs and labels.                                            |
| /intelligence                       | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 3158 → 3184           | Pass after shared fixes.                                                                                               |
| /insights                           | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 5219 → 5245           | Pass after shared fixes.                                                                                               |
| /learn                              | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3130 → 4962           | Pass after fix: entire definition page was unstyled.                                                                   |
| /research                           | public-supporting-noindex | 200                   | noindex/nofollow | 36 → 0             | 2810 → 3754           | Pass after fix: unstyled (DetailPage). Intentionally noindex.                                                          |
| /solutions                          | canonical-indexable       | 200                   | index/follow     | 56 → 0             | 4785 → 4811           | Pass after fix: light-mode invisible H1 and labels.                                                                    |
| /solutions/capital-visibility       | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 2580 → 3124           | Pass after fix: unstyled hero and chapters.                                                                            |
| /solutions/treasury-coordination    | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 2554 → 3098           | Pass after fix: unstyled hero and chapters.                                                                            |
| /solutions/allocation-workflows     | legacy-redirect           | 200 → /allocation     | index/follow     | 96 → 0             | 8119 → 8145           | Intentionally retained (legacy redirect).                                                                              |
| /solutions/governance-control       | legacy-redirect           | 200 → /trust          | index/follow     | 70 → 0             | 5084 → 5110           | Intentionally retained (legacy redirect).                                                                              |
| /company                            | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 6261 → 6292           | Pass after fix: zero page gutter (retired shell token).                                                                |
| /about                              | legacy-redirect           | 200 → /company        | index/follow     | 36 → 0             | 6261 → 6292           | Pass after fix: temporary 307 changed to permanent 308.                                                                |
| /contact                            | canonical-indexable       | 200                   | index/follow     | 36 → 0             | 3392 → 3684           | Pass after fix: unstyled page header; primary button contrast.                                                         |
| /security                           | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 5500 → 5526           | Pass after shared fixes.                                                                                               |
| /trust                              | canonical-indexable       | 200                   | index/follow     | 70 → 0             | 5084 → 5110           | Pass after fix: light-mode invisible H1; dark-band prose contrast.                                                     |
| /accessibility                      | canonical-indexable       | 200                   | index/follow     | 32 → 0             | 2663 → 2954           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /pricing                            | public-supporting-noindex | 200                   | noindex/follow   | 36 → 0             | 2619 → 3238           | Pass after fix: unstyled (DetailPage). Intentionally noindex.                                                          |
| /press                              | public-supporting-noindex | 200                   | noindex/nofollow | 36 → 0             | 2695 → 3522           | Pass after fix: unstyled (DetailPage). Intentionally noindex.                                                          |
| /products                           | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 3408 → 3434           | Pass after fix: was indexed despite noindex policy.                                                                    |
| /products/performance               | public-supporting-noindex | 200                   | noindex/nofollow | 40 → 0             | 2930 → 4368           | Pass after fix: unstyled; indexed despite policy; button contrast.                                                     |
| /products/capital-universe          | public-supporting-noindex | 200                   | noindex/nofollow | 38 → 0             | 2983 → 4283           | Pass after fix: unstyled; indexed despite policy.                                                                      |
| /products/infrastructure            | legacy-redirect           | 200 → /infrastructure | index/follow     | 32 → 0             | 3081 → 3107           | Intentionally retained (legacy redirect).                                                                              |
| /legal                              | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 2463 → 2755           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /privacy                            | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 7447 → 7715           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /terms                              | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 7604 → 7899           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /cookie-policy                      | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 3412 → 3704           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /risk-disclosure                    | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 4927 → 5283           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /e-delivery                         | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 4286 → 4701           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /aml-kyc                            | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 4458 → 4753           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /complaints                         | public-supporting-noindex | 200                   | noindex/nofollow | 32 → 0             | 4223 → 4519           | Pass after shared fixes (footer and link targets). Draft legal content is intentionally noindex.                       |
| /maintenance                        | authentication-system     | 200                   | noindex/nofollow | 36 → 0             | 1926 → 1952           | Pass after fix: inherited homepage canonical.                                                                          |
| /personal                           | legacy-redirect           | 200 → /capital        | index/follow     | 138 → 0            | 15731 → 6667          | Intentionally retained (legacy redirect).                                                                              |
| /business                           | legacy-redirect           | 200 → /treasury       | index/follow     | 56 → 0             | 5670 → 5696           | Intentionally retained (legacy redirect).                                                                              |
| /resources                          | legacy-redirect           | 200 → /insights       | index/follow     | 32 → 0             | 5219 → 5245           | Intentionally retained (legacy redirect).                                                                              |
| /this-does-not-exist                | 404                       | 404                   | noindex          | 36 → 0             | 1844 → 1870           | Pass after fix: inherited homepage canonical.                                                                          |
| /auth/sign-in                       | authentication-system     | 200                   | noindex/nofollow | 36 → 0             | 1894 → 1920           | Pass after fix: inherited homepage canonical.                                                                          |
| /auth/create-account                | authentication-system     | 200                   | noindex/nofollow | 36 → 0             | 1926 → 1952           | Pass after fix: inherited homepage canonical.                                                                          |

## Accessibility, SEO and performance results

**Axe-core** (51 routes × 2 widths × 2 themes):

- Before: 2,449 colour-contrast and 16 heading-order violations.
- After: 0.
- PASS (local build).

**Layout:**

- Horizontal overflow at 360/390/430/768/1024/1440, both themes: none, before or after. PASS (local build).
- Every route has exactly one H1. Before, 18 routes rendered their H1 at 16px body size; after, every H1 uses the display scale. PASS.
- Images: all have alt attributes. PASS.

**Metadata:**

- Every indexable route has a title, description, self-canonical, OpenGraph image and JSON-LD. PASS.
- The sitemap contains exactly the 26 canonical indexable routes. PASS.
- Robots disallows `/auth/` and `/maintenance`. PASS.

**Not measured:**

- Lighthouse and Core Web Vitals: NOT RUN (tool unavailable; production unreachable).
- Keyboard and menu behaviour: covered by the existing Playwright mobile-navigation and public-boundaries specs (see Validation).

## Validation

| Check                                               | Result                                        |
| --------------------------------------------------- | --------------------------------------------- |
| `git diff --check origin/main...HEAD`               | PASS                                          |
| `pnpm --filter @neptlium/ui typecheck` / `lint`     | PASS                                          |
| `pnpm --filter @neptlium/web typecheck` / `lint`    | PASS                                          |
| `pnpm --filter @neptlium/web test:node`             | PASS (98/98)                                  |
| `pnpm --filter @neptlium/web test:unit`             | PASS (27/27, 1 new)                           |
| `pnpm --filter @neptlium/web build`                 | PASS                                          |
| Playwright (5 projects, local build, Chromium 1194) | 721 passed, 6 skipped, 13 failed — see below  |
| Production browser validation                       | BLOCKED (egress proxy refuses `neptlium.com`) |
| Lighthouse / Core Web Vitals                        | NOT RUN                                       |

The 13 Playwright failures:

- **Docs/Status handoff (5):** BLOCKED. The test follows the redirect off-site, and the egress proxy refuses `docs.neptlium.com` and `status.neptlium.com`.
- **Infrastructure/Intelligence snapshots (8):** they fail identically on unmodified `main` 8aa8a2e3 in this sandbox (for example 25,141 differing pixels on `/infrastructure` light at 1440 in both runs). These are browser-build differences against baselines produced on GitHub-hosted Ubuntu, not regressions from this branch. CI is the authoritative run.

## Product truth

- **Claim scan:** public copy was scanned for returns, yields, AUM, customer counts, testimonials, licences, insurance, partnerships, and live execution or settlement claims. None were found outside negated or qualified statements.
- **Conversion CTAs:** they go to account creation at `app.neptlium.com/auth/sign-up`, which exists in `apps/app`. Investment pages state that collections are research-only and that account creation does not guarantee investment access.
- **Development and planned capabilities:** Institutional and Infrastructure surfaces label capabilities as planned or developing. Illustrative interfaces carry an "Illustrative" label.

## Outstanding items and release readiness

1. **Production verification:** BLOCKED from this environment. Before release, confirm the deployed result on `neptlium.com` at the release viewports.
2. **Visual baselines:** `tests/e2e/dark-surfaces.spec.ts` snapshots for `/infrastructure` and `/intelligence` differ under this sandbox's Chromium 1194 by the same amount on unmodified `main`. They are environmental here; CI on GitHub-hosted Ubuntu is authoritative.
3. **Docs/Status handoff e2e:** BLOCKED here, because the egress proxy refuses `docs.neptlium.com` and `status.neptlium.com`.
4. **TRANSITION:** `components/business-product-pages.module.css` keeps a local forced-band palette.
5. **Follow-up removals** (with their test contracts):
   - `marketing-platform.module.css`
   - `app/personal/*` and `app/business/page.tsx` (unreachable behind redirects)
   - unused components: `platform-window`, `cinematic-scroll-story`, `product-visuals`, `reveal`, `cta-band`, `marketing-disclosure`, `footer-interactions`, and `product-cinematic-page` (rendered only by redirected routes)
6. **Information architecture follow-ups:**
   - `TREASURY_LINKS` lists `/treasury` twice (Treasury and Liquidity); the list is not currently rendered.
   - `/products` duplicates the header Products menu; consider redirecting it to `/capital` or `/platform`.
7. **Typography convergence:** H1 size now always uses the display scale, but weights still differ by family. The specification target is 510 for every family.

   | Weight  | Families                             |
   | ------- | ------------------------------------ |
   | 400     | architecture pages: Solutions, Trust |
   | 510–520 | most pages                           |
   | 590     | Treasury, Payments                   |
   | 620     | Insights, Security                   |

8. **Authentication coordination:** the root `AGENTS.md` mandates Supabase Auth only. This branch changes no authentication code or destinations. A workstream reintroducing a retired authentication provider would conflict with that constitution and needs architecture approval before any web destination changes.

**Readiness:** this branch is ready for review. It is not merged and not deployed.
