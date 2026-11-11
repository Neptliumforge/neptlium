# Investment Order Enrollment

## CURRENT — local, non-purchasable prototype

Neptlium Listings is an authenticated preview at `/dashboard/listings`, reached from Invest. Definitions are owned by `apps/api/src/investment-orders.ts`; the App reads the API rather than maintaining a second price catalog. The catalog is explicitly proposed and unavailable. Enrollment commands authenticate and reject with HTTP 503. There is no enrollment persistence, checkout, payment instruction, crypto address, offering activation, allocation, position or return calculation.

| Proposed order      | Proposed amount | Proposed term |
| ------------------- | --------------- | ------------- |
| Entry Order         | USD 500         | 2 months      |
| Growth Order        | USD 1,000       | 2 months      |
| Advanced Order      | USD 5,000       | 4 months      |
| Executive Order     | USD 15,000      | 6 months      |
| Institutional Order | USD 25,000      | 6 months      |

These are investment-product concepts because financial returns are intended. They are not subscription memberships. A proposed term does not establish a payout date, maturity entitlement or liquidity. Return rates, payout schedules, guarantees and principal protection are not established. No issuer, custody relationship, regulatory approval or legal availability is asserted.

## TRANSITION — approval and implementation dependencies

Every proposed product requires documented offering/return terms, issuer and legal entity, eligibility, permitted jurisdictions, risk disclosures, custody structure and legal approval. Identity verification and an authenticated account do not establish investment eligibility. Viewing details or acknowledging disclosures cannot establish approval.

The prototype shows pending disclosures and a disabled enrollment action. No executable enrollment or payment flow is hidden behind the UI. A future API returning purchasable products is rejected by this preview client until a separately reviewed flow exists. Enrollment history is explicitly unavailable, not fabricated empty history.

## TARGET — gated enrollment architecture

Journey: Listings → Order Details → Eligibility and Disclosures → Enrollment Intent → Payment Instructions → Payment Verification → Enrollment Processing → Dashboard.

1. **Offering authority:** immutable, versioned server definitions reference approved issuer, jurisdiction policy, custody terms, exact USD minor-unit amount, duration and signed terms/disclosure digests. Changing terms creates a new version. Marketing names never determine financial authority.
2. **Authenticated intent:** derive the immutable principal on the API. Bind definition/version, exact amount/currency, eligibility decision, disclosure version, idempotency key and request digest. Ignore client price/owner claims. A unique constraint on `(owner, operation, idempotency_key)` rejects payload changes and returns the original intent on retries.
3. **References:** generate unpredictable unique Neptlium intent, order and payment references server-side. Enforce uniqueness in storage. References identify intent; they never authenticate a callback or authorize a financial transition.
4. **Payment instructions:** provide only after eligibility/legal/custody/payment-method gates, with expiration and exact reference/amount/currency/network. Payment attempts sit beneath the existing [Payment domain](PAYMENTS.md). Never reuse subscription checkout or subscription customer identity as investment identity. No payment link or crypto address is configured by this prototype.
5. **Evidence:** append verified, environment-bound, deduplicated provider events and chain receipt/log observations, preserving payload digests and attempt/intent correlation. Unknown submission requires lookup before another attempt. Provider confirmation is not ledger posting, compliance approval or investment allocation.
6. **Review and allocation:** payment verification, canonical cash reconciliation, compliance review, allocation authorization, allocation execution and position reconciliation are independent state dimensions. Passing one dimension never silently advances another. Enrollment becomes effective only under the legally approved workflow, with reviewed reservation/posting semantics and human authorization where required.
7. **History:** append immutable lifecycle events with sequence, actor/system identity, request ID, policy/terms version and evidence references. Persist transitions atomically with their event and optimistic version check. Owner-scoped projections expose actual stage, exception, next action and freshness; failures remain unavailable rather than zero or enrolled.

The API exports target intent/evidence/history interfaces only. Their presence does not establish a persistence schema or implemented lifecycle. No mutable enrollment store or economic execution is introduced.

| Payment condition             | Required treatment before any allocation                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Failed                        | Preserve attempt evidence; decide retry only after unambiguous failure                      |
| Expired / late payment        | Stop normal progression; classify and manually review late evidence                         |
| Disputed / refunded           | Restrict affected workflow; retain cash and allocation histories; use governed compensation |
| Underpaid                     | Record discrepancy; no automatic top-up, allocation or amount change                        |
| Overpaid                      | Record excess separately; governed review/refund, never silently increase the order         |
| Duplicate payment             | Deduplicate event delivery; classify distinct economic payments separately                  |
| Unknown submission            | Provider lookup/reconciliation before retry or alternate rail                               |
| Wrong asset/network/reference | Quarantine as unmatched evidence; no inferred attribution                                   |
| Reorg / conflicting evidence  | Retain prior observations, restrict progression and reconcile again                         |

## Optional AI assistance

Repository inspection found no existing OpenAI runtime integration in Apps/packages. Codex development assistance does not require adding an OpenAI client to Neptlium. No SDK, key, provider call or credit consumption was added.

TARGET optional uses are explanations grounded in approved documents, cited research summaries and operator summaries of authorized observations. Label analysis as non-canonical and require human review. Do not expose financial command tools, service-role credentials, signing material or allocation/withdrawal APIs to a model. AI cannot decide eligibility, approve offerings, authorize payment, post ledger entries or allocate investments.

If separately approved: use an API-owned server adapter with a scoped project service account, server-managed credentials, per-principal request limits, input/output size limits, a model allowlist, bounded retries/timeouts and an application-enforced spend reservation before calls. Separate staging from production. Redact personal/financial data, define retention, and run mocked tests and injection/grounding evaluations before a small explicitly budgeted API test. Provider budget alerts alone are not an application authorization control. See [official OpenAI production guidance](https://developers.openai.com/api/docs/guides/production-best-practices).

## Release boundary

This local prototype is not an offer, an approved investment product or a production release. No deployment, migration, backfill, payment activation or customer-fund acceptance is authorized. Legal approval, database authority, provider certification and release authorization are separate gates.
