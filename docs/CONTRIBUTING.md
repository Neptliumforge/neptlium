# Contributing

Use Node.js and the pnpm version declared in the root `package.json`.

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm format:check
```

Keep changes scoped, typed, accessible, and backed by real data. Do not add fabricated balances, holdings, transactions, or provider states. Preserve Supabase RLS as the final authorization boundary and keep service-role credentials out of browser code.

Workspace packages use the `@neptlium/*` scope. Customer-facing language should describe a crypto-first institutional capital platform and use only the canonical public domains:

- `https://neptlium.com`
- `https://app.neptlium.com`

Before handoff, run typecheck, lint, and `git diff --check`. Never commit secrets or generated environment files.
