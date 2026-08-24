# Neptlium Repository Engineering Constitution

## Repository authority

Canonical repository: `Neptliumforge/neptlium`.

| Boundary | Domain | Responsibility |
| --- | --- | --- |
| `apps/web` | `neptlium.com` | Public institutional marketing and information. |
| `apps/app` | `app.neptlium.com` | Authenticated customer operating application. |
| `apps/admin` | `admin.neptlium.com` | Internal operator comprehension, risk visibility, control, and auditability. |
| `apps/api` | `api.neptlium.com` | Domain truth, authentication enforcement, authorization, durability, provider isolation, ledger, and reconciliation. |

Shared packages may be changed only when genuine shared authority requires it. Do not move subsystem-specific behavior into shared packages for convenience.

The governing product distinction is:

> Marketing establishes authority and meaning.  
> The application establishes control and operation.  
> Admin establishes operator comprehension, risk visibility, and auditability.  
> API establishes domain truth, authorization, durability, and financial state.

These surfaces share one Neptlium identity. They must not be visually or operationally collapsed into one UI language.

## Source-of-truth order

Before describing or changing a subsystem:

1. Fetch and inspect current `origin/main`.
2. Read this root `AGENTS.md`.
3. Read the nearest applicable nested `AGENTS.md`.
4. Read current authoritative numbered documentation.
5. Inspect the actual current implementation.
6. Inspect tests, types, configuration, migrations, and build/deployment entrypoints relevant to the task.
7. Inspect the relevant live production surface when the task concerns production behavior and access permits it.
8. Inspect relevant open pull requests and identify overlap or supersession.
9. Establish evidence and the current/transition/target distinction.
10. Then edit within the correct ownership boundary.

Never design or report repository behavior from historical chat context, screenshots, commit titles, or archived documents alone.

## Documentation authority

- Numbered documents `docs/00_*` through `docs/15_*` are current authority when present.
- `docs/03_DESIGN_SYSTEM.md` is the central Neptlium design authority.
- A nested `AGENTS.md` specializes local implementation but cannot weaken repository-wide security, financial, migration, validation, or Git rules.
- Source, tests, configuration, and authorized runtime evidence determine what is actually implemented or live.
- Documentation must distinguish **CURRENT**, **TRANSITION**, and **TARGET**. Target architecture is never current merely because it is documented.

### Archive policy

`docs/archive/**` is historical only.

- Never use an archived document as current authority.
- Never infer present behavior or product availability from archived documentation.
- Do not update archived documents to express current architecture; update the appropriate current numbered document.
- Preserve archive history unless an explicit archival-maintenance task authorizes changes.

## Financial and product truth

Preserve these distinctions everywhere:

- `UNKNOWN != ZERO`
- `PROVIDER OBSERVATION != CANONICAL LEDGER`
- `CONFIGURED != LIVE CAPABILITY`
- `APPROVED != SUBMITTED`
- `SUBMITTED != SETTLED`
- `SETTLED != RECONCILED`
- `PLANNED != AVAILABLE`
- `MODELED != EXECUTED`
- `VISIBLE != AUTHORITATIVE`
- `UI REPRESENTATION != DOMAIN TRUTH`

Never fabricate or imply unverified:

- balances, holdings, activity, customers, AUM, or transaction volume;
- performance, returns, allocation outcomes, or liquidity;
- provider capability, custody, execution, settlement, or reconciliation;
- regulatory status, licences, approvals, partnerships, or availability;
- production configuration, deployed migration state, or live readiness.

Provider evidence remains evidence until the applicable validation, authorization, posting, settlement, and reconciliation requirements are satisfied. Preserve append-only financial history and use reversals or compensating entries for corrections.

## Boundary rules

- Public Web is not financial authority. Marketing may explain verified product meaning but cannot manufacture capability or state.
- App is an interaction surface. Browser checks, hidden controls, and UI state are not authorization.
- Admin is a governed operator client. A status mutation does not prove external execution, settlement, ledger posting, or reconciliation.
- API is the privileged domain boundary. Sensitive commands require authentication, authorization, ownership, policy, idempotency, audit, durable state, and reconciliation as applicable.
- UI work must preserve domain-state distinctions and fail closed when required evidence is missing.
- Provider SDKs, secrets, and service-role credentials remain server-side and within their reviewed boundary.

Do not modify migrations, provider configuration, remote environments, production data, financial systems, provider resources, or execution flags unless the current task explicitly authorizes that exact scope. Do not rewrite or delete applied migrations; use reviewed forward migrations when authorized.

## Security and secrets

- Never expose tokens, cookies, authorization headers, service-role keys, provider secrets, signing material, private keys, recovery material, or sensitive webhook payloads.
- Only genuinely browser-safe values may use `NEXT_PUBLIC_*`.
- Missing authentication, authorization, durable storage, verification, provider capability, or policy fails closed.
- Never weaken RLS, ownership checks, approval separation, replay protection, or auditability to make a feature appear functional.

## Validation truth

Report every relevant check as exactly one of:

- `PASS` — the stated command or inspection was actually executed and succeeded.
- `FAIL` — it was executed and failed because of a verified product/source defect.
- `BLOCKED` — it could not complete because an external prerequisite or environment was unavailable.
- `NOT RUN` — it was not executed.

No PASS may be inferred from source inspection, a prior commit, another branch, a PR description, or an expected CI/deployment result. Report the command, scope, and material limitations. Documentation-only changes still require diff/format/link/content consistency checks proportionate to the repository tooling.

## Git and remote actions

- Preserve unrelated work and inspect repository status before editing.
- Do not commit, push, open or update a pull request, merge, or deploy unless the current task expressly authorizes that remote action.
- Use a focused branch and reviewable change set. Do not mix unrelated cleanup into the task.
- Merging always requires explicit instruction for that merge.
- Never force-push, bypass required checks/reviews, or evade repository protection unless explicitly authorized and repository policy permits it.
- Environment identity is not authorization. Git operations may be performed from any authorized environment, including connected GitHub tooling, Termux, Codespaces, CI, or another approved client.

## Scope discipline

Classify ownership before editing. Keep Web work in `apps/web`, App work in `apps/app`, Admin work in `apps/admin`, and API/domain work in `apps/api` unless evidence establishes a genuine cross-boundary requirement. Record adjacent improvements as follow-up work instead of silently expanding scope.
