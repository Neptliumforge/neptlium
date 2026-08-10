# Contributing

Use the Node.js and pnpm versions declared in the root manifest. Keep changes scoped, preserve unrelated work, keep a single root lockfile, and retain consistent `@neptlium/*` names.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
git diff --check
```

Use only Neptlium as the product name. Do not fabricate financial data, customers, partners, pricing, certifications, custody readiness, regulatory approval, or provider availability. Browser variables require `NEXT_PUBLIC_`; keep server credentials out of browser code. Authorization belongs on the server and in RLS. Never rewrite applied migrations.

Canonical domains are `https://neptlium.com`, `https://app.neptlium.com`, `https://admin.neptlium.com`, and `https://api.neptlium.com`. Follow the numbered authoritative documents in `docs/` and treat `docs/archive` as historical only.
