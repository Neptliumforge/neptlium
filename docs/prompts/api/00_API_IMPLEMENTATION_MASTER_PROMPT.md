# NEPTLIUM API FOUNDATION
# MASTER IMPLEMENTATION PROMPT
## Version 1.0

---

# OBJECTIVE

You are the principal backend systems engineer responsible for implementing the Neptlium API Foundation inside the existing Neptlium monorepo.

You are not writing documentation only.

You are implementing production-quality software.

You must follow every specification document contained in this directory.

---

# AUTHORITATIVE SPECIFICATIONS

Read these documents completely before modifying any code.

Execute them in order.

1.

docs/prompts/api/01_API_ARCHITECTURE_AND_SECURITY.md

2.

docs/prompts/api/02_AUTH_WALLET_AND_LEDGER.md

3.

docs/prompts/api/03_PROVIDER_INTEGRATION_AND_WEBHOOKS.md

4.

docs/prompts/api/04_LEDGER_AND_PERSISTENCE.md

5.

docs/prompts/api/05_TESTING_DEPLOYMENT_AND_DOCUMENTATION.md

These documents together define the implementation.

They override assumptions.

Do not invent behavior outside them.

---

# EXECUTION MODE

Operate autonomously.

Do not ask unnecessary confirmation questions.

For this implementation you are already authorized to perform safe local development actions.

These include:

• inspecting repository files

• inspecting Git history

• reading documentation

• creating new files

• editing existing files

• installing repository dependencies

• updating workspace configuration

• updating Turborepo

• updating pnpm workspace

• updating shared packages

• creating apps/api

• creating tests

• creating migrations

• updating documentation

• running lint

• running typecheck

• running tests

• running builds

• fixing failures

• repeating validation until successful

---

# DO NOT

Do not:

commit

push

deploy

change Cloudflare

change DNS

modify remote Supabase

apply remote migrations

configure production providers

request production secrets

change Git history

force push

rewrite history

touch .claude/settings.local.json

If any of these are required, stop and report why.

---

# REPOSITORY

Canonical repository

https://github.com/Neptliumlabs/neptlium

---

# REQUIRED BRANCH

Implementation must occur only on

feat/neptlium-api-foundation

If the current branch is different:

STOP.

Do not continue.

Report the mismatch.

---

# EXISTING APPLICATIONS

Preserve existing applications.

Expected structure includes:

apps/web

apps/app

apps/admin

packages/ui

packages/lib

packages/config

packages/types

packages/design-system

Do not replace existing work.

Extend it.

---

# PRIMARY IMPLEMENTATION

Create

apps/api

as a first-class workspace application.

It must integrate into:

pnpm

Turbo

CI

shared packages

TypeScript

Vercel compatibility

---

# PRODUCT BOUNDARIES

Neptlium is capital operating infrastructure.

Crypto only.

Supported assets:

USDC on Base

ETH on Base

BTC on Bitcoin

No fiat.

No ACH.

No wire.

No cards.

No fabricated balances.

No fabricated transactions.

No fake custody.

No fake provider success.

Testnet precedes mainnet.

---

# IMPLEMENTATION PRINCIPLES

Build maintainable software.

Prefer correctness over shortcuts.

Prefer explicitness over magic.

Prefer typed interfaces.

Prefer dependency inversion.

Prefer deterministic behavior.

Prefer immutable financial history.

Prefer append-only accounting.

Never introduce hidden state.

---

# IMPLEMENTATION ORDER

Execute the specifications in sequence.

Architecture

↓

Authentication

↓

Wallet

↓

Ledger

↓

Providers

↓

Webhooks

↓

Persistence

↓

Testing

↓

CI

↓

Documentation

Do not skip phases.

---

# PROVIDERS

Coinbase CDP

Alchemy

Implement provider boundaries.

Do not fabricate provider SDK behavior.

When credentials are unavailable:

return structured

provider_not_configured

responses.

---

# AUTHENTICATION

Use server-side Supabase validation.

Never trust client identifiers.

Never expose privileged tables.

Separate customer requests from webhook requests.

---

# LEDGER

Implement append-only ledger architecture.

No mutable balance source of truth.

Balances are derived.

Double-entry accounting.

State machines must enforce legal transitions.

---

# WEBHOOKS

Implement:

verification boundaries

duplicate detection

replay protection

raw body verification

provider abstraction

constant-time comparison where appropriate

Never invent signature verification.

---

# TESTS

Implement automated tests covering:

validation

authentication

authorization

ledger

providers

webhooks

idempotency

transitions

reconciliation

pagination

audit logging

configuration

Health endpoint

Provider-disabled mode

---

# DATABASE

Inspect existing schema.

Create only forward migrations.

Never modify historical migrations.

Never destroy containment migrations.

---

# DOCUMENTATION

Update documentation only after implementation.

Documentation must describe actual behavior.

Never document imaginary functionality.

---

# VALIDATION

Continue working until all local validation passes.

Run:

lint

typecheck

tests

build

Correct failures.

Repeat until clean.

---

# OUTPUT

When implementation finishes provide a structured report including:

Repository state

Files added

Files modified

Workspace integration

API architecture

Routes implemented

Authentication

Authorization

Ledger

Providers

Webhooks

Persistence

Supabase changes

Tests

CI updates

Documentation updates

Validation results

Known limitations

Remaining launch gates

Do not commit.

Do not push.

Do not deploy.

Stop after a clean validated implementation.

---

# QUALITY STANDARD

Every implementation must meet production-quality engineering standards comparable to modern institutional financial infrastructure.

The resulting API should be modular, testable, secure, deterministic, auditable, and suitable to evolve into Neptlium's long-term capital operating platform.

End of Master Implementation Prompt.
