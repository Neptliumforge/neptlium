# @neptlium/web

Neptlium's public corporate, marketing, product-information, editorial, trust and acquisition website at `neptlium.com`. It does not own authenticated customer sessions, privileged financial operations, custody, execution, settlement or canonical financial state.

## Architecture authority

Next.js is the sole production framework for `apps/web`. Vite-powered tooling may be introduced selectively for compatible unit, component and design-system tests, without changing public routing, rendering, metadata or deployment. Do not introduce a second production renderer or a standalone design laboratory in initial Phase 01. Authenticated applications and financial services are outside this scope.

Read [the Web engineering contract](./AGENTS.md), [the canonical design system](../../docs/experience/DESIGN_SYSTEM.md), current source and tests before making changes. The runtime token authority is `packages/ui/src/styles/tokens.css`; shared components live in `packages/ui`. Existing route and content authority is `lib/content/public-architecture.ts`. Where historical documentation disagrees with verified current implementation, reconcile it rather than restoring retired patterns.

## Public information architecture

The canonical product hierarchy is Capital (`/capital`), Portfolio (`/portfolio`), Investments (`/investments`), Treasury (`/treasury`), Intelligence (`/intelligence`) and Infrastructure (`/infrastructure`). Institutional, Security, Insights and Company are supporting public expressions. Allocation remains a valid supporting product route. The solutions index contains Capital visibility and Treasury coordination.

Legacy `/personal` and `/business` converge to `/capital` and `/treasury` respectively; do not restore them as competing primary destinations. Check `lib/content/public-architecture.ts`, current route files and redirects for the complete inventory. Personal product authentication is at `app.neptlium.com`; Business uses `treasury.neptlium.com`. Do not route business users through the investor sign-in.

## Design and financial truth

Dark is primary; Light and System remain supported. The approved canvas, surface, typography, status and teal roles come from shared semantic tokens. Capital Rails derive from the canonical mark geometry. Web owns route composition, not a second design system.

Do not invent customers, balances, AUM, returns, performance, transaction histories, partnerships, licenses, regulatory status, custody or execution. Clearly label illustrative states and distinguish configured from live, submitted from settled, and provider observation from canonical truth.

## Test responsibilities

The existing `node --test` suite retains architecture and source contracts under `test/*.test.ts` and `test/*.test.mjs`. `test` remains an alias for this suite through `test:node`.

Vitest runs only `unit/**/*.test.ts` through the dedicated `vitest.config.ts`, in the Node environment with the Web `@/` alias. It exercises SEO metadata and `cn()` class composition, including the behavior tests selected in PR #117. It does not collect the Node contracts or Playwright specs. Vite is a test dependency only; Next.js still owns production rendering and builds.

CI and Product Family Validation execute `test:node` and `test:unit` as separate steps. Both are required. Playwright continues to own browser, navigation, responsive and accessibility regression. Do not migrate file-text contracts mechanically or claim that unit tests prove browser behavior. Use the pinned pnpm 11.9.0 and commit its generated lockfile with dependency changes.

Vitest 5.0.2 uses the lockfile-resolved Vite 8.3.1 peer. Use Node 22.12+ within Node 22, or Node 24, matching the CI runtime families.

```sh
pnpm install --frozen-lockfile
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test:node
pnpm --filter @neptlium/web test:unit
pnpm --filter @neptlium/web build
```

Use GitHub-hosted Ubuntu for Playwright and validate at 360, 390, 768, 1280 and 1440 CSS pixels. Do not merge or deploy without review and approval.
