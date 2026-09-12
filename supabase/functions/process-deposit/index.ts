// Gate 03 retirement guard: keep this legacy function absent from production.
// It must never regain deposit or financial authority. Funding requires governed
// API ingress, settlement evidence, canonical ledger and reconciliation.
// Reject every request without reading its identity, headers or body.
Deno.serve(
  () =>
    new Response(
      JSON.stringify({
        error: 'DEPOSIT_ENDPOINT_RETIRED',
        message:
          'This legacy deposit endpoint is retired. Deposits are unavailable through this endpoint.',
      }),
      { status: 410, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    ),
);
