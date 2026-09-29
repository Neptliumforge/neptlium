# Phase 01 — Selective Vite Enablement: Implementation Gate

Baseline: `09ba4fd084cb4597ef370a3058fa200f031a58f8`.
Scope: `apps/web` and strictly necessary shared UI/testing/configuration changes.

## Framework authority

- Next.js remains the only production framework and route renderer for `apps/web`.
- Do not change authenticated apps, APIs, providers, migrations or production configuration.
- Vite-powered Vitest is a test runner, not a replacement for the public website.
- No separate Vite app, design lab, parallel tokens or competing component library.

## Verified initial inventory

- `apps/web/package.json` uses Next.js 16.2.10 and React 19.2.7.
- `apps/web` runs `node --test test/*.test.ts test/*.test.mjs`.
- The existing `test/` directory contains 28 source-contract test files, including TypeScript and MJS.
- Playwright has a separate `playwright.config.ts` and must remain the browser QA authority.
- `packages/ui` and `packages/design-system` already exist; the canonical runtime token source is `packages/ui/src/styles/tokens.css`.
- The Web README contains historical navigation and CSS authority text that conflicts with the newer Web engineering contract. Verify against current source before correcting it.

## Migration rule

Retain the Node runner for source-contract tests that inspect repository text, cross-application files or Next.js configuration. Introduce Vitest for new or explicitly migrated pure utility, component and token-behavior tests only when it provides a measurable improvement. Do not run the same test in two runners.

Before adding Vitest, establish a compatible version and update `pnpm-lock.yaml` using pnpm 11.9.0; do not hand-edit dependency resolution or claim frozen-install success without running it. Any jsdom/happy-dom dependency requires a concrete DOM-testing use case. Do not import server-only Next.js modules into Vitest tests.

## Release gates

Run frozen install, Web and shared UI lint/typecheck, both relevant test runners, Web production build, and GitHub-hosted Playwright. Confirm no change to routes, metadata, canonical URLs, robots, sitemap, redirects, financial disclosures or rendered design. Validate 360, 390, 768, 1280 and 1440 CSS-pixel viewports.

Keep legal drafts under legal review; do not certify them by changing tooling. Reverify the `/products` indexing classification against rendered metadata.

PR review and explicit approval precede merge/deployment. Stop before Phase 02.
