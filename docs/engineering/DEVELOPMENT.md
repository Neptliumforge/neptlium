# Development

Neptlium is a pnpm/Turborepo monorepo. The repository declares pnpm 11.9.0; CI currently uses Node.js 22 and 24 depending on the workflow.

## Setup

```sh
pnpm install --frozen-lockfile
```

## Repository commands

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use workspace filters for focused work, for example `pnpm --filter @neptlium/web build`.

## Applications

| Path | Authority |
| --- | --- |
| `apps/web` | Public product and marketing experience |
| `apps/app` | Individual Capital operating experience |
| `apps/treasury` | Organizational Treasury experience |
| `apps/pay` | Neptlium Pay payment and collection experience |
| `apps/admin` | Internal operations and control plane |
| `apps/api` | Server-side API and orchestration boundary |
| `apps/docs` | Developer/platform documentation application |
| `apps/status` | Platform status experience |

Read root `AGENTS.md` and the nearest nested `AGENTS.md` before changing a subsystem.

## Financial safety

Local development and tests must not require live economic actions. Never use production provider credentials, service-role keys, signing keys, or wallet private keys as ordinary local configuration. Applied Supabase migrations are immutable history; do not rename or rewrite them for repository aesthetics.
