import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadConfig } from './config.js';

type SafeUser = { id?: string };

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 32_768) throw new Error('body_too_large');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function send(
  res: ServerResponse,
  status: number,
  body: unknown,
  requestId: string,
  origin?: string,
) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'x-request-id': requestId,
    ...(origin ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {}),
  });
  res.end(status === 204 ? '' : JSON.stringify(body));
}

export async function serverlessHandler(req: IncomingMessage, res: ServerResponse) {
  const requestId =
    typeof req.headers['x-request-id'] === 'string' &&
    /^[\w.:-]{1,128}$/.test(req.headers['x-request-id'])
      ? req.headers['x-request-id']
      : randomUUID();
  const config = loadConfig();
  const requestOrigin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const allowedOrigin =
    requestOrigin && config.allowedOrigins.includes(requestOrigin) ? requestOrigin : undefined;
  if (requestOrigin && !allowedOrigin)
    return send(
      res,
      403,
      {
        error: { code: 'origin_not_allowed', message: 'Origin is not allowed' },
        request_id: requestId,
      },
      requestId,
    );
  if (req.method === 'OPTIONS') {
    res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    res.setHeader('access-control-allow-headers', 'Authorization,Content-Type,X-Request-Id');
    return send(res, 204, {}, requestId, allowedOrigin);
  }
  const path = new URL(req.url ?? '/', 'http://api.internal').pathname;
  if (req.method === 'GET' && (path === '/health' || path === '/v1/health'))
    return send(res, 200, { status: 'ok', service: 'neptlium-api' }, requestId, allowedOrigin);
  if (req.method === 'GET' && path === '/v1/status')
    return send(
      res,
      config.databaseConfigured ? 200 : 503,
      { status: config.databaseConfigured ? 'ready' : 'not_ready', mainnet: false },
      requestId,
      allowedOrigin,
    );
  const isProvisioning = req.method === 'POST' && path === '/v1/account/provision';
  const isOnboarding = req.method === 'POST' && path === '/v1/account/onboarding';
  if (!isProvisioning && !isOnboarding)
    return send(
      res,
      404,
      { error: { code: 'not_found', message: 'Route not found' }, request_id: requestId },
      requestId,
      allowedOrigin,
    );

  const authorization = req.headers.authorization;
  const match = typeof authorization === 'string' ? /^Bearer ([^\s]+)$/.exec(authorization) : null;
  if (!match?.[1])
    return send(
      res,
      401,
      {
        error: { code: 'authentication_required', message: 'A valid bearer token is required' },
        request_id: requestId,
      },
      requestId,
      allowedOrigin,
    );
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || !config.SUPABASE_SERVICE_ROLE_KEY)
    return send(
      res,
      503,
      {
        error: { code: 'provisioning_unavailable', message: 'Account provisioning is unavailable' },
        request_id: requestId,
      },
      requestId,
      allowedOrigin,
    );
  try {
    const userResponse = await fetch(`${config.SUPABASE_URL}/auth/v1/user`, {
      headers: { authorization: `Bearer ${match[1]}`, apikey: config.SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(5_000),
    });
    if (!userResponse.ok)
      return send(
        res,
        401,
        {
          error: { code: 'authentication_required', message: 'A valid bearer token is required' },
          request_id: requestId,
        },
        requestId,
        allowedOrigin,
      );
    const user = (await userResponse.json()) as SafeUser;
    if (!user.id)
      return send(
        res,
        401,
        {
          error: { code: 'authentication_required', message: 'A valid bearer token is required' },
          request_id: requestId,
        },
        requestId,
        allowedOrigin,
      );
    const onboarding = isOnboarding ? await readJsonBody(req) : undefined;
    const rpc = isOnboarding ? 'complete_account_onboarding' : 'provision_account';
    const rpcResponse = await fetch(`${config.SUPABASE_URL}/rest/v1/rpc/${rpc}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: config.SUPABASE_SERVICE_ROLE_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        target_user_id: user.id,
        ...(isOnboarding ? { onboarding_payload: onboarding } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!rpcResponse.ok) throw new Error('rpc_failed');
    const result = (await rpcResponse.json()) as
      { profile_id?: string } | Array<{ profile_id?: string }>;
    const profileId = Array.isArray(result) ? result[0]?.profile_id : result.profile_id;
    if (!profileId) throw new Error('invalid_rpc_result');
    return send(
      res,
      200,
      { status: isOnboarding ? 'completed' : 'provisioned', profile_id: profileId },
      requestId,
      allowedOrigin,
    );
  } catch {
    return send(
      res,
      503,
      {
        error: { code: 'provisioning_unavailable', message: 'Account provisioning is unavailable' },
        request_id: requestId,
      },
      requestId,
      allowedOrigin,
    );
  }
}
