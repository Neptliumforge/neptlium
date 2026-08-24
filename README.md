# Neptlium

Production monorepo for the Neptlium Capital Operating Platform.

**Canonical repository:** `Neptliumforge/neptlium`

## Applications

| Workspace | Domain | Responsibility |
| --- | --- | --- |
| `apps/web` | `neptlium.com` | Public institutional marketing and information. Editorial/visual authority is independent from engineering build state; no privileged financial authority. |
| `apps/app` | `app.neptlium.com` | Authenticated customer interaction surface. Browser/session checks are not canonical financial authority. |
| `apps/admin` | `admin.neptlium.com` | Internal operational interface. Privileged financial operations must flow through `apps/api`. |
| `apps/api` | `api.neptlium.com` | Privileged API, provider-isolation, ledger, authorization, and reconciliation boundary. |

Shared repository foundations live in `packages/`, `supabase/`, `docs/`, and `.github/`.

## Public Web boundary

`apps/web` is the institutional brand, category, editorial, SEO, and public information surface. It should express the Neptlium product model and worldview without narrating internal repository progress, build completion, migration state, provider configuration, environment readiness, feature flags, or release engineering status.

Marketing may develop its own high-end visual and editorial language and does not need to mirror implementation chronology. That independence does not authorize false factual claims: customers, AUM, balances, performance, partnerships, licences, regulatory status, custody, provider relationships, live execution, settlement, and product availability require evidence before they are represented as facts.

Public search authority belongs to `https://neptlium.com`. `https://www.neptlium.com` should converge on the canonical apex origin. App, Admin, API, auth, drafts, and operational surfaces should not compete as public search destinations.

## Development

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
```

The repository declares `pnpm@11.9.0`. Workspace membership and pnpm-specific policy, including explicit dependency build authorization, are owned by `pnpm-workspace.yaml`. Project `.npmrc` is reserved for pnpm 11 registry/auth configuration and currently contains no credential or registry override.

Repository environment examples keep sensitive/provider values as empty placeholders and may include safe non-secret runtime defaults or public origins where the application contract requires them. Configuration presence does not prove that a deployment is configured, a provider capability is verified, or a financial rail is live.

## Authority

Read `AGENTS.md` before changing the repository. Nested `AGENTS.md` files specialize application-local work without overriding repository-wide financial, security, migration, or Git rules. For public Web work, `apps/web/AGENTS.md` is the implementation contract beneath root authority.

Current numbered documentation authority:

- `docs/00_PRODUCT_CONSTITUTION.md`
- `docs/01_PLATFORM_ARCHITECTURE.md`
- `docs/02_AUTHENTICATED_APPLICATION.md`
- `docs/03_DESIGN_SYSTEM.md` — single unified design authority
- `docs/04_IDENTITY_AND_ACCESS.md`
- `docs/05_CAPITAL_ACCOUNT.md`
- `docs/06_TREASURY.md`
- `docs/07_ALLOCATION_ENGINE.md`
- `docs/08_TRANSFER_ARCHITECTURE.md`
- `docs/09_LEDGER_AND_RECONCILIATION.md`
- `docs/10_PROVIDER_ARCHITECTURE.md`
- `docs/11_API_ARCHITECTURE.md`
- `docs/12_ADMIN_OPERATIONS.md`
- `docs/13_SECURITY.md`
- `docs/14_DEPLOYMENT.md`
- `docs/15_PRODUCTION_READINESS_AUDIT.md` — point-in-time readiness record; read its audited SHA/date before relying on conclusions

`docs/archive/` is historical and non-authoritative. Historical documents may explain lineage but never override current numbered authority, current implementation, tests, or `AGENTS.md`.

## Financial correctness

Provider observations are evidence, not canonical ledger truth. Unknown is not zero. Authorization, reservation, submission, settlement, posting, reconciliation, and availability remain distinct states inside operational/product systems.

Those engineering/domain distinctions govern App/Admin/API correctness; ordinary Marketing copy should not expose implementation-state machinery merely because it exists internally.

Never infer live provider capability, deployment state, migration application, or financial execution from source code or configuration presence alone.
