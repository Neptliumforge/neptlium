import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { loadConfig, type Config } from './config.js';
import { ApiError } from './errors.js';
import { SupabaseFinancialOperations } from './financial-operations.js';
import { processStoredWebhook, SupabaseFencedWebhookStore } from './webhook-assurance.js';
import {
  verifyStripeWebhook,
} from './stripe-webhook.js';

type Fetch = typeof fetch;

export interface StripeIngressRequest {
  method: string;
  headers: Record<string, string | undefined>;
  rawBody: Buffer;
}

export interface StripeIngressResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const responseHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

function json(statusCode: number, data: unknown): StripeIngressResponse {
  return {
    statusCode,
    headers: responseHeaders,
    body: JSON.stringify(data),
  };
}

export async function executeStripeWebhook(
  request: StripeIngressRequest,
  dependencies: {
    config?: Config;
    fetch?: Fetch;
    now?: () => Date;
  } = {},
): Promise<StripeIngressResponse> {
  if (request.method.toUpperCase() !== 'POST')
    return json(405, {
      error: { code: 'method_not_allowed', message: 'POST required' },
    });

  if (request.rawBody.length > 1_048_576)
    return json(413, {
      error: { code: 'payload_too_large', message: 'Request body exceeds 1 MiB' },
    });

  try {
    const config = dependencies.config ?? loadConfig();
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY)
      throw new ApiError(
        503,
        'financial_storage_unavailable',
        'Durable webhook storage is not configured',
      );

    const now = dependencies.now?.() ?? new Date();
    const verified = verifyStripeWebhook({
      rawBody: request.rawBody,
      signatureHeader: request.headers['stripe-signature'],
      endpointSecret: config.STRIPE_WEBHOOK_SECRET,
      toleranceSeconds: config.WEBHOOK_TOLERANCE_SECONDS,
      nowSeconds: Math.floor(now.getTime() / 1000),
    });

    if (!config.STRIPE_WEBHOOK_ENVIRONMENT || verified.environment !== config.STRIPE_WEBHOOK_ENVIRONMENT)
      throw new ApiError(503, 'provider_environment_mismatch', 'Stripe webhook environment is not bound');

    const operations = new SupabaseFinancialOperations(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY,
      dependencies.fetch,
    );
    const digestHex = createHash('sha256').update(request.rawBody).digest('hex');

    const insertion = await operations.recordWebhook({
      provider: 'stripe',
      environment: verified.environment,
      providerEventId: verified.id,
      payloadDigest: digestHex,
      payload: verified.payload,
      signatureVerifiedAt: now.toISOString(),
    });

    const outcome = await processStoredWebhook(
      new SupabaseFencedWebhookStore(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, dependencies.fetch),
      { provider: 'stripe', environment: verified.environment, providerEventId: verified.id },
    );
    if (outcome === 'deferred') return json(503, { received: true, action: 'deferred', retryable: true });
    return json(outcome === 'duplicate' || insertion === 'duplicate' ? 200 : 202, {
      received: true, duplicate: outcome === 'duplicate' || insertion === 'duplicate', action: outcome,
    });
  } catch (error) {
    const safe =
      error instanceof ApiError
        ? error
        : new ApiError(500, 'internal_error', 'An unexpected error occurred');
    return json(safe.status, {
      error: { code: safe.code, message: safe.message },
    });
  }
}

export async function stripeServerlessHandler(req: IncomingMessage, res: ServerResponse) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_048_576) {
      const response = json(413, {
        error: { code: 'payload_too_large', message: 'Request body exceeds 1 MiB' },
      });
      res.writeHead(response.statusCode, response.headers);
      res.end(response.body);
      return;
    }
    chunks.push(buffer);
  }

  const headers = Object.fromEntries(
    Object.entries(req.headers).flatMap(([key, value]) =>
      typeof value === 'string' ? [[key.toLowerCase(), value]] : [],
    ),
  ) as Record<string, string>;

  const response = await executeStripeWebhook({
    method: req.method ?? 'GET',
    headers,
    rawBody: Buffer.concat(chunks),
  });
  res.writeHead(response.statusCode, response.headers);
  res.end(response.body);
}
