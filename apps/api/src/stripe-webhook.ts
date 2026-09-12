import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';
import type {
  StripeSubscriptionCommand,
  StripeSubscriptionStatus,
} from './stripe-subscription.js';

export interface VerifiedStripeEvent {
  id: string;
  type: string;
  environment: 'test' | 'live';
  payload: Record<string, unknown>;
}

export const STRIPE_INGRESS_EVENT_TYPES = [
  'checkout.session.completed',
  'invoice.paid',
  'customer.subscription.updated',
] as const;

export type StripeIngressDisposition =
  | {
      action: 'subscription_update';
      reason: 'supported_subscription_event';
      command: StripeSubscriptionCommand;
    }
  | {
      action: 'ignored';
      reason:
        | 'stripe_capital_funding_not_enabled'
        | 'unsupported_event_type'
        | 'unsupported_subscription_state';
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

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function metadata(object: Record<string, unknown> | undefined) {
  const value = object?.metadata;
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function idFromExpandable(value: unknown) {
  if (typeof value === 'string' && value) return value;
  if (value && typeof value === 'object' && !Array.isArray(value))
    return text((value as Record<string, unknown>).id);
  return undefined;
}

function paidPlan(value: unknown): 'pro' | 'elite' | undefined {
  return value === 'pro' || value === 'elite' ? value : undefined;
}

function subscriptionStatus(value: unknown): StripeSubscriptionStatus | undefined {
  return value === 'active' ||
    value === 'canceled' ||
    value === 'past_due' ||
    value === 'trialing' ||
    value === 'incomplete'
    ? value
    : undefined;
}

function requireField(value: string | undefined, name: string) {
  if (!value)
    throw new ApiError(
      422,
      'invalid_webhook',
      `Stripe subscription event is missing ${name}`,
    );
  return value;
}

export function stripeIngressDisposition(event: VerifiedStripeEvent): StripeIngressDisposition {
  const object = eventObject(event);

  if (event.type === 'checkout.session.completed') {
    if (object?.mode !== 'subscription') {
      return { action: 'ignored', reason: 'stripe_capital_funding_not_enabled' };
    }

    const meta = metadata(object);
    const plan = paidPlan(meta?.plan);
    if (!plan)
      throw new ApiError(
        422,
        'invalid_webhook',
        'Stripe subscription Checkout has an invalid or missing plan',
      );

    return {
      action: 'subscription_update',
      reason: 'supported_subscription_event',
      command: {
        kind: 'activate_checkout',
        userId: requireField(text(meta?.user_id), 'metadata.user_id'),
        plan,
        customerId: requireField(idFromExpandable(object.customer), 'customer'),
        subscriptionId: requireField(
          idFromExpandable(object.subscription),
          'subscription',
        ),
      },
    };
  }

  if (event.type === 'invoice.paid') {
    return {
      action: 'subscription_update',
      reason: 'supported_subscription_event',
      command: {
        kind: 'renew_customer',
        customerId: requireField(idFromExpandable(object?.customer), 'customer'),
      },
    };
  }

  if (event.type === 'customer.subscription.updated') {
    const status = subscriptionStatus(object?.status);
    if (!status) {
      return { action: 'ignored', reason: 'unsupported_subscription_state' };
    }
    const meta = metadata(object);
    return {
      action: 'subscription_update',
      reason: 'supported_subscription_event',
      command: {
        kind: 'sync_subscription',
        customerId: requireField(idFromExpandable(object?.customer), 'customer'),
        subscriptionId: requireField(text(object?.id), 'subscription id'),
        userId: text(meta?.user_id),
        plan: paidPlan(meta?.plan),
        status,
      },
    };
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
