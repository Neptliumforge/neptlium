# @neptlium/design-system

Higher-level utility CSS and Tailwind compatibility configuration for Neptlium applications.

Import canonical tokens from `@neptlium/ui/styles/tokens.css`, then import `@neptlium/design-system/utilities.css` when these higher-level utilities are needed. The legacy design-system token export only forwards to the UI package. The package contains no application or backend logic.

```sh
pnpm --filter @neptlium/design-system typecheck
pnpm --filter @neptlium/design-system lint
```
