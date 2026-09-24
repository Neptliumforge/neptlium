# Vercel deployment authority

Verified against the connected Neptliumforge Vercel team on 2026-09-24.

| App | Vercel project | Repository build authority | Canonical domain contract | Latest observed ready production SHA |
| --- | --- | --- | --- | --- |
| `apps/web` | `neptlium-web` | `pnpm --filter @neptlium/web build` | `neptlium.com` | `d6cf53d` |
| `apps/app` | `neptlium-app` | Next.js project build | `app.neptlium.com` | `d6cf53d` in the inspected deployment window |
| `apps/treasury` | `neptlium-treasury` | `pnpm --filter @neptlium/treasury build` | `treasury.neptlium.com` | `d6cf53d` |
| `apps/pay` | `neptlium-pay` | `pnpm --filter @neptlium/pay build` | `pay.neptlium.com` | `d6cf53d` |
| `apps/admin` | `neptlium-admin` | Next.js project build | `admin.neptlium.com` | not established in the inspected 20-deployment window |
| `apps/api` | `neptlium-api` | Vercel Node builds + repository `vercel-build` | `api.neptlium.com` | not established in the inspected 20-deployment window |
| `apps/docs` | `neptlium-docs` | `pnpm --filter @neptlium/docs build` | `docs.neptlium.com` | `d6cf53d` |
| `apps/status` | `neptlium-status` | `pnpm --filter @neptlium/status build` | `status.neptlium.com` | `d6cf53d` |

The team also contains a separate `forge` project; it is not a canonical Neptlium application.

## Git and production behavior

All eight canonical projects report Git-linked deployment/status activity for `Neptliumforge/neptlium`. At post-#108 main `70d8f0f6`, GitHub's eight Vercel commit-status contexts were successful. The underlying documentation-only production attempts were ignored/cancelled where project ignore rules determined the app was unaffected; a successful commit status therefore must not be represented as a new runtime deployment.

Repository `vercel.json` files define affected-build/ignore behavior. Web, Treasury, Pay, Docs and Status declare explicit workspace build commands. App and Admin rely on the project/framework build convention. API defines explicit Vercel Node entrypoints and routes.

## Root directory, install command, production branch and domains

The connected project-list/deployment interface confirms project identity and deployment SHA/status, but the project-detail operation is currently connector-limited and does not expose a reliable read of root directory, install command, production-branch setting, or custom-domain assignment in this session. Repository structure and canonical domain documentation are recorded above, but those settings must be verified in Vercel before any configuration mutation. Do not invent or silently change them.

## Environment scopes

Environment variable **names and ownership** are documented in `../engineering/ENVIRONMENT.md`. Values remain in Vercel/provider secret stores and must not be copied into repository documentation.

## Verification

For an affected production deployment record project, custom domain, Git SHA, deployment ID/status, and post-deploy health. A successful Vercel deployment does not establish provider activation, settlement, reconciliation, or canonical financial state.
