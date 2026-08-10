# 00_EXECUTION_CONTRACT.md

# NEPTLIUM API FOUNDATION
## Execution Contract
### Version 1.0

---

# STATUS

Authoritative engineering specification.

This document governs every implementation performed for the Neptlium API.

It exists to eliminate ambiguity, reduce architectural drift, and ensure every implementation remains truthful, deterministic, auditable, and production-oriented.

Every subsequent specification depends on this execution contract.

---

# PRODUCT IDENTITY

Product

Neptlium

Canonical Positioning

Neptlium is capital operating infrastructure for modern ownership.

The platform enables disciplined capital management through secure digital asset infrastructure, portfolio intelligence, allocation systems, treasury operations, and programmable financial infrastructure.

The API exists to provide secure backend capabilities for Neptlium applications.

It is not a trading bot.

It is not a custodial simulation.

It is not an investment-return engine.

---

# CANONICAL APPLICATIONS

The repository contains multiple first-class applications.

They are independent products sharing common infrastructure.

Expected applications:

apps/web

Public marketing website

apps/app

Authenticated investor application

apps/admin

Administrative operations platform

apps/api

Backend API (this specification)

No implementation may collapse these boundaries.

---

# CANONICAL DOMAINS

Marketing

https://neptlium.com

https://www.neptlium.com

Investor Platform

https://app.neptlium.com

Administration

https://admin.neptlium.com

Backend

https://api.neptlium.com

Every application has a single responsibility.

---

# REPOSITORY INVARIANTS

Before making any modification the implementation MUST inspect:

- Git branch
- Git status
- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig
- application manifests
- shared packages
- Supabase architecture
- migrations
- environment files
- CI
- Vercel configuration
- documentation

No architectural assumptions may be invented.

Repository reality always overrides assumptions.

---

# REQUIRED BRANCH

Unless explicitly instructed otherwise, implementation must occur only on:

feat/neptlium-api-foundation

If the current branch differs:

STOP IMMEDIATELY.

Do not edit files.

Do not create files.

Do not install dependencies.

Do not continue.

---

# PRODUCT BOUNDARIES

Current supported assets:

• USDC on Base

• ETH on Base

• BTC on Bitcoin

No other assets are considered supported.

---

# PROHIBITED FEATURES

Do NOT implement:

Fiat

ACH

Cards

Wire transfers

Bank accounts

Cash deposits

Investment returns

Trading strategies

Yield generation

Exchange simulation

Portfolio performance fabrication

Price prediction

Automatic trading

Retail Coinbase APIs for custody

---

# TESTNET POLICY

Development is testnet-first.

Mainnet capabilities remain disabled until explicitly enabled.

Preferred initial network:

Base Sepolia

Mainnet execution must never occur accidentally.

---

# TRUTHFULNESS REQUIREMENT

The system must never fabricate:

wallet addresses

balances

transactions

transaction hashes

deposit confirmations

withdrawals

provider connectivity

Coinbase integration

Alchemy integration

custody

settlement

network confirmation

pricing

portfolio value

investment returns

If something is unavailable:

Return a truthful structured error.

Never simulate success.

---

# EXECUTION MODEL

Every implementation follows this exact sequence.

PHASE 1

Inspect

Understand repository state.

PHASE 2

Plan

Identify required changes.

PHASE 3

Implement

Modify only necessary files.

PHASE 4

Verify

Run builds.

Run lint.

Run typecheck.

Run tests.

PHASE 5

Repair

Correct every discovered issue.

PHASE 6

Verify Again

Repeat validation until clean.

PHASE 7

Summarize

Produce a final engineering report.

No phase may be skipped.

---

# SAFE LOCAL AUTHORITY

Implementation is already authorized to:

Inspect files

Inspect Git history

Read documentation

Create files

Edit files

Delete newly created files if necessary

Install dependencies

Run builds

Run tests

Run lint

Run typecheck

Run local database validation

Inspect diffs

Repeat verification

No confirmation should be requested for these actions.

---

# STOP BOUNDARY

Without explicit user instruction:

DO NOT

Commit

Push

Deploy

Modify remote Supabase

Apply remote migrations

Configure production providers

Create production webhooks

Modify Cloudflare

Modify Vercel DNS

Purchase services

Change Git history

Merge branches

Touch

.claude/settings.local.json

These actions require explicit authorization.

---

# ARCHITECTURAL PRINCIPLES

Every implementation must prioritize:

Security

Correctness

Determinism

Auditability

Maintainability

Explicit boundaries

Small interfaces

Truthful responses

Provider isolation

No hidden side effects

---

# FAILURE POLICY

If implementation encounters uncertainty:

Do not invent behavior.

Do not invent APIs.

Do not invent provider contracts.

Do not fabricate database schemas.

Instead:

Create explicit extension points.

Return configuration-required errors.

Document remaining integration work.

---

# CODE QUALITY REQUIREMENTS

All code must be:

Production-oriented

Strongly typed

Modular

Testable

Documented

Framework-consistent

No dead code.

No placeholder TODO implementations pretending to work.

No mocked production behavior.

---

# DOCUMENTATION REQUIREMENTS

Every completed phase must leave:

Updated documentation

Accurate README changes

Truthful environment documentation

Migration notes

Testing instructions

Deployment notes

No documentation may claim functionality that is not actually implemented.

---

# ENGINEERING REPORT

Every execution concludes with an engineering report containing:

1. Summary

2. Repository state

3. Files created

4. Files modified

5. Architecture implemented

6. Endpoints implemented

7. Database changes

8. Tests executed

9. Remaining risks

10. Remaining work

11. Launch blockers

12. Exact Git status

---

# DEFINITION OF DONE

Implementation is complete only when:

✓ Repository builds successfully

✓ TypeScript passes

✓ Lint passes

✓ Tests pass

✓ API compiles

✓ Documentation matches implementation

✓ No fabricated behavior exists

✓ Provider-disabled paths fail truthfully

✓ Existing applications remain functional

✓ Repository integrity is preserved

Any unmet requirement means the implementation is NOT complete.

---

# AUTHORITATIVE RULE

If any later specification conflicts with this execution contract:

This document takes precedence.

Every subsequent specification must comply with this contract.

End of Execution Contract.
