import { createPublicKey, verify as verifySignature, type JsonWebKey } from 'node:crypto';

/**
 * Independent, offline RS256 JWT verification for the preview API.
 * Caller MUST additionally resolve the verified subject to an active principal.
 * This function is not wired into production authentication.
 */
export interface ClerkJwtTrust {
  readonly issuer: string;
  readonly audience: string;
  readonly authorizedParties: readonly string[];
  readonly keys: Readonly<Record<string, JsonWebKey>>;
  readonly nowSeconds?: number;
}

export type ClerkJwtVerification =
  | { readonly valid: true; readonly subject: string }
  | { readonly valid: false };

function decodePart(part: string): unknown {
  if (!/^[A-Za-z0-9_-]+$/.test(part)) throw new Error('invalid base64url');
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as unknown;
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exactAudience(value: unknown, expected: string): boolean {
  return typeof value === 'string'
    ? value === expected
    : Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string') && value.includes(expected);
}

/**
 * Fail closed on malformed tokens, untrusted keys, unsupported algorithms,
 * missing claims, invalid signatures and time constraints.
 * Key rotation must be managed by a separate trusted JWKS refresh mechanism.
 */
export function verifyClerkJwtRs256(
  token: string,
  trust: ClerkJwtTrust,
): ClerkJwtVerification {
  const denied: ClerkJwtVerification = { valid: false };
  if (!trust.issuer.startsWith('https://') || !trust.audience ||
      !Number.isFinite(trust.nowSeconds ?? Math.floor(Date.now() / 1000)) ||
      !Array.isArray(trust.authorizedParties) || trust.authorizedParties.length === 0 ||
      trust.authorizedParties.some((origin) => { try { const url = new URL(origin); return url.origin !== origin || url.protocol !== 'https:'; } catch { return true; } }) ||
      token.length > 16384) return denied;
  const segments = token.split('.');
  if (segments.length !== 3 || segments.some((part) => !part)) return denied;
  try {
    const header = decodePart(segments[0]!);
    const claims = decodePart(segments[1]!);
    if (!object(header) || !object(claims)) return denied;
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
        header.typ !== 'JWT') return denied;
    const key = trust.keys[header.kid];
    if (!key || key.kty !== 'RSA' || key.alg !== 'RS256' || key.use !== 'sig') return denied;
    const now = trust.nowSeconds ?? Math.floor(Date.now() / 1000);
    if (claims.iss !== trust.issuer ||
        !exactAudience(claims.aud, trust.audience) ||
        typeof claims.azp !== 'string' || !trust.authorizedParties.includes(claims.azp) ||
        typeof claims.sub !== 'string' ||
        !/^user_[A-Za-z0-9]{8,128}$/.test(claims.sub) ||
        typeof claims.exp !== 'number' || !Number.isSafeInteger(claims.exp) || now >= claims.exp ||
        typeof claims.nbf !== 'number' || !Number.isSafeInteger(claims.nbf) || now < claims.nbf ||
        typeof claims.iat !== 'number' || !Number.isSafeInteger(claims.iat) || claims.iat > now) return denied;
    const publicKey = createPublicKey({ key, format: 'jwk' });
    const signature = Buffer.from(segments[2]!, 'base64url');
    if (!verifySignature('RSA-SHA256', Buffer.from(segments[0] + '.' + segments[1]), publicKey, signature)) return denied;
    return { valid: true, subject: claims.sub };
  } catch {
    return denied;
  }
}
