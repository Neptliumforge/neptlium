# Neptlium Capital Intelligence — Gate 10 Product Proposal

Status: PROPOSED / NON-EXECUTING. No live financial capability, authorization change, or deployment is approved by this document.

## Decision

Investigate a B2B capital-obligations intelligence product, distinct from the existing individual Capital Account, Pay, Wallet, and Treasury execution surfaces. The initial product is read-only analysis of customer-provided financial inputs. Do not represent it as a live feature or offer lending, custody, investment advice, payment execution, or bank connectivity.

## Problem and customer

Hypothesis: finance teams managing infrastructure leases, debt schedules, equipment financing and capital commitments need a traceable way to forecast cash requirements and stress liquidity. Validate through 15–20 interviews and at least three design partners before full build.

## MVP

1. Organization-scoped obligations register: contracts, counterparties, due dates, currency, amount, status and provenance.
2. 13-week cash forecast from explicitly sourced opening balances, expected receipts and scheduled outflows; unknown must not be zero.
3. Scenario comparisons for late receipts, rate changes, maturities and refinancing assumptions, clearly labeled as modeled.
4. Alerts for upcoming obligations, missing source evidence and projected shortfalls.
5. Exportable audit reports with source IDs, calculation versions, timestamps and actor identity.

## Non-negotiable engineering boundaries

- No mutation of production databases or migrations under this proposal.
- No transfer, custody, deposit, lending, credit approval, investment execution or automated payment instruction.
- No synthetic balances presented as real; pending is not settled; forecast is not available balance.
- Verify issuer, audience, signature, expiry and applicable authorization claims for every server-side access token; independently resolve the stable Neptlium principal and organization membership before data access.
- Enforce tenant isolation server-side and in database policies; least privilege, private storage, redacted logs and auditable access.
- Use precise decimal amounts, explicit currency, deterministic calculation functions, test fixtures and versioned scenario inputs.
- Preserve existing customer-facing Capital and canonical financial ledger boundaries.

## Architecture dependency: Phase 1 identity reconciliation

Current main documentation at `apps/app/README.md` and `docs/product/CAPITAL.md` states Supabase Auth is the sole active browser/session authority. Historic Clerk migrations exist, but do not establish Clerk as active. Before Clerk implementation: inspect current code, identity migration lineage, principal linking, API token verification, Preview environment and rollback/recovery readiness. Decide and document a single authentication authority. Never accept a Clerk subject or email from the browser as proof of identity. Never modify live auth or production credentials without an independently verified migration plan and explicit approval.

## Delivery gates

- G10-A: customer problem and pricing interviews, competitor feature verification.
- G10-B: approved data model, tenant/auth design and deterministic calculation specification.
- G10-C: isolated prototype using fictional data, tests for currency, rounding, missing inputs and cross-tenant denial.
- G10-D: controlled pilot after security review, backup/restore verification and customer consent.
- G10-E: paid conversion and retention evidence before scaling.

## Commercial assumptions (unvalidated)

Test $149 / $499 / $1,499 monthly tiers; measure onboarding time, reporting time saved, forecast usefulness and willingness to pay. No revenue projections are guarantees.

## Next action

Resume paused Phase 1 and Clerk readiness as a separate, reviewable identity workstream. Inspect and reconcile Supabase Auth cutover before writing Clerk runtime code. Keep this proposal separate from production authentication and financial transaction changes.
