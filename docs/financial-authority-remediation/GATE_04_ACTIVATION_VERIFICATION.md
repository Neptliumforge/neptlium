# Gate 04 — Activation Verification

Status: **BLOCKED**

## Objective
Prove that the canonical Stripe webhook endpoint accepts a valid signed Stripe request, persists exactly one inbox event, classifies payment-mode Checkout as `stripe_capital_funding_not_enabled`, performs zero financial mutation, and leaves the retired Supabase Stripe function safely tombstoned.

## Invariant
A Stripe event must first pass signature verification and durable inbox ingestion before any downstream handling. Payment-mode `checkout.session.completed` is not Neptlium capital funding and must not mutate financial state.

## Repository state inspected
- Default branch: `main`
- Main commit at inspection: `f1ee9222fa0e2274b16c5eba052e10183a77285f`
- Canonical production endpoint: `https://api.neptlium.com/v1/webhooks/stripe`
- Handler source: `apps/api/src/stripe-serverless.ts`
- Signature/classification source: `apps/api/src/stripe-webhook.ts`

The active source verifies `Stripe-Signature` over the raw body, records verified events in `provider_webhook_inbox`, claims them idempotently, and classifies payment-mode `checkout.session.completed` as `stripe_capital_funding_not_enabled`.

## Production evidence collected — 2026-09-12

### A. Signed request acceptance
**NOT YET PROVEN.**

The most recent manual Termux request reached `https://api.neptlium.com/v1/webhooks/stripe` but returned HTTP 401. No accepted signed request has yet been observed.

Therefore Gate 04 cannot be marked PASS.

### B. `provider_webhook_inbox`
Live production query for `provider = 'stripe'` returned **zero rows**.

This proves no Stripe event has yet completed signature verification and durable inbox persistence in the current production database.

### C. Persisted classification
**NOT YET PROVEN.**

Source code maps payment-mode `checkout.session.completed` to `stripe_capital_funding_not_enabled`, but the gate requires observable/persisted execution evidence. Because no Stripe inbox row exists, production classification has not yet been observed.

### D. Financial-state baseline before accepted-event verification
Production baseline captured before the required accepted signed event:

| Entity | Rows | Fingerprint |
| --- | ---: | --- |
| `funding_intents` | 0 | `d41d8cd98f00b204e9800998ecf8427e` |
| `ledger_journals` | 0 | `d41d8cd98f00b204e9800998ecf8427e` |
| `ledger_postings` | 0 | `d41d8cd98f00b204e9800998ecf8427e` |
| `portfolios` | 16 | `2b3b92278ecb2fb2ff194d6b41c79680` |
| `settlement_evidence` | 0 | `d41d8cd98f00b204e9800998ecf8427e` |
| `subscriptions` | 16 | `ed34989c908c23b00e889f2e1184042c` |
| `transactions` | 0 | `d41d8cd98f00b204e9800998ecf8427e` |

These are the authoritative before-state values for the next production-safe signed event test.

### E. Retired Supabase Stripe function
Live Supabase Edge Function inspection confirms:
- slug: `stripe-webhook`
- status: `ACTIVE`
- version: `22`
- `verify_jwt = true`
- source SHA-256: `a8698505503435dd923748dfef7589a0d2a0b58327556267ee7382afd2dbbc4a`

The deployed source is the retirement tombstone only. It returns HTTP 410 with `STRIPE_WEBHOOK_RETIRED` and contains no provider SDK, database client, env access, request-body parsing, ledger logic, or financial mutation logic.

This satisfies the tombstone-state portion of Gate 04. Current Stripe Dashboard routing still requires provider-side confirmation as part of the final activation proof.

## Deployment visibility
GitHub commit status shows Vercel status checks on current `main`; the latest product commit did not rebuild the API because the Vercel API project reported `Canceled by Ignored Build Step`. Direct Vercel connector deployment/log listing is currently denied with HTTP 403, so deployment/version attribution for the next accepted webhook must be collected from GitHub/Vercel evidence available at that time.

## Required remaining proof
Before Gate 04 may pass, one fresh validly signed `checkout.session.completed` event with `mode = payment` must:
1. return 2xx from the canonical endpoint;
2. create exactly one Stripe inbox row;
3. persist/return observable `stripe_capital_funding_not_enabled` classification;
4. leave all seven financial/subscription table fingerprints above unchanged;
5. leave the Supabase v22 tombstone unchanged;
6. demonstrate duplicate/retry idempotency where practical.

## Residual blocker
The connected execution environment does not expose the Stripe destination signing secret and cannot originate a provider-signed Stripe Dashboard test event. The prior manually generated request returned 401 and produced no inbox row. No secret should be copied into repository evidence or chat.

## Final gate state
**GATE 04: BLOCKED**

Gate 05 implementation must not begin until the signed-event activation proof is collected and the post-event production snapshot matches the baseline above.
