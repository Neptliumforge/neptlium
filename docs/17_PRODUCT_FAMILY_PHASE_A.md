# Neptlium Product Family — Phase A Foundation

## Authority

This document freezes the Phase A application, domain, product-shell and trust-zone topology. It does not activate unfinished financial execution capabilities and does not supersede the remaining financial-authority remediation gates.

## Product family

| Product | Application | Domain | Trust model |
| --- | --- | --- | --- |
| Public brand | `apps/web` | `neptlium.com` | Public marketing and intelligence |
| Neptlium Capital | `apps/app` | `app.neptlium.com` | Authenticated individual/investor product |
| VaultRail | `apps/vault` | `vault.neptlium.com` | Authenticated organization treasury product |
| Neptlium Pay | `apps/pay` | `pay.neptlium.com` | Public opaque-token payment presentation |
| Developers | `apps/docs` | `docs.neptlium.com` | Public technical documentation |
| Status | `apps/status` | `status.neptlium.com` | Public service-health information |
| Operations | `apps/admin` | `admin.neptlium.com` | Internal Neptlium operations |
| API | `apps/api` | `api.neptlium.com` | Shared external/backend authority boundary |

`app.neptlium.com` and `vault.neptlium.com` are separate products. VaultRail does not replace Neptlium Capital.

## Shared API boundary

Phase A preserves one API domain: `api.neptlium.com`.

Existing personal/capital namespaces remain authoritative where implemented. Business namespaces such as `/v1/organizations`, `/v1/payments`, `/v1/receivables`, `/v1/counterparties`, `/v1/approvals`, `/v1/policies` and organization audit endpoints are architectural namespace reservations only until real server contracts exist. No frontend route in Phase A invents those endpoints.

Provider ingress remains under the shared API boundary, including the existing Stripe route and future Circle/Alchemy ingress only when their authority-chain gates are complete.

## VaultRail organization boundary

VaultRail models authority conceptually as:

`User → Organization membership → Role → Permissions → Command intent → Policy → Approval → Wallet authorization`

Authentication proves who the human is. It does not prove organization membership, payment approval, treasury permission, signer authority, or financial execution authority.

Phase A therefore renders organization authority as unavailable until a server-owned organization projection exists. Frontend role types are presentation contracts only and must never become the authorization source.

## Treasury and wallets

VaultRail treats a treasury account as a business/accounting and authority concept. Wallets remain technical execution infrastructure.

Supported domain classes for future server contracts are provider-neutral: `ROOT_EXTERNAL`, `SMART_ACCOUNT`, `WATCH_ONLY`, `CUSTODIAL_PROVIDER`, and `BANK_ACCOUNT`. Provider-specific wallet tables are not introduced by this phase.

## Payments

The VaultRail payment shell may display the governed lifecycle vocabulary from draft through reconciliation, but Phase A exposes no direct browser execution.

Forbidden in this phase:

- browser → Circle transfer;
- browser → Alchemy transfer;
- browser → blockchain signing/submission authority;
- browser → canonical payment-state mutation;
- wallet connection interpreted as payment completion;
- provider observation interpreted as reconciled financial truth.

## Neptlium Pay

`apps/pay` is intentionally isolated from the authenticated VaultRail shell. Its public route is `/i/[publicToken]`; the opaque public token is a presentation identifier, not settlement authority. Sequential invoice IDs are not the security boundary.

Until a governed payment-intent read model and execution contract exist, the public page renders payment execution unavailable and no fake Pay/Connect action.

## Developers

Developer documentation uses `Available`, `Beta`, and `Planned` labels. Speculative endpoints or SDKs must not be represented as production-supported. Examples must never contain real credentials or provider secrets.

## Status

`apps/status` is intentionally simple and public. Without a configured status backend/provider, it renders status data unavailable. It must not infer `Operational` from deployment success or publish synthetic uptime percentages.

Public service categories are limited to customer-meaningful groups: Website, Capital, VaultRail, API, Payments, Provider Ingress, Notifications, and Documents.

## Admin alignment

Phase A does not add empty Admin screens. Future operational support will be required for organization identity/membership, VaultRail payment intents, approvals, policy evidence, reconciliation, provider events and public incidents. Those surfaces should be added only with real backend projections and authorization.

## Release/deployment convention

Each new application follows the existing workspace naming and Vercel build convention:

- `@neptlium/vault`
- `@neptlium/pay`
- `@neptlium/docs`
- `@neptlium/status`

Each app owns its domain/project root while sharing monorepo packages and the canonical API boundary. No standalone VaultRail repository is created.

## Gate interaction

Phase A does not claim Gate 06, Gate 07 or Gate 08 complete. It must remain safe to merge independently of future execution activation. Any future action that creates canonical financial truth must still pass the remaining authority-chain gates.
