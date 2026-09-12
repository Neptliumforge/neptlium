import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';

export interface VerifiedStripeEvent {
  id: string;
  type: string;
  environment: 'test' | 'live';
  payload: Record<string, unknown>;
}

/**
 * Gate 04 deliberately keeps Stripe at an evidence-only boundary.
 * Current product authority does not include Stripe capital funding, so none of
 * these events may create settlement evidence, post ledger entries, or make
 * customer capital available. They are the minimum legacy subscription events
 * worth retaining as durable, verified provider evidence during remediation.
 */
export const STRIPE_INGRESS_EVENT_TYPES = [
  'checkout.session.completed',
  'invoice.paid',
  'customer.subscription.updated',
] as const;

export type StripeIngressDisposition =
  | { action: 'subscription_evidence'; reason: 'supported_subscription_event' }
  | {
      action: 'ignored';
      reason: 'stripe_capital_funding_not_enabled' | 'unsupported_event_type';
    };

function equalHex(a: string, b: string) {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

function eventObject(event: VerifiedStripeEvent): Record<string, unknown> | undefined {
  const data = event.payload.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined;
  const object = (data as Record<string, unknown>).object;
  return object && typeof object === 'object' && !Array.isArray(object)
    ? (object as Record<string, unknown>)
    : undefined;
}

export function stripeIngressDisposition(event: VerifiedStripeEvent): StripeIngressDisposition {
  if (event.type === 'checkout.session.completed') {
    const mode = eventObject(event)?.mode;
    if (mode !== 'subscription') {
      return { action: 'ignored', reason: 'stripe_capital_funding_not_enabled' };
    }
    return { action: 'subscription_evidence', reason: 'supported_subscription_event' };
  }

  if (
    event.type === 'invoice.paid' ||
    event.type === 'customer.subscription.updated'
  ) {
    return { action: 'subscription_evidence', reason: 'supported_subscription_event' };
  }

  return { action: 'ignored', reason: 'unsupported_event_type' };
}

export function verifyStripeWebhook(input: {
  rawBody: Buffer;
  signatureHeader: string | undefined;
  endpointSecret: string | undefined;
  toleranceSeconds: number;
  nowSeconds?: number;
}): VerifiedStripeEvent {
  if (!input.endpointSecret)
    throw new ApiError(
      503,
      'provider_not_configured',
      'Stripe webhook verification is not configured',
    );
  if (!input.signatureHeader)
    throw new ApiError(401, 'invalid_webhook', 'Missing Stripe-Signature header');

  const components = input.signatureHeader.split(',').map((part) => part.trim());
  const timestamp = components.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = components
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp))
    throw new ApiError(401, 'invalid_webhook', 'Malformed Stripe-Signature header');

  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const signedAt = Number(timestamp);
  if (
    !Number.isSafeInteger(signedAt) ||
    Math.abs(now - signedAt) > input.toleranceSeconds
  )
    throw new ApiError(
      401,
      'invalid_webhook',
      'Stripe webhook timestamp is outside tolerance',
    );

  const signedPayload = Buffer.concat([
    Buffer.from(`${timestamp}.`, 'utf8'),
    input.rawBody,
  ]);
  const expected = createHmac('sha256', input.endpointSecret)
    .update(signedPayload)
    .digest('hex');
  if (!signatures.some((candidate) => equalHex(candidate, expected)))
    throw new ApiError(
      401,
      'invalid_webhook',
      'Stripe webhook signature verification failed',
    );

  let payload: unknown;
  try {
    payload = JSON.parse(input.rawBody.toString('utf8'));
  } catch {
    throw new ApiError(422, 'invalid_webhook', 'Stripe webhook payload is not valid JSON');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new ApiError(422, 'invalid_webhook', 'Stripe webhook payload is invalid');
  const event = payload as Record<string, unknown>;
  if (
    typeof event.id !== 'string' ||
    typeof event.type !== 'string' ||
    typeof event.livemode !== 'boolean'
  )
    throw new ApiError(
      422,
      'invalid_webhook',
      'Stripe webhook event identity is incomplete',
    );
  return {
    id: event.id,
    type: event.type,
    environment: event.livemode ? 'live' : 'test',
    payload: event,
  };
}
