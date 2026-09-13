// RETIRED — legacy portfolio mutation authority.
// Canonical portfolio/allocation state belongs to governed API + ledger/evidence flows.
// This tombstone must never contain service-role, provider, portfolio, holding, or ledger mutation logic.

Deno.serve(() =>
  new Response(
    JSON.stringify({
      error: 'ALLOCATE_PORTFOLIO_RETIRED',
      message: 'This legacy portfolio allocation endpoint is retired.',
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
