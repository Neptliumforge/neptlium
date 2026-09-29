# Phase 01 — executable-test selection gate

Baseline: `e86a32866116bc40f41b5f737a84d32817ebdbdc`.

## Existing suites remain authoritative

- Keep `apps/web/test/*.test.ts` and `*.test.mjs` under `node --test`. These are predominantly source-text and architecture contracts, not behavioral component tests.
- Keep Playwright for production browser, responsive, navigation and accessibility checks.
- Keep Next.js as the only Web production renderer. No standalone Vite application or Vite production config.

## Initial Vitest candidates

1. `apps/web/lib/utils.ts`: executable `cn()` class composition and Tailwind conflict resolution; no Next runtime dependency.
2. `apps/web/lib/seo.ts`: executable `createPageMetadata()` canonical, index/noindex, Open Graph and Twitter behavior. Requires a deliberate alias configuration for `@/lib/content/site`, not source-text assertions.
3. Shared UI pure helpers and components only after checking their client/server boundaries and React rendering requirements.

## Dependency gate

Before introducing `vitest` or changing scripts, generate `pnpm-lock.yaml` using the repository-pinned pnpm version, run `pnpm install --frozen-lockfile`, and verify the new tests alongside the existing Node and Playwright suites. Do not hand-edit the lockfile or claim installation success from manifest changes alone.

Proposed scripts: retain `test` for the existing Node suite; add a distinct `test:unit` command for Vitest. CI must invoke both. Scope initial tests to a dedicated `unit/**/*.test.ts` glob so Vitest does not duplicate the Node contract suite.

## Release gate

Verify typecheck, lint, both test suites, build and browser QA; report exact failing checks. Keep the PR draft and do not merge or deploy without approval. Phase 02 excluded.
