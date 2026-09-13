// RETIRED — legacy synthetic-yield financial mutation authority.
// Portfolio value may only change through governed canonical financial state.
// This tombstone must never contain service-role, portfolio, yield, ledger, or settlement mutation logic.

Deno.serve(() =>
  new Response(
    JSON.stringify({
      error: 'CALCULATE_YIELD_RETIRED',
      message: 'This legacy synthetic yield endpoint is retired.',
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
