// RETIRED — legacy Supabase Stripe webhook authority.
// Production Stripe callbacks belong at https://api.neptlium.com/v1/webhooks/stripe.
// This guard must never contain provider, database, ledger, or financial mutation logic.

Deno.serve(() =>
  new Response(
    JSON.stringify({
      error: 'STRIPE_WEBHOOK_RETIRED',
      message: 'This legacy Stripe webhook endpoint is retired.',
    }),
    {
      status: 410,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  ),
);
