import { ApiError } from './errors.js';

type Fetch = typeof fetch;
type Provider = 'stripe' | 'circle' | 'alchemy';
type Environment = 'test' | 'live';

export async function completeWebhookWithDisposition(input: {
  supabaseUrl: string;
  serviceRoleKey: string;
  provider: Provider;
  environment: Environment;
  providerEventId: string;
  action: string;
  reason?: string;
  request?: Fetch;
}) {
  const request = input.request ?? fetch;
  const response = await request(
    `${input.supabaseUrl}/rest/v1/rpc/complete_provider_webhook_with_disposition`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${input.serviceRoleKey}`,
        apikey: input.serviceRoleKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        p_provider: input.provider,
        p_environment: input.environment,
        p_provider_event_id: input.providerEventId,
        p_disposition_action: input.action,
        p_disposition_reason: input.reason ?? null,
      }),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok)
    throw new ApiError(
      503,
      'canonical_operation_failed',
      'Canonical webhook disposition completion failed',
    );

  return (await response.json()) as Record<string, unknown>;
}
