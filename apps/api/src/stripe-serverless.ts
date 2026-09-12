import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadConfig, type Config } from './config.js';
import { ApiError } from './errors.js';
import { SupabaseFinancialOperations } from './financial-operations.js';
import {
  stripeIngressDisposition,
  verifyStripeWebhook,
  type StripeIngressDisposition,
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

function processingState(value: Record<string, unknown>) {
  return typeof value.processing_state === 'string' ? value.processing_state : undefined;
}

function stableProcessingError(error: unknown) {
  if (error instanceof ApiError) return error.code.slice(0, 120);
  return 'stripe_webhook_processing_failed';
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
    return json(405, { error: { code: 'method_not_allowed', message: 'POST required' } });

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

    const verified = verifyStripeWebhook({
      rawBody: request.rawBody,
      signatureHeader: request.headers['stripe-signature'],
      endpointSecret: config.STRIPE_WEBHOOK_SECRET,
      toleranceSeconds: config.WEBHOOK_TOLERANCE_SECONDS,
    });

    const operations = new SupabaseFinancialOperations(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY,
      dependencies.fetch,
    );
    const payloadDigest = await crypto.subtle.digest('SHA-256', request.rawBody);
    const digestHex = Buffer.from(payloadDigest).toString('hex');
    const now = dependencies.now?.() ?? new Date();

    const insertion = await operations.recordWebhook({
      provider: 'stripe',
      environment: verified.environment,
      providerEventId: verified.id,
      payloadDigest: digestHex,
      payload: verified.payload,
      signatureVerifiedAt: now.toISOString(),
    });

    const claimed = await operations.claimWebhook(
      'stripe',
      verified.environment,
      verified.id,
      60,
    );

    const state = processingState(claimed);
    if (state === 'processed' || state === 'dead_letter') {
      return json(200, {
        received: true,
        duplicate: true,
        action: state === 'processed' ? 'already_processed' : 'dead_letter',
      });
    }

    if (state !== 'processing') {
      return json(200, {
        received: true,
        duplicate: insertion === 'duplicate',
        action: 'deferred',
      });
    }

    let disposition: StripeIngressDisposition;
    try {
      disposition = stripeIngressDisposition(verified);

      // Gate 04 is deliberately evidence-only. Stripe capital funding is not an
      // approved live capability, so no event from this boundary may create
      // settlement evidence, post ledger entries, mutate legacy balances, or
      // make customer funds available. Future funding processing must be added
      // only with a separately reviewed payment/funding contract.

      await operations.completeWebhook('stripe', verified.environment, verified.id);
    } catch (error) {
      await operations.failWebhook(
        'stripe',
        verified.environment,
        verified.id,
        stableProcessingError(error),
        8,
      );
      throw error;
    }

    return json(insertion === 'duplicate' ? 200 : 202, {
      received: true,
      duplicate: insertion === 'duplicate',
      action: disposition.action,
      reason: disposition.reason,
    });
  } catch (error) {
    const safe =
      error instanceof ApiError
        ? error
        : new ApiError(500, 'internal_error', 'An unexpected error occurred');
    return json(safe.status, { error: { code: safe.code, message: safe.message } });
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
