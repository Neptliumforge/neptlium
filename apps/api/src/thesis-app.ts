import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { buildApp, type Dependencies, type Injection, type InjectionResponse } from './app.js';
import { loadConfig } from './config.js';
import { ApiError } from './errors.js';
import { createPrincipalAuthenticator } from './authentication.js';
import { SupabaseIdentityPrincipalResolver } from './identity-principal.js';
import { MemoryRateLimiter } from './security.js';
import { handleThesisRoute } from './thesis-routes.js';
import { MemoryThesisRepository, SupabaseThesisRepository, type ThesisRepository } from './thesis-repository.js';

export interface ThesisAppDependencies extends Dependencies {
  thesisRepository?: ThesisRepository;
}

const headersBase = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
};

export async function buildThesisApp(deps: ThesisAppDependencies = {}) {
  const config = deps.config ?? loadConfig();
  const base = await buildApp(deps);
  const thesisRepository = deps.thesisRepository ?? (
    config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
      ? new SupabaseThesisRepository(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
      : new MemoryThesisRepository()
  );
  if (config.NODE_ENV === 'production' && thesisRepository instanceof MemoryThesisRepository)
    throw new Error('MemoryThesisRepository cannot be used in production');

  const identityResolver = config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
    ? new SupabaseIdentityPrincipalResolver(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    : undefined;
  const authenticate = deps.authenticate ?? createPrincipalAuthenticator(config, identityResolver);
  const limiter = deps.rateLimiter ?? new MemoryRateLimiter();

  async function execute(input: Injection): Promise<InjectionResponse> {
    const target = new URL(input.url, 'http://localhost');
    if (!target.pathname.startsWith('/v1/theses') && !target.pathname.startsWith('/v1/entities/'))
      return base.inject(input);

    const normalizedHeaders = Object.fromEntries(Object.entries(input.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
    const requestId = normalizedHeaders['x-request-id'] && /^[A-Za-z0-9._:-]{1,128}$/.test(normalizedHeaders['x-request-id']) ? normalizedHeaders['x-request-id'] : randomUUID();
    const responseHeaders = { ...headersBase, 'x-request-id': requestId };
    try {
      if (normalizedHeaders.origin && !config.allowedOrigins.includes(normalizedHeaders.origin))
        throw new ApiError(403, 'forbidden', 'Origin is not allowed');
      const method = input.method.toUpperCase();
      await limiter.consume(`${input.clientAddress ?? 'local'}:${method === 'GET' ? 'read' : 'write'}`, method === 'GET' ? 120 : 30, 60_000);
      const authorization = normalizedHeaders.authorization;
      if (!authorization?.startsWith('Bearer ')) throw new ApiError(401, 'authentication_required', 'A valid bearer token is required');
      const principal = await authenticate(authorization.slice(7));
      if (!principal) throw new ApiError(401, 'authentication_required', 'A valid bearer token is required');
      let body: unknown;
      if (input.payload !== undefined) {
        const raw = typeof input.payload === 'string' ? input.payload : JSON.stringify(input.payload);
        if (Buffer.byteLength(raw) > 1_048_576) throw new ApiError(413, 'payload_too_large', 'Request body exceeds 1 MiB');
        try { body = raw.length ? JSON.parse(raw) : undefined; } catch { throw new ApiError(422, 'validation_failed', 'Malformed JSON'); }
      }
      const result = await handleThesisRoute({ method, path: target.pathname, query: target.searchParams, body }, { repository: thesisRepository, principal: async () => ({ id: principal.id }) });
      if (!result) throw new ApiError(404, 'not_found', 'Route not found');
      const responseBody = JSON.stringify(result.data);
      return { statusCode: result.status ?? 200, headers: responseHeaders, body: responseBody, json: () => JSON.parse(responseBody) };
    } catch (error) {
      const safe = error instanceof ApiError ? error : new ApiError(500, 'internal_error', 'An unexpected error occurred');
      const responseBody = JSON.stringify({ error: { code: safe.code, message: safe.message, ...(safe.details === undefined ? {} : { details: safe.details }) }, request_id: requestId });
      return { statusCode: safe.status, headers: responseHeaders, body: responseBody, json: () => JSON.parse(responseBody) };
    }
  }

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = []; let received = 0;
    for await (const chunk of req) {
      const buffer = Buffer.from(chunk); received += buffer.length;
      if (received > 1_048_576) { res.writeHead(413, headersBase); res.end(JSON.stringify({ error: { code: 'payload_too_large', message: 'Request body exceeds 1 MiB' } })); return; }
      chunks.push(buffer);
    }
    const response = await execute({ method: req.method ?? 'GET', url: req.url ?? '/', headers: Object.fromEntries(Object.entries(req.headers).filter(([, value]) => typeof value === 'string')) as Record<string, string>, payload: Buffer.concat(chunks).toString() || undefined, clientAddress: req.socket?.remoteAddress ?? 'unknown' });
    res.writeHead(response.statusCode, response.headers); res.end(response.body);
  });

  return {
    server,
    inject: execute,
    listen: (options: { host: string; port: number }) => new Promise<void>((resolve) => server.listen(options.port, options.host, resolve)),
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
