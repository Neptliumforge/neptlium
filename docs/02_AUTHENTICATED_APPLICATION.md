# Neptlium Authenticated Application

**Status:** Authoritative  
**Application:** `apps/app`  
**Domain:** `app.neptlium.com`

## 1. Purpose

The authenticated Neptlium application is the customer capital operating environment.

It provides a coherent interface for understanding and operating capital across:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

The application is an interaction and presentation boundary.

It must not become an independent source of financial truth.

## 2. Architecture-state convention

This document distinguishes:

- **CURRENT** — verified repository implementation
- **TRANSITION** — architecture being migrated or consolidated
- **TARGET** — approved destination architecture

A route, component, service, or database table existing does not by itself prove that the corresponding financial capability is production-ready.

## 3. Current application foundation

The application is implemented with Next.js and shared Neptlium workspace packages.

Current foundations include:

- authenticated routing
- server-side session guards
- account provisioning
- onboarding
- role resolution
- role-aware navigation
- shared application shell
- desktop sidebar
- mobile navigation
- profile controls
- API client infrastructure
- portfolio module
- treasury module
- allocation groundwork
- wallet/capital-account groundwork
- deposit/withdrawal/transfer surfaces
- settings and security surfaces

## 4. Current identity boundary

### CURRENT

Supabase Auth provides the current authenticated session.

The server-side Neptlium API client:

1. validates the Supabase user
2. retrieves the authenticated session token
3. sends the bearer token to `apps/api`
4. adds a request identifier
5. applies an eight-second timeout
6. retries GET requests once
7. does not automatically retry mutation requests

Account provisioning and onboarding already use this API boundary.

### TARGET

Authentication will migrate toward the identity architecture defined in `04_IDENTITY_AND_ACCESS.md`.

Financial ownership must not remain permanently coupled to an external authentication-provider identifier.

## 5. Current route surface

The repository currently contains customer routes for:

- Overview
- Portfolio
- Capital Account
- Treasury
- Allocation
- Deposit
- Withdrawal
- Transfer
- Transactions

It also contains secondary routes for areas including:

- notifications
- documents
- settings
- counterparties
- research
- risk
- reports
- administration

Secondary route existence does not make those routes canonical primary navigation.

## 6. Canonical navigation

### Desktop

Canonical primary navigation is exactly:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

Secondary capabilities belong in contextual navigation, settings, profile surfaces, or appropriately governed sub-navigation.

### Mobile

Canonical persistent bottom navigation is:

1. Home
2. Portfolio
3. Capital
4. Allocation

Treasury remains reachable contextually without consuming one of the four persistent mobile positions.

## 7. Route normalization

### CURRENT

Capital Account is presented to the user as `Capital Account` but currently uses the legacy internal route:

`/dashboard/wallet`

Allocation currently uses:

`/dashboard/allocations`

### TARGET

Public product language and internal route architecture should converge.

Preferred canonical route direction:

- `/dashboard`
- `/dashboard/portfolio`
- `/dashboard/capital`
- `/dashboard/treasury`
- `/dashboard/allocation`

Legacy routes should redirect safely when route migration occurs.

Route cleanup must not break bookmarks or existing application flows unnecessarily.

## 8. Shared shell

### CURRENT

The authenticated shell is already centralized through shared UI primitives including:

- `AppShell`
- `Sidebar`
- `MobileNavigation`

The dashboard layout resolves the authenticated user, profile and role before composing navigation.

### TARGET

Capital Precision should extend this shared shell rather than create independent shells for individual dashboard pages.

The shell should provide:

- disciplined desktop navigation
- compact application header
- profile and security access
- responsive content geometry
- deliberate mobile bottom navigation
- safe-area handling
- accessible keyboard behavior
- coherent loading and transition behavior

## 9. Data-access architecture

### CURRENT

The authenticated application currently uses more than one data path.

#### Neptlium API

The server-side API client is currently used for account provisioning and onboarding.

#### Direct Supabase access

Several dashboard surfaces still access Supabase directly.

Verified examples include:

- Overview → `wallet_transactions`
- Capital Account → `wallet_transactions`
- Capital Account actions → wallets and withdrawal RPC
- Allocation actions → wallets, portfolios and allocation requests
- Transactions → `wallet_transactions`
- Notifications → notifications
- Documents → documents
- Settings → login history and organizations

### TRANSITION

Direct Supabase access must be classified rather than removed indiscriminately.

Application data may remain server/RLS-backed where appropriate.

Canonical financial operations should progressively converge on the API control plane.

### TARGET

The preferred financial dependency direction is:

Customer UI
→ authenticated app server
→ Neptlium API
→ domain controls
→ ledger / reconciliation / provider adapters
→ durable persistence

The customer browser must not directly perform privileged financial mutations.

## 10. Financial API convergence

The following classes should normally converge through `apps/api`:

- canonical capital position
- financial balances
- deposit state
- withdrawal intents
- transfers
- reservations
- allocation execution
- provider-backed financial commands
- canonical transaction/activity read models
- reconciliation-sensitive state

The following may remain direct application-data access when authorization is correctly enforced:

- preferences
- notifications
- documents
- non-financial profile data
- presentation settings

This distinction must be determined by domain authority, not convenience.

## 11. Overview

### CURRENT

Overview currently:

- identifies itself as the capital-position surface
- queries recent wallet transactions directly from Supabase
- presents Total Capital
- presents Available
- presents Allocated
- presents Reserve
- links to Capital Account
- links to Allocation
- represents unavailable monetary state truthfully rather than fabricating values

### TARGET

Overview becomes the highest-signal summary of the customer's capital operating state.

Priority order:

1. capital position
2. availability and restrictions
3. allocation state
4. treasury readiness
5. recent meaningful activity
6. next legitimate action

Overview should not become a collection of generic dashboard cards.

Repeated unavailable financial values should collapse into deliberate state communication.

## 12. Portfolio

Portfolio represents reconciled customer capital holdings and composition.

It should answer:

- what capital exists
- where it is represented
- how it is composed
- what state it is in
- what portion is available, reserved, allocated or restricted

Portfolio must distinguish canonical holdings from provider observations.

Market information must not masquerade as owned holdings.

## 13. Capital Account

Capital Account replaces customer-facing Wallet terminology.

It is the operational capital funding and movement surface.

Target structure:

- Overview
- Deposit
- Withdraw
- Transfer
- Activity

Capital Account should communicate:

- capital available
- capital pending
- capital reserved
- capital restricted
- supported funding/withdrawal paths
- activity and reconciliation state

Provider balances must not automatically become Capital Account truth.

## 14. Treasury

Treasury represents operational liquidity and capital readiness.

Target concepts include:

- Available
- Reserved
- Committed
- Pending
- Restricted
- Reserve requirement
- Reserve coverage
- Liquidity state

Treasury should consume canonical or appropriately reconciled state.

It is not simply another balance page.

## 15. Allocation

Allocation is the governed capital-intelligence environment.

It should support progression from observation through modeling and authorized execution without collapsing those concepts.

Target lifecycle:

Observed
→ Modeled
→ Proposed
→ Under Review
→ Approved
→ Reserved
→ Submitted
→ Settling
→ Settled

Modeling does not move capital.

Approval does not prove provider execution.

Submission does not prove settlement.

AI must not silently authorize or move customer capital.

## 16. Transfer

Transfer is a governed movement workflow.

Target flow:

recipient or alias
→ verified resolution
→ asset/network selection
→ amount
→ availability validation
→ review
→ authorization
→ reservation
→ internal ledger movement or provider submission
→ reconciliation
→ final activity state

The interface must distinguish internal and external movement.

A recipient alias must never substitute for ownership or authorization validation.

## 17. Financial-state presentation

The authenticated application must distinguish:

- canonical
- provider-observed
- unreconciled
- unavailable
- available
- reserved
- committed
- pending
- restricted
- failed
- reversed

A missing value must not be rendered as zero.

An unavailable value must not be fabricated.

A provider observation must not receive the same visual authority as reconciled ledger state.

## 18. Design authority

The authenticated application follows `03_DESIGN_SYSTEM.md`.

Its doctrine is:

**Capital Precision**

Governed by:

**Precision · Restraint · Depth · Certainty**

The application must be quieter than the marketing site.

Typography, spacing and alignment establish structure before borders and cards.

Avoid:

- card-heavy dashboards
- excessive borders
- giant headings
- decorative charts
- repeated unavailable values
- exchange-style interfaces
- Buy/Sell-first composition
- unnecessary gradients
- decorative financial animation

## 19. Desktop composition

Desktop should prioritize information hierarchy over component quantity.

Typical composition:

Page context
→ primary capital state
→ operational breakdown
→ relevant capital structure
→ meaningful activity
→ contextual action

Application pages should use the available width intelligently without becoming visually sparse or artificially boxed.

## 20. Mobile composition

Mobile is a first-class operating environment.

Requirements include:

- four-item persistent bottom navigation
- safe-area awareness
- thumb-accessible actions
- focused transactional flows
- compact financial hierarchy
- sheets where appropriate
- keyboard-safe forms
- no forced desktop tables
- no accidental horizontal overflow
- no duplicated desktop sidebar concepts

Mobile must not be treated as desktop squeezed into a narrow viewport.

## 21. Motion

Motion follows the governing principle:

> Movement resolves into certainty.

Motion should communicate:

- navigation
- hierarchy
- state transition
- processing
- settlement

It must not imply financial completion before canonical state confirms completion.

Pending may remain subtly active.

Settled resolves and becomes still.

Reduced-motion preferences must be respected.

## 22. Loading and unavailable state

Loading, zero, unavailable and error are distinct states.

The application must not use one generic skeleton or dash to represent all four.

### Loading

The system is actively obtaining known information.

### Zero

Canonical state is known and equals zero.

### Unavailable

The system cannot truthfully provide the value.

### Error

A normally available operation or read failed.

These states require different language and interaction.

## 23. Implementation order

Authenticated application modernization should proceed in this order:

1. shared design tokens
2. typography and financial numerals
3. shared shell
4. mobile navigation
5. semantic financial-state primitives
6. Overview
7. Portfolio
8. Capital Account
9. Treasury
10. Allocation
11. Transfer/deposit/withdraw workflows
12. activity/transaction architecture
13. secondary settings and operational surfaces
14. final responsive/accessibility hardening

Do not redesign every page independently.

Shared primitives should establish the system first.

## 24. Backend convergence order

UI modernization must not be confused with backend completion.

Financial backend convergence should proceed separately and safely:

1. inventory direct financial database access
2. classify canonical vs application data
3. establish API read models
4. migrate canonical financial reads
5. migrate financial mutations
6. preserve idempotency and authorization
7. connect provider operations only after review
8. reconcile provider evidence
9. expose canonical state
10. retire obsolete direct financial access

Working architecture must not be removed before its replacement is proven.

## 25. Governing rule

The authenticated application should make the customer's capital state understandable without overstating what Neptlium knows or can execute.

Every page must answer:

- What is true?
- What state is it in?
- What changed?
- What can I legitimately do next?

Anything that does not improve those answers should justify its presence.
