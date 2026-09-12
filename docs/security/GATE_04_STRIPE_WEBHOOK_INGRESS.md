# Gate 04 — governed Stripe webhook ingress

## CURRENT baseline

Gate 04 starts from canonical `main` commit `257d7a04689bdd4d9c237bbad19ee5661244730e` on branch `remediation/gate-04-stripe-webhook-ingress`.

The production Supabase project is `ayrgojoiprxyijeshika`. At Gate 04 discovery time the legacy `stripe-webhook` Edge Function was active as version 21 with `verify_jwt=true`. Its source verified `Stripe-Signature` inside the handler but also mixed subscription handling with one-time payment deposit authority. A paid payment-mode Checkout session could insert a completed legacy `transactions` row and increment `portfolios.total_value` directly, bypassing `funding_intents`, provider inbox processing, settlement evidence, the canonical ledger, and reconciliation.

The current repository already contains a safer API evidence boundary at `/v1/webhooks/stripe`, a durable `provider_webhook_inbox`, the unique provider-event identity constraint, and service-role-only claim/complete/fail RPCs. Gate 04 specializes that route into a raw-body serverless ingress so Stripe signature verification happens before JSON parsing.

## Authority decision

Current product and provider documentation classifies Stripe capital funding and Stripe Onramp as TARGET capabilities, not live funding rails. Gate 04 therefore does **not** invent or enable a Stripe capital-crediting contract.

The governed ingress is evidence-only:

1. receive raw HTTPS bytes at `https://api.neptlium.com/v1/webhooks/stripe`;
2. verify `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET` and timestamp tolerance;
3. parse the event only after signature verification;
4. persist the verified event into `provider_webhook_inbox` with SHA-256 payload evidence;
5. claim the durable inbox row through the existing leased control plane;
6. classify the event;
7. complete or fail inbox processing through backend-only RPCs;
8. perform **no** capital settlement, ledger posting, balance mutation, or availability transition.

A future Stripe Payments or Onramp funding contract must separately define funding-intent attribution, provider references, settlement/reversal semantics, balanced posting, reconciliation, dispute/refund handling, and operational authorization before any Stripe event may affect customer capital.

## Event set

Gate 04 retains only the minimum legacy subscription event set as verified durable evidence:

| Stripe event | Gate 04 action | Capital availability authority |
| --- | --- | --- |
| `checkout.session.completed` | Subscription-mode events are retained as subscription evidence. Payment-mode events are explicitly ignored as `stripe_capital_funding_not_enabled`. | None |
| `invoice.paid` | Retained as subscription evidence. | None |
| `customer.subscription.updated` | Retained as subscription evidence. | None |

All other valid signed events are durably accepted and marked ignored by this ingress. No event in Gate 04 may create settlement evidence or make funds available.

The legacy `create-checkout-session` production Edge Function was also inspected read-only. It creates only `mode=subscription` Checkout sessions for legacy Pro/Elite plans; it is not a capital-deposit session creator. Production `subscriptions` currently contains 16 free/active rows and zero stored Stripe customer or subscription IDs. Gate 04 does not modify that function or subscription product flow.

## Replay and concurrency controls

Production `provider_webhook_inbox` enforces:

`UNIQUE (provider, environment, provider_event_id)`

The API stores a deterministic SHA-256 payload digest. Re-delivery of the same event identity with the same digest is idempotent. Reuse of the same event identity with different payload evidence is rejected as a replay conflict.

The existing webhook control plane provides `received`, `processing`, `processed`, `failed`, and `dead_letter` states with leases, retry timestamps, attempt counts, exponential retry delay, and a dead-letter terminal state. Browser roles cannot mutate the inbox; service-role access is limited and processing-state mutation occurs through backend-only RPCs.

Because Gate 04 intentionally has no downstream financial mutation, concurrent duplicate delivery cannot duplicate a capital-domain effect. Any future Stripe capital processor must preserve the claim ownership and idempotency guarantees before enabling financial transitions.

## Raw-body production route

Vercel routing now gives `/v1/webhooks/stripe` a dedicated serverless entrypoint before the generic API catch-all. The handler reads request bytes directly, limits the body to 1 MiB, and forwards the unchanged `Buffer` into signature verification. It never performs the generic application JSON parse before verification.

The signing secret remains server-only in:

`STRIPE_WEBHOOK_SECRET`

`STRIPE_SECRET_KEY` is not required to verify a webhook. Stripe webhook readiness therefore reflects the signing-secret configuration rather than requiring payment-creation credentials.

## Legacy Supabase authority containment

The repository contains `supabase/functions/stripe-webhook/index.ts` only as an anti-resurrection tombstone. It returns HTTP 410 `STRIPE_WEBHOOK_RETIRED` and contains no Stripe SDK, database client, environment-secret access, request parsing, provider call, or financial mutation.

The live production version 21 function must **not** be removed until the replacement API route is deployed to the canonical production runtime and proven fail-closed. Gate 04 intentionally prevents a gap in provider delivery authority during migration.

## Manual activation boundary

Do not register or repoint the Stripe Dashboard destination until production deployment of the new route is verified.

After deployment succeeds, the intended Stripe Dashboard destination is:

`https://api.neptlium.com/v1/webhooks/stripe`

Select only:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.updated`

Store the generated endpoint signing secret directly in the production `STRIPE_WEBHOOK_SECRET` environment variable. Never paste that value into chat, source, logs, or issue/PR text.

A real Stripe-signed test event is required before Gate 04 can be declared fully activated. Test delivery must prove one durable inbox event, idempotent retry behavior, no legacy transaction/portfolio mutation, and no capital availability change.

## Deployment evidence and remaining boundary

Vercel Git integration identified the API project as `neptlium-api`, project ID `prj_LNme3ui2AFDMf7wLdqVf9TDSJmbZ`, under the Neptliumforge team. Gate 04 API code commit `647495ecf4abb5e585f70faa7cedbe3adca726b4` produced a successful Vercel preview deployment; GitHub recorded `Vercel – neptlium-api` as `Deployment has completed` for deployment `ufLK3eceRwftkBniTRpgz9hfKELx`. The branch preview hostname is `neptlium-api-git-remediation-gate-04-strip-ff45c1-neptliumforge.vercel.app`.

This proves the Gate 04 API bundle can deploy in the real Vercel project, but it is **not** a production promotion. The draft PR remains unmerged, and no tool available in this execution provides a scoped branch-to-production promotion action. Therefore `https://api.neptlium.com/v1/webhooks/stripe` has not yet been certified as running Gate 04 code.

The legacy production Supabase `stripe-webhook` version 21 remains active and unchanged until the replacement is promoted and the canonical production URL is proven fail-closed. Stripe Dashboard registration/repointing must not occur before that production promotion. No Stripe signing secret was requested or exposed during this execution.
