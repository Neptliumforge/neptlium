// RETIRED — Gate 01. This compatibility endpoint must never regain financial
// authority. Do not add clients, secrets, financial reads/writes, provider calls,
// request parsing, or delegation. Future withdrawals belong to the governed API.
// Keep the tombstone in source control to prevent accidental legacy redeployment.
Deno.serve(
  () =>
    new Response(
      JSON.stringify({
        error: 'WITHDRAWAL_ENDPOINT_RETIRED',
        message:
          'This withdrawal endpoint is retired. Withdrawals are unavailable through this endpoint.',
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
