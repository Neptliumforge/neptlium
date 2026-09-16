# Neptlium Capital and Treasury Account Boundary

Status: CANONICAL PRODUCT CONTRACT

## Principle

Neptlium is one platform with one identity and one Platform Core, but personal Capital and organization Treasury are separate product and ownership contexts.

- `app.neptlium.com` is Neptlium Capital for authenticated individuals and investors.
- `treasury.neptlium.com` is Neptlium Treasury for organizations and business financial operations.
- A person may access both through one Neptlium identity without merging ownership, balances, permissions or financial authority.

## Neptlium Capital

Capital owns the personal customer experience for account capital, funding, withdrawal, transfer, portfolio, allocation, investments, activity, statements, profile, identity verification, security and support.

Customer-facing copy must explain money and actions in customer language. Provider topology, canonical-ledger implementation detail, reconciliation internals and API-loading language belong in operational surfaces unless a financial-state distinction is necessary for customer understanding.

## Neptlium Treasury

Treasury owns organization-scoped business accounts, liquidity, payments, stablecoin operations, teams, roles, approvals, policies and business financial controls.

Treasury onboarding creates or joins an organization. It never converts a personal Capital account into a Treasury account.

## Shared Platform Core

Both products may share Neptlium identity, authorization primitives, canonical ledger infrastructure, risk/compliance services, provider orchestration, reconciliation, audit, events, design system and terminology where the underlying concept is truly shared.

Shared infrastructure does not imply shared ownership context or product workspace.

## Financial movement

Personal funding, withdrawal and transfer intents are personal Capital operations. Treasury movement intents are organization operations. UI routes must not reuse Treasury product language to represent personal investor activity.

Provider configuration is never financial authority. Browser interaction is never canonical settlement. Existing financial lifecycle and ledger rules remain authoritative.

## Identity verification

Identity verification is separate from Security & Access. Identity documents are sensitive compliance artifacts and must use private encrypted storage, server-side file validation, controlled MIME/file-size policies, short-lived access and governed verification state. Public buckets and browser-authored verification truth are prohibited.

## Appearance

`system` is the default theme preference. It resolves through `prefers-color-scheme`, reacts to browser/OS theme changes, and persists explicit Light or Dark overrides. Authenticated routes must not force Dark mode.

## Support

Capital exposes a customer Help & Support surface. Durable support messaging requires governed support-case/message persistence; the UI must not present browser-only messages as durable records.

## Treasury upgrade

Capital may present an `Upgrade to Treasury` journey. It must clearly state that Treasury is separate from the personal Capital account and begins with organization onboarding/KYB/eligibility as required. Pricing shown before commercial approval must be labeled proposed rather than canonical billing truth.

## Secret control

Real provider/API secrets never belong in repository folders. Repository files may contain variable names and documentation only. Runtime secrets are least-privilege and server-side; public applications never receive Circle Entity Secrets, provider secret keys or Supabase service-role credentials.
