// Gate 02 retirement guard. This legacy placeholder must never regain provider
// or financial authority. Keep it absent from production; governed provider
// ingress belongs to the Neptlium API and its reviewed event architecture.
// If explicitly deployed in error, reject every request without reading it.
Deno.serve(
  () =>
    new Response(
      JSON.stringify({
        error: 'CRYPTO_WEBHOOK_RETIRED',
        message:
          'This legacy webhook endpoint is retired. Provider events must use governed provider ingress.',
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
