# Phase 01 — selective Vitest activation

Unit 02 baseline after approved PR #117: `eb46a6fcc20dfc4915ff1308eacd82539253d541`.

## Existing suites remain authoritative

- Keep all architecture and source contracts in `apps/web/test/*.test.ts` and `*.test.mjs` under `node --test`.
- Keep Playwright for production browser, responsive, navigation and accessibility checks.
- Keep Next.js as the only Web production renderer. No standalone Vite application or Vite production config.

## Activated executable coverage

1. `apps/web/lib/utils.ts`: executable `cn()` class composition and Tailwind conflict resolution; no Next runtime dependency.
2. `apps/web/lib/seo.ts`: executable `createPageMetadata()` canonical, index/noindex, Open Graph and Twitter behavior. Uses an explicit relative import of `content/site.ts` so the helper also runs directly under Node; assertions must exercise returned metadata, not source text.

Shared UI helpers and components remain future candidates, subject to their client/server boundaries and React rendering requirements. They are not part of this unit.

The three behavior tests previously in `test/seo-behavior.test.ts` are migrated into `unit/seo.test.ts` and `unit/utils.test.ts`, with additional root/nested URL and conditional/responsive class-composition cases. The remaining Node contract files are unchanged. The Web TypeScript configuration retains `noEmit` and `allowImportingTsExtensions` from PR #117.

## Dependency gate

Vitest is a Web development dependency pinned to an exact version. Generate `pnpm-lock.yaml` using the repository-pinned pnpm 11.9.0, run `pnpm install --frozen-lockfile`, and verify the new tests alongside the existing Node and Playwright suites. Do not hand-edit the lockfile or claim installation success from manifest changes alone.

`test` remains an alias for `test:node`, the existing Node suite. `test:unit` runs Vitest with an explicit `vitest.config.ts`. CI and Product Family Validation invoke both as separate steps. The configuration scopes collection to `unit/**/*.test.ts`, uses the Node environment, resolves the existing Web `@/` alias, and fails if no unit tests are found. Lint includes the unit tests and Vitest configuration; Web typecheck includes them through the existing TypeScript glob.

## Release gate

Verify typecheck, lint, both test suites, build and browser QA; report exact failing checks. Keep the PR draft and do not merge or deploy without approval. Phase 02 excluded.
