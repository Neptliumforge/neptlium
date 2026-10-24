# Neptlium Invest — Product Catalog

Status of this document: **CURRENT** for the catalog schema, API and App views introduced by migration `20261022090000_invest_product_catalog`; **TARGET** where marked. The catalog is a discovery and content-governance system. It does not execute, allocate, custody or settle anything.

## 1. What the catalog is

The catalog describes Neptlium Invest products and research themes with an explicit availability state. Three states are kept distinct end to end — in the schema, the API contract and every customer surface:

| Availability | Meaning | Customer wording | Can be published today |
| --- | --- | --- | --- |
| `CONCEPT` | A plan under development. No approved allocation, instruments, operator, fees or eligibility. | "Concept — Not available to invest" | Yes |
| `RESEARCH_ONLY` | Research context on a theme or sector. Not an investment product. | "Research only — Not an investment product" | Yes |
| `INVESTABLE` | A product that eligible investors can actually invest in. | "Available" | **No — publication is blocked in SQL** |

`PLANNED != AVAILABLE` and `MODELED != EXECUTED` are enforced, not merely documented: publishing an `INVESTABLE` version raises `publishing investable products is disabled` inside `invest_transition_version`. Lifting that block requires a reviewed forward migration together with the approvals listed in §9.

Every customer response also carries `investing: { state: "DISABLED", reason: "investment_execution_not_enabled" }`. No order, allocation or funding endpoint exists.

## 2. Catalog content (seeded)

| Family | Products |
| --- | --- |
| Managed plan (`MANAGED_PLAN`, `CONCEPT`) | Neptlium Reserve, Neptlium Income, Neptlium Balanced, Neptlium Growth |
| Research collection (`THEMATIC_COLLECTION`, `RESEARCH_ONLY`) | AI & Compute, Cloud & Software, Digital Infrastructure, Energy & Power, Global Innovation |

Research sectors (searchable and filterable): artificial intelligence, semiconductors, cloud computing, software, cybersecurity, digital infrastructure, energy and power, financial technology, industrial automation, healthcare technology.

Neptlium Reserve carries **proposed** terms: minimum USD 300 and maximum USD 10,000 (stored as `30000` / `1000000` minor units, `terms_status = PROPOSED`). They are labelled "Proposed … not final" everywhere and require a `PROPOSED_TERMS` disclosure before publication.

The seed contains **no** instruments, prices, holdings, issuer relationships, performance, yields, targets, scenarios or customer data. Eligibility is `NOT_SUPPORTED` in every configured jurisdiction (US, NG, LU, GB, AE, SG).

The seed is mirrored in `apps/api/src/invest-catalog-seed.ts` (memory repository). Public discovery content in `apps/web/lib/content/invest.ts` stays editorial and Marketing-owned; parity tests fail if either drifts from the migration's slugs, names or availability.

## 3. Schema

All tables are in `public`, have RLS enabled with no policies, are revoked from `public`/`anon`/`authenticated`, and are `SELECT`-only for `service_role`. All writes go through two security-definer functions, so every change is governed and audited in the same transaction.

| Table | Purpose |
| --- | --- |
| `invest_products` | Stable identity: `slug` (unique), `family` (immutable). |
| `invest_product_versions` | Versioned content: `version`, `status`, `availability`, name/tagline/summary/body/objective, `risk_level` (1–7), `sort_rank`, author/submitter/approver and timestamps. At most one `PUBLISHED` version per product (partial unique index). |
| `invest_product_terms` | `terms_status` (`PROPOSED`/`APPROVED`), currency, `minimum_minor`/`maximum_minor` (bigint minor units), fee and liquidity notes. |
| `invest_research_sectors`, `invest_version_sectors` | Sector taxonomy and version membership. |
| `invest_instruments`, `invest_version_instruments` | Reference instruments and their role (`RESEARCH_REFERENCE` or `CONSTITUENT`). Empty in the seed. |
| `invest_eligibility` | Per-jurisdiction `NOT_SUPPORTED` / `UNDER_REVIEW` / `PERMITTED`. `PERMITTED` requires a recorded basis and investor classes. |
| `invest_disclosures` | `CONCEPT_STATUS`, `RESEARCH_ONLY`, `NOT_AN_OFFER`, `RISK`, `FEES`, `PROPOSED_TERMS`, optionally per jurisdiction. |
| `invest_return_figures` | Typed return data (§5). Empty in the seed. |
| `invest_catalog_audit_events` | Append-only audit (`SEEDED`, `DRAFT_CREATED`, `TRANSITIONED`) with actor, from/to status and rationale. |

Integrity guards (triggers):

- Version content is immutable once a version leaves `DRAFT`.
- Terms, sectors, instruments, eligibility, disclosures and return figures can change only while their version is `DRAFT`.
- Audit events cannot be updated or deleted.

The catalog does not depend on `api_audit_events`, which is absent from production.

## 4. Lifecycle and governance

```
DRAFT ──submit──▶ IN_REVIEW ──approve──▶ APPROVED ──publish──▶ PUBLISHED ──▶ SUPERSEDED
  ▲                  │                      │                     │
  └──── return ──────┘                      └──── withdraw ───────┴──▶ WITHDRAWN
```

`invest_transition_version(version_id, actor, to_status, rationale)` enforces:

- only the transitions above, with idempotent replay of a repeated transition;
- a rationale of at least 10 characters for return-to-draft, approve, publish and withdraw;
- **four-eyes approval** — the approver must differ from both the author and the submitter;
- publication prerequisites — a `CONCEPT_STATUS` or `RESEARCH_ONLY` disclosure matching the availability, `NOT_AN_OFFER`, and `PROPOSED_TERMS` whenever proposed terms exist;
- the `INVESTABLE` publication block (§1);
- supersession of the previously published version;
- an audit event for every transition.

Seeded versions are authored and submitted by `system:migration` and start `IN_REVIEW`. A freshly migrated database therefore publishes **nothing**: each version must be approved and published by an administrator with a recorded rationale (§8).

## 5. Return data model

Return information is typed so that different kinds of number can never be confused:

| Kind | Meaning | Required evidence | Customer-visible |
| --- | --- | --- | --- |
| `HISTORICAL_PERFORMANCE` | Realised performance over a stated period. | period, as-of date, source | Only when `APPROVED` |
| `CURRENT_YIELD` | Observed current yield of an instrument. | as-of date, source | Only when `APPROVED` |
| `APPROVED_TARGET` | A formally approved objective. | methodology reference, period | Only when `APPROVED` |
| `HYPOTHETICAL_SCENARIO` | An internal planning scenario. | — | **Never** (check constraint) |

Values are stored as integer basis points with their basis text. The API filters figures again before any customer response, and the App renders figures only from that filtered list. With no published figures the App states: "No performance, yield or return information is published for this product. Neptlium does not show projected or hypothetical returns."

### Hypothetical internal scenario specification

A proposed periodic return figure (for example a weekly or monthly percentage) is **not approved, not seeded and not encoded** anywhere in source, tests excepted where a test proves it cannot become visible. If the owner wants such a figure retained for internal planning, it may be recorded only as:

- `kind = HYPOTHETICAL_SCENARIO`, `customer_visible = false`;
- a `basis` naming it as an unapproved internal assumption, its owner and date;
- no linkage to any customer, balance, order or projection.

It must never be shown to customers, in Marketing, or as an expected, target or guaranteed return. Converting it into an `APPROVED_TARGET` requires a documented methodology, compliance approval and a reviewed change.

## 6. API contract (`apps/api`)

Customer endpoints require an authenticated Supabase session (401 otherwise) and return `contract_version: 1`:

| Endpoint | Description |
| --- | --- |
| `GET /v1/invest/catalog` | Published listing with `total`, `published_total`, `items` and `facets`. Query: `q` (≤ 80 chars, all-token match over name, tagline, summary, family and sector names), `family`, `availability`, `sector`, `sort` (`featured`/`name`/`risk`), `order` (`asc`/`desc`). Invalid values → 422. |
| `GET /v1/invest/sectors` | Sector taxonomy. |
| `GET /v1/invest/catalog/:slug` | Published product detail: content, terms, sectors, disclosures, eligibility, customer-visible figures, `investing` capability. Unpublished or unknown → 404 `invest_product_not_found`. |

Operator endpoints sit behind the Admin super_admin gate (403 for other roles):

| Endpoint | Description |
| --- | --- |
| `GET /v1/admin/invest/catalog` | Every product and version, including internal state. |
| `POST /v1/admin/invest/products/:slug/versions` | Creates a `DRAFT` (201). Eligibility starts `NOT_SUPPORTED` everywhere. |
| `POST /v1/admin/invest/versions/:id/transition` | Applies a governed transition with rationale. Rejections → 409 `invest_transition_rejected` with `details.reason` (`transition_not_permitted`, `reviewer_must_differ`, `investable_publication_disabled`, `disclosure_required`, `family_immutable`). |

Storage failures and malformed storage responses fail closed with 503 `invest_catalog_unavailable`. Production refuses to start the in-memory repository.

Draft creation currently accepts content, proposed terms, sectors and disclosures. Editing eligibility, instruments and return figures through the API is **TARGET** work (§9); until then those stay at their safe defaults.

## 7. Experience

- **App** (`apps/app/app/dashboard/invest`): server-rendered catalog with a script-free GET search and filter form, family grouping, availability badges on every card, and product detail pages showing the status panel, proposed terms, disclosures, sectors and eligibility. It covers loading, empty ("The catalog is being prepared"), no-match, unavailable (503) and not-found states. It has no buy, allocate or invest action. Canonical tokens only.
- **Public web** (`apps/web/app/investments`, `apps/web/lib/content/invest.ts`): owner-directed investment discovery. It presents the five research collections as research only and the four plans as concepts. Web is not a second catalog: it holds no availability state of its own, and `apps/web/test/invest-discovery.test.mjs` keeps its collections and plan families aligned with the catalog seed.
- **Admin UI**: not built. Operators use the admin API above.

## 8. Publishing the seeded catalog (runbook)

Preconditions: the migration is applied through the normal reviewed release, and the owner has approved the wording of each seeded version.

1. `GET /v1/admin/invest/catalog`; confirm each version is `IN_REVIEW`, authored by `system:migration`.
2. For each version to release: `POST …/transition` with `to_status: "APPROVED"` and a rationale naming the review.
3. Then `to_status: "PUBLISHED"` with a rationale.
4. Confirm `GET /v1/invest/catalog` lists exactly the published versions, and the audit table holds one event per transition.

To retract: transition to `WITHDRAWN` with a rationale. History is never deleted.

## 9. Provider integration points and unfinished dependencies

Providers sit beneath the Neptlium domain (see [Providers](PROVIDERS.md)). None are integrated with the catalog, and none are simulated.

| Integration point | Future responsibility | Current state |
| --- | --- | --- |
| Brokerage / execution adapter | Order routing for `INVESTABLE` products. | Absent. No order model exists. |
| Custody adapter | Safekeeping of investor assets. | Absent. |
| Instrument reference data | Populate `invest_instruments` from a licensed source with as-of evidence. | Table exists and is empty. |
| Market / yield data | Source `CURRENT_YIELD` and `HISTORICAL_PERFORMANCE` evidence. | Absent. No prices or yields are stored. |
| Eligibility / suitability | Jurisdiction permissions and investor classification. | All `NOT_SUPPORTED`. |
| Funding | Movement from Capital into Invest. | Absent. Capital balances are not touched. |

Before any product can become `INVESTABLE`:

- a regulated partner relationship and operating model;
- legal approval per jurisdiction, with recorded eligibility basis;
- approved terms, fees and disclosures;
- reviewed execution, custody and reconciliation boundaries;
- a reviewed migration lifting the publication block.

## 10. Validation

- `supabase/test/invest-catalog/run.sql` — database contract against disposable Postgres, with production default privileges simulated.
- `supabase/test/invest-catalog.test.mjs` — static migration contract.
- `apps/api/test/invest-catalog.test.mjs` — API, authorization, governance and seed parity.
- `apps/app/test/investment-discovery-truth.test.mjs` — App truthfulness and states.
- `apps/web/test/invest-discovery.test.mjs` — public discovery parity with the catalog seed.

CI job: `validate-invest-catalog`.
