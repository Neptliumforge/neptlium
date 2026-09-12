Gate 04 replaces the unsafe legacy Stripe webhook authority with a dedicated raw-body API ingress at `https://api.neptlium.com/v1/webhooks/stripe`.

The new route verifies `Stripe-Signature` before JSON parsing, persists verified events into `provider_webhook_inbox`, uses the existing claim/complete/fail control plane, and deliberately has no capital-settlement/ledger authority because Stripe capital funding remains a TARGET capability in current product documentation. Payment-mode Checkout completion is explicitly ignored as `stripe_capital_funding_not_enabled`.

The legacy Supabase function remains live until the replacement API production deployment is verified; the repository adds only a 410 anti-resurrection tombstone. Do not repoint Stripe Dashboard yet. Production Vercel project visibility is still being resolved.
