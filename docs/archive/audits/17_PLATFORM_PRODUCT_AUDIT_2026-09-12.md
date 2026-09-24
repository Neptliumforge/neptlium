# Neptlium Platform Product Audit — 2026-09-12

**Status:** Historical engineering audit; superseded by the final platform reconciliation work.
**Scope:** Customer application, API identity boundary, dashboard truthfulness, deposit architecture, deployment health, and product-development priorities as observed on 2026-09-12.

## Historical context

This audit captured the platform during an authentication and product-family transition. It must not be used as current runtime authority where it conflicts with source, current numbered architecture documents, or the final reconciliation PR.

## Current authentication correction

The active target and current reconciliation contract is **Supabase Auth only** for customer and operator authentication.

Current runtime expectations are:

- authenticated browser sessions originate from Supabase Auth;
- API bearer tokens are Supabase access tokens;
- authenticated subjects resolve to stable Neptlium principals;
- authentication does not grant financial, administrative, treasury, or organization authority by itself;
- service-role credentials remain server-only infrastructure authority;
- historical identity-provider mappings and migrations may remain as evidence but are not active runtime authentication paths.

## Customer dashboard

Authenticated financial surfaces must render only evidence-backed state or explicit unavailable/pending/empty/not-configured states. They must not display invented balances, positions, returns, allocation, or transaction-like activity.

## Deposit

Deposit remains capability-driven. The browser must never generate authoritative deposit instructions or self-credit funds. Provider observation is evidence; canonical availability requires governed posting and reconciliation.

Target asset/network catalogs are architecture, not production claims.

## USD funding

Existing Stripe webhook infrastructure does not establish live capital funding. A production USD funding path requires a separately reviewed funding contract, authenticated attribution, idempotency, failure/refund handling, ledger posting, settlement evidence, reconciliation, and customer history.

## API and financial integrity

The API remains the privileged financial-control boundary. Required invariants include precise money representation, idempotency, append-only/compensating financial history, explicit authorization, provider-evidence separation, verified webhook ingress, and reconciliation before settled truth where required.

## Admin

Admin is structurally separate from the customer application. Authentication identifies the operator; server-owned role and policy authorization determines permitted administrative actions. Administrative workflow state must never be confused with external execution or settlement.

## Marketing Web

The marketing site may present the intended product experience but must not fabricate balances, returns, customers, partnerships, provider availability, regulatory status, or other factual proof.

## Completion standard

A Neptlium feature is not complete because a screen renders. Completion requires verified authentication, authorization, validation, responsive states, accessible interaction, failure handling, auditability, financial integrity, observability, deployment health, and documentation consistent with runtime truth.
