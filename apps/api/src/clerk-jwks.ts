const CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_KEYS = 32;
const BASE64URL = /^[A-Za-z0-9_-]+$/;

type SigningKeys = Readonly<Record<string, JsonWebKey>>;

async function readJwks(response: Response): Promise<unknown> {
  if (!response.ok || !response.body) throw new Error('Clerk JWKS unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let json = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(json + decoder.decode()) as unknown;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) throw new Error('Clerk JWKS response too large');
      json += decoder.decode(value, { stream: true });
    }
  } catch (error) {
    void reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

function signingKeys(document: unknown): SigningKeys {
  const entries = (document as { keys?: unknown } | null)?.keys;
  if (!Array.isArray(entries) || entries.length > MAX_KEYS) throw new Error('Invalid Clerk JWKS');
  const keys: Record<string, JsonWebKey> = Object.create(null);
  for (const entry of entries) {
    if (!entry || entry.kty !== 'RSA' || entry.alg !== 'RS256' || entry.use !== 'sig') continue;
    const { kid, n, e } = entry;
    if (typeof kid !== 'string' || !kid || kid.length > 128 || Object.hasOwn(keys, kid) ||
        typeof n !== 'string' || !BASE64URL.test(n) || typeof e !== 'string' || !BASE64URL.test(e)) {
      throw new Error('Invalid Clerk signing key');
    }
    keys[kid] = Object.freeze({ kty: 'RSA', alg: 'RS256', use: 'sig', n, e });
  }
  if (Object.keys(keys).length === 0) throw new Error('Clerk JWKS contains no signing keys');
  return Object.freeze(keys);
}

/** Use a server-configured Clerk issuer. Token claims never select the endpoint. */
export function createClerkSigningKeyLoader(
  issuer: string,
  request: typeof fetch = fetch,
  now: () => number = Date.now,
): () => Promise<SigningKeys> {
  const origin = new URL(issuer);
  if (origin.protocol !== 'https:' || origin.origin !== issuer) throw new Error('Invalid Clerk issuer origin');
  const endpoint = new URL('/.well-known/jwks.json', origin);

  let cached: { keys: SigningKeys; expiresAt: number } | undefined;
  let pending: Promise<SigningKeys> | undefined;

  async function refresh(): Promise<SigningKeys> {
    const response = await request(endpoint, {
      redirect: 'error',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const keys = signingKeys(await readJwks(response));
    cached = { keys, expiresAt: now() + CACHE_TTL_MS };
    return keys;
  }

  return async () => {
    if (cached && now() < cached.expiresAt) return cached.keys;
    pending ??= refresh().finally(() => { pending = undefined; });
    return pending;
  };
}
