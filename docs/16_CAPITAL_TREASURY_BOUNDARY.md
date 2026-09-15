# Neptlium Capital / Treasury Boundary

Status: TARGET product contract; implementation status remains determined by source, tests, configuration and runtime evidence.

## Canonical rule

Neptlium Capital and Neptlium Treasury are separate authenticated product workspaces over one Neptlium identity and Platform Core.

- `app.neptlium.com` is the individual Neptlium Capital experience.
- `treasury.neptlium.com` is the organization/business Neptlium Treasury experience.
- A human identity may access both, but a personal account is never silently converted into an organization account.
- Supabase Auth proves identity only. Product, organization and financial authority remain server-owned.

## Individual Capital

Capital owns the personal experience for account capital, funding, withdrawals, transfers, portfolio, allocation, investment context, activity, statements, identity verification, security and support.

Customer-facing copy should explain the customer's financial state plainly. Internal concepts such as provider evidence, API topology and reconciliation mechanics belong in Admin, API and engineering documentation unless they are materially required to explain a financial state.

Funding, withdrawal and transfer controls may be displayed only when authoritative capability state permits them. UI visibility never authorizes execution.

## Treasury

Treasury owns organization-scoped business financial operations: business accounts, liquidity, payments, transfers, stablecoin operations, team access, approvals, policies and financial controls.

Treasury onboarding begins with an authenticated human identity, creates or resolves an organization through governed KYB/eligibility processes, then grants organization-scoped membership. It does not replace the user's personal Capital account.

## Identity verification and security

Identity-document verification is not a Security & Access feature. Identity verification owns legal identity and document evidence. Security & Access owns authentication factors, sessions, devices, recovery and security events.

Identity documents must use private encrypted storage, server-side MIME/file-signature validation, strict size/type limits, short-lived access and audited verification workflows. They must never be placed in public storage or treated as verified because a browser uploaded them.

## Theme

The default appearance preference is `system`. System mode follows `prefers-color-scheme` and reacts to changes. Explicit Light or Dark choices override system preference and persist locally until changed.

## Support

Capital Support is a customer product surface. Durable chat requires authenticated support cases, conversations, messages, attachments, events, assignment and status with corresponding governed Admin operator tooling. Until that persistence exists, the UI must fail closed rather than imply that a message was sent.

## Treasury upgrade

Capital may present a Treasury upgrade entry point. The flow must state that Treasury is separate from the personal Capital account. Any displayed price that is not commercially approved must be labeled proposed and must not initiate billing.

## Secrets

No repository directory may contain real provider secrets. Repository `.env.example` files contain names/placeholders only. Production secrets are stored in approved runtime secret stores and administrative recovery vaults with least-privilege access. Browser applications receive only genuinely browser-safe configuration.
