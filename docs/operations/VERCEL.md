# Vercel deployment authority

Verified against the connected Neptliumforge Vercel team on 2026-09-24.

| Repository app | Vercel project |
| --- | --- |
| `apps/web` | `neptlium-web` |
| `apps/app` | `neptlium-app` |
| `apps/treasury` | `neptlium-treasury` |
| `apps/pay` | `neptlium-pay` |
| `apps/admin` | `neptlium-admin` |
| `apps/api` | `neptlium-api` |
| `apps/docs` | `neptlium-docs` |
| `apps/status` | `neptlium-status` |

The team also contains a separate `forge` project; it is not classified here as a Neptlium application.

## Git and production behavior

The eight Neptlium projects are connected to `Neptliumforge/neptlium`. Recent deployment records show `main` production attempts carrying the originating Git SHA. Application `vercel.json` files use ignore commands to avoid unnecessary builds where configured.

At the start of repository convergence, the latest documentation-only `main` commit (`1b8411c3c68b1de452e9801f9e34800034dd3718`) produced cancelled production attempts across observed projects rather than a new ready production release. The preceding verified ready production records observed during the audit were tied to earlier runtime commits. Treat this as deployment evidence, not application-domain authority.

## Domains and settings

Canonical custom domains, root directories, install/build commands, environment scopes, and production-branch settings must be read from current Vercel project configuration before changing them. Do not infer custom domains from project names and do not store secret values in this document.

## Verification

For an affected production deployment record: project, domain, Git SHA, deployment ID/status, and post-deploy health. A successful Vercel deployment does not establish provider activation, settlement, reconciliation, or canonical financial state.
