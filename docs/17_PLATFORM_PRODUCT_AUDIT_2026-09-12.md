# Neptlium Platform Product Audit — 2026-09-12

**Status:** Active engineering audit  
**Scope:** Customer application, API identity boundary, dashboard truthfulness, deposit architecture, deployment health, and immediate product-development priorities.

## Executive assessment

Neptlium has a credible four-application architecture and meaningful financial-control foundations, but the authenticated customer experience is still between infrastructure and product maturity.

The strongest current assets are:

- Clerk-based customer and operator sessions;
- a provider-independent Neptlium principal model;
- API-owned customer data access;
- canonical-ledger, funding-intent, treasury-destination, transfer, audit, and reconciliation groundwork;
- capability-driven financial routes that fail closed;
- independent Web, App, Admin, and API deployment boundaries.

The most important product risks are:

- customer dashboard surfaces still containing illustrative financial composition/activity rather than exclusively evidence-backed state;
- Deposit currently redirecting back into Capital Account instead of operating as a complete funding workflow;
- requested crypto rails such as USDT/TRON, LTC, and SOL not yet represented by verified API capability;
- Stripe capital funding not yet implemented as a customer money-movement rail;
- production identity cutover migration and runtime deployment state requiring explicit verification rather than assumption;
- an inert legacy identity-link route shell remaining in the API router even though Supabase authentication has been retired.

## Authentication and identity

### Current state

Clerk is the customer and operator authentication/session authority.

The runtime API authenticator accepts Clerk identity only. Supabase continues to be used as persistence transport for identity mappings and financial records; this is not the same as using Supabase Auth.

The customer-side Supabase password-link bridge has been removed. Existing users should not be asked to prove a legacy Supabase password.

### Remaining work

- Physically remove the retired `/v1/auth/link-clerk` route from the API router and delete obsolete tests that describe dual-session authentication.
- Apply and verify the forward identity migration in the production database under an explicit migration gate.
- Verify every existing production principal resolves from its Clerk subject before considering identity migration complete.
- Remove historical runtime environment variables related only to Supabase Auth after confirming no production dependency remains.

Historical migrations and archived documentation may preserve Supabase Auth references as system history. They must not be rewritten to make the past look different.

## Customer dashboard

### Audit finding

The previous dashboard contained illustrative allocation percentages and example activity events. Those values were intentionally labeled as examples, but they still weaken the financial-truth standard of an authenticated investment platform.

Authenticated financial surfaces should not display invented capital composition or invented transaction-like events.

### Engineering direction

The dashboard must render only:

- canonical or reconciled values when available;
- explicit unavailable, pending, empty, or not-configured states when values do not exist;
- real account activity returned from the Neptlium API;
- clear actions such as Deposit, Portfolio, Treasury, Allocation, and Activity.

The first dashboard reconstruction pass removes illustrative financial values and replaces them with evidence-bound state presentation.

## Deposit

### Current infrastructure

The API already contains governed funding concepts including:

- funding capability discovery;
- funding intents;
- deposit instructions;
- canonical balances;
- funding activity;
- provider observation and reconciliation boundaries.

The current customer Deposit route was only a redirect into Capital Account.

### First product implementation

The Deposit experience now begins as a dedicated route with two explicit funding-method choices:

1. Crypto
2. USD

Crypto availability is derived from the API capability registry rather than hard-coded as live.

The first crypto flow:

1. reads account funding capabilities;
2. allows selection only when a rail is `ENABLED`;
3. creates a governed funding intent;
4. retrieves deposit instructions from the API;
5. displays the returned asset, network, address, and memo/tag when present;
6. provides local address copy;
7. explains that balance credit requires observation, posting, settlement, and reconciliation.

The application does not call an external QR-code service because doing so would disclose a user-specific deposit address to an unrelated third party. A QR representation should be generated locally after a reviewed dependency or internal encoder is adopted.

Transaction-hash/document evidence submission remains to be implemented against a corresponding durable API model. The UI must not provide a fake Done button that implies settlement.

### Requested target rails

The requested target catalogue includes:

- USDT — TRON / TRC-20
- USDC — Base
- BTC — Bitcoin
- ETH — Ethereum
- LTC — Litecoin
- SOL — Solana

The current API capability registry does not prove all of those rails. They must be introduced individually with address validation, custody/provider support, observation, confirmations, webhook/indexer evidence, canonical posting, reconciliation, and production capability tests.

### USD / Stripe

USD funding should not reuse the existing Stripe subscription/billing integration as though it were an investment-account deposit rail.

A production USD flow requires:

- approved Stripe product/contract for the intended funding method;
- server-created payment/funding intent;
- authenticated customer attribution;
- amount/currency validation;
- verified Stripe webhooks;
- idempotent event processing;
- failure, cancellation, refund, and chargeback handling where applicable;
- ledger posting;
- settlement evidence;
- reconciliation;
- customer transaction history.

Until those controls exist and are verified, the USD method remains visible as architecture but unavailable for execution.

## API and financial integrity

The API remains the privileged financial-control boundary. The browser must not be authoritative for balances, funding completion, settlement, or provider execution.

Required invariants:

- money represented with integer atomic units or precise decimal types, never unsafe floating point;
- idempotency on financial mutations;
- provider evidence separated from canonical ledger truth;
- append-only or compensating financial history;
- explicit ownership and authorization checks;
- capability checks before creating provider-facing instructions;
- webhook verification before financial consequence;
- reconciliation before settled truth where required.

## Admin

Admin is already structurally separated from the customer application and uses Clerk for authentication. The next audit pass should focus on whether each administrative status mutation is merely workflow metadata or backed by actual provider/ledger consequence.

Priority is to migrate any direct financial-status mutation into governed API commands with immutable audit evidence.

## Marketing Web

The marketing Web application is substantially further along visually than the authenticated application. The authenticated dashboard should not simply copy the marketing visual language; it should translate the same institutional quality into denser financial information architecture, responsive workflows, charts, tables, records, and account controls.

## Deployment and repository health

The monorepo now contains Vercel ignored-build rules that can skip unrelated applications. Shared dependency changes may still legitimately rebuild more than one project.

The Clerk-only identity cutover commit initially exposed API TypeScript errors because newly introduced identity error codes were not added to the central error-code union. That compile defect has been corrected.

A deployment is not considered healthy until the corresponding Vercel status reports success.

## Product-development priority order

1. Restore green API production deployment after Clerk-only cutover.
2. Delete the retired dual-session identity-link route and obsolete tests.
3. Complete the evidence-bound authenticated dashboard reconstruction.
4. Complete dedicated crypto Deposit screens and locally generated QR presentation.
5. Add deposit evidence / transaction-hash submission and durable API persistence.
6. Introduce requested crypto rails one at a time behind verified capability.
7. Implement the dedicated Stripe USD capital-funding architecture.
8. Rebuild Portfolio and investment-position experiences around canonical data.
9. Build investment discovery/detail only after product/legal capability exists for the offered investments.
10. Rebuild Admin around investigation, approval, reconciliation, audit, and exception workflows.

## Completion standard

A Neptlium feature is not complete because a screen renders.

Completion requires verified authentication, authorization, validation, responsive states, accessible interaction, failure handling, auditability, financial integrity, observability, deployment health, and documentation consistent with runtime truth.
