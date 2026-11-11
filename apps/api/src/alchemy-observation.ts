import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';

export type AlchemyEnvironment = 'testnet' | 'production';
export const alchemyNetwork = (environment: AlchemyEnvironment) => environment === 'production' ? 'BASE_MAINNET' : 'BASE_SEPOLIA';

export function verifyAlchemyWebhook(input: { rawBody: Buffer; signatureHeader: string | undefined; signingKey: string | undefined }) {
  if (!input.signingKey || !input.signatureHeader || !/^[a-f0-9]{64}$/i.test(input.signatureHeader)) throw new ApiError(401, 'invalid_webhook', 'Alchemy webhook authentication is required');
  const expected = createHmac('sha256', input.signingKey).update(input.rawBody).digest();
  const supplied = Buffer.from(input.signatureHeader, 'hex');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new ApiError(401, 'invalid_webhook', 'Invalid Alchemy webhook signature');
}

export function validateAlchemyEnvelope(value: unknown, binding: { webhookId: string | undefined; environment: AlchemyEnvironment }) {
  if (!binding.webhookId) throw new ApiError(503, 'provider_not_configured', 'Alchemy webhook identity is not configured');
  const payload = value as Record<string, unknown> | null;
  const event = payload?.event as Record<string, unknown> | undefined;
  if (!payload || Array.isArray(payload) || payload.webhookId !== binding.webhookId ||
      payload.type !== 'ADDRESS_ACTIVITY' || typeof payload.id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,200}$/.test(payload.id) || typeof payload.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(payload.createdAt)) || !event ||
      event.network !== alchemyNetwork(binding.environment) || !Array.isArray(event.activity))
    throw new ApiError(422, 'invalid_webhook', 'Alchemy event does not match its configured observation contract');
  return payload as Record<string, unknown> & { id: string };
}

/** Alchemy data is provider evidence only. This module intentionally exposes no canonical-ledger mutation. */
export function alchemyObservation<T extends Record<string, unknown>>(environment: AlchemyEnvironment, payload: T) {
  return { source: 'ALCHEMY' as const, environment: environment === 'production' ? 'LIVE' as const : 'TEST' as const, network: alchemyNetwork(environment), canonical: false as const, payload };
}
