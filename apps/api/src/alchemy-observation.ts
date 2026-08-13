import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';

export type AlchemyEnvironment = 'testnet' | 'production';
export const alchemyNetwork = (environment: AlchemyEnvironment) => environment === 'production' ? 'BASE_MAINNET' : 'BASE_SEPOLIA';

export function verifyAlchemyWebhook(input: { rawBody: Buffer; signatureHeader: string | undefined; signingKey: string | undefined }) {
  if (!input.signingKey || !input.signatureHeader) throw new ApiError(401, 'invalid_webhook', 'Alchemy webhook authentication is required');
  const expected = createHmac('sha256', input.signingKey).update(input.rawBody).digest();
  const supplied = Buffer.from(input.signatureHeader, 'hex');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new ApiError(401, 'invalid_webhook', 'Invalid Alchemy webhook signature');
}

/** Alchemy data is provider evidence only. This module intentionally exposes no canonical-ledger mutation. */
export function alchemyObservation<T extends Record<string, unknown>>(environment: AlchemyEnvironment, payload: T) {
  return { source: 'ALCHEMY' as const, environment: environment === 'production' ? 'LIVE' as const : 'TEST' as const, network: alchemyNetwork(environment), canonical: false as const, payload };
}
