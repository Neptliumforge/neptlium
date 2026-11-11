import { createPublicKey, verify, type KeyObject } from 'node:crypto';
import { ApiError } from './errors.js';
import type { ProviderRuntimeEnvironment } from './config.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const invalid = () => new ApiError(401, 'invalid_webhook', 'Circle webhook verification failed');

/** Wallets v2 only. No caller-supplied URL, redirect, signing secret or financial authority. */
export class CirclePublicKeys {
  private readonly cache = new Map<string, { key: KeyObject; expires: number }>();
  constructor(
    readonly environment: ProviderRuntimeEnvironment,
    private readonly apiKey: string,
    private readonly request: typeof fetch = fetch,
  ) {}
  async get(id: string): Promise<KeyObject> {
    if (!uuid.test(id) || !this.apiKey) throw invalid();
    const cached = this.cache.get(id);
    if (cached && cached.expires > Date.now()) return cached.key;
    // Circle Wallets uses this origin for both environments; API credentials bind the environment.
    const response = await this.request(`https://api.circle.com/v2/notifications/publicKey/${id}`, {
      headers: { authorization: `Bearer ${this.apiKey}` },
      redirect: 'error',
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok)
      throw new ApiError(503, 'provider_unavailable', 'Circle verification key is unavailable');
    if (!response.body) throw invalid();
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.length;
      if (size > 16_384) {
        await reader.cancel();
        throw invalid();
      }
      chunks.push(chunk.value);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    const { data } = JSON.parse(text) as {
      data?: { id?: string; algorithm?: string; publicKey?: string };
    };
    if (
      data?.id !== id ||
      data.algorithm !== 'ECDSA_SHA_256' ||
      !data.publicKey ||
      data.publicKey.length > 4096
    )
      throw invalid();
    let key: KeyObject;
    try {
      key = createPublicKey({
        key: Buffer.from(data.publicKey, 'base64'),
        format: 'der',
        type: 'spki',
      });
    } catch {
      throw invalid();
    }
    if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1')
      throw invalid();
    if (this.cache.size >= 32) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(id, { key, expires: Date.now() + 3_600_000 });
    return key;
  }
}

export async function verifyCircleWebhook(input: {
  rawBody: Buffer;
  signature: string | undefined;
  keyId: string | undefined;
  keys: CirclePublicKeys;
  subscriptionId: string | undefined;
  environment: ProviderRuntimeEnvironment;
}) {
  if (
    !input.signature ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(input.signature) ||
    input.signature.length > 256 ||
    !input.keyId ||
    !uuid.test(input.keyId) ||
    !input.subscriptionId ||
    input.keys.environment !== input.environment
  )
    throw invalid();
  const bytes = Buffer.from(input.signature, 'base64');
  if (bytes.toString('base64') !== input.signature) throw invalid();
  const key = await input.keys.get(input.keyId);
  if (!verify('sha256', input.rawBody, key, bytes)) throw invalid();
  let value: Record<string, unknown>;
  try {
    value = JSON.parse(input.rawBody.toString('utf8')) as Record<string, unknown>;
  } catch {
    throw invalid();
  }
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    value.version !== 2 ||
    value.subscriptionId !== input.subscriptionId ||
    typeof value.notificationId !== 'string' ||
    !uuid.test(value.notificationId) ||
    typeof value.notificationType !== 'string' ||
    !['transactions.inbound', 'transactions.outbound'].includes(value.notificationType) ||
    typeof value.timestamp !== 'string' ||
    !Number.isFinite(Date.parse(value.timestamp)) ||
    !value.notification ||
    typeof value.notification !== 'object' ||
    Array.isArray(value.notification)
  )
    throw invalid();
  return value as Record<string, unknown> & { notificationId: string };
}
