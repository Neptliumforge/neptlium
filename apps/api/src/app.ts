import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { loadConfig, type Config } from './config.js';
import { ApiError } from './errors.js';
import { digest, validatePair, type Asset, type Network } from './domain.js';
import { MemoryRepository, type ApiRepository } from './repositories.js';
import {
  DisabledCapitalProvider,
  type CapitalProvider,
  type WebhookVerifier,
} from './providers.js';
import { CircleCapitalProvider, initializeCircleSdk } from './circle.js';
import { MemoryRateLimiter, type RateLimiter } from './security.js';
import { JsonObserver, MemoryObserver, type Observer } from './observability.js';

export interface Dependencies {
  config?: Config;
  repository?: ApiRepository;
  authenticate?: (token: string) => Promise<{ id: string; role?: string } | null>;
  webhookVerifiers?: Partial<Record<'alchemy' | 'coinbase', WebhookVerifier>>;
  rateLimiter?: RateLimiter;
  observer?: Observer;
  capitalProvider?: CapitalProvider;
}
export interface Injection {
  method: string;
  url: string;
  headers?: Record<string, string>;
  payload?: unknown;
  clientAddress?: string;
}
export interface InjectionResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  json(): unknown;
}
type Context = {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string | undefined>;
  body: unknown;
  rawBody: Buffer;
  requestId: string;
  clientAddress: string;
};
const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
};

type ResourceState<T = never> =
  | { state: 'VALUE'; value: T }
  | { state: 'EMPTY' }
  | { state: 'NOT_CONFIGURED'; reason: string }
  | { state: 'UNAVAILABLE'; reason: string }
  | { state: 'PENDING'; reason: string };

const unavailable = (reason: string): ResourceState => ({ state: 'UNAVAILABLE', reason });
const notConfigured = (reason: string): ResourceState => ({ state: 'NOT_CONFIGURED', reason });

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
}
function mutation(value: unknown) {
  assertObject(value);
  const asset = value.asset;
  const network = value.network;
  if (
    !['USDC', 'ETH', 'BTC'].includes(String(asset)) ||
    !['base-sepolia', 'bitcoin-testnet'].includes(String(network))
  )
    throw new ApiError(422, 'validation_failed', 'Invalid asset or network');
  return { asset: asset as Asset, network: network as Network };
}
function positiveInt(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export async function buildApp(deps: Dependencies = {}) {
  const config = deps.config ?? loadConfig();
  if (config.NODE_ENV === 'production' && !deps.repository)
    throw new Error('A durable repository must be injected in production');
  if (config.NODE_ENV === 'production' && deps.repository instanceof MemoryRepository)
    throw new Error('MemoryRepository cannot be used in production');
  if (config.NODE_ENV === 'production' && !deps.rateLimiter)
    throw new Error('A distributed rate limiter must be injected in production');
  const repository = deps.repository ?? new MemoryRepository();
  const limiter = deps.rateLimiter ?? new MemoryRateLimiter();
  const observer =
    deps.observer ?? (config.NODE_ENV === 'test' ? new MemoryObserver() : new JsonObserver());
  const capitalProvider =
    deps.capitalProvider ??
    (config.circleConfigured
      ? new CircleCapitalProvider(
          initializeCircleSdk(config.CIRCLE_API_KEY, config.CIRCLE_ENTITY_SECRET),
          config.CIRCLE_WALLET_SET_ID,
        )
      : new DisabledCapitalProvider());
  const authenticate =
    deps.authenticate ??
    (async (token: string) => {
      if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
      let response: Response;
      try {
        response = await fetch(`${config.SUPABASE_URL}/auth/v1/user`, {
          headers: { authorization: `Bearer ${token}`, apikey: config.SUPABASE_ANON_KEY },
          signal: AbortSignal.timeout(5_000),
        });
      } catch {
        throw new ApiError(
          503,
          'authentication_unavailable',
          'Authentication service is unavailable',
        );
      }
      if (!response.ok) return null;
      const user = (await response.json()) as { id?: string; app_metadata?: { role?: string } };
      return user.id ? { id: user.id, role: user.app_metadata?.role } : null;
    });
  async function owner(context: Context) {
    const header = context.headers.authorization;
    if (!header?.startsWith('Bearer '))
      throw new ApiError(401, 'authentication_required', 'A valid bearer token is required');
    const user = await authenticate(header.slice(7));
    if (!user)
      throw new ApiError(401, 'authentication_required', 'A valid bearer token is required');
    return user;
  }
  function idempotencyKey(context: Context) {
    const value = context.headers['idempotency-key'];
    if (!value || value.length < 8 || value.length > 128)
      throw new ApiError(
        400,
        'idempotency_key_required',
        'A valid Idempotency-Key header is required',
      );
    return value;
  }
  async function route(context: Context): Promise<{ status?: number; data: unknown }> {
    const { method, path } = context;
    const isWrite = method !== 'GET';
    await limiter.consume(
      `${context.clientAddress}:${isWrite ? 'write' : 'read'}`,
      isWrite ? 30 : 120,
      60_000,
    );
    if (method === 'GET' && (path === '/health' || path === '/v1/health')) {
      const repositoryReady = await repository.ready();
      return {
        data: {
          status: 'ok',
          environment: config.NODE_ENV,
          version: '1.0.0',
          uptime: process.uptime(),
          build_id: config.API_BUILD_ID,
          database: !config.databaseConfigured
            ? 'not_configured'
            : repositoryReady
              ? 'ready'
              : 'degraded',
          providers: {
            coinbase: 'not_configured',
            alchemy:
              config.alchemyConfigured && deps.webhookVerifiers?.alchemy
                ? 'configured'
                : 'not_configured',
            circle: capitalProvider.readiness(),
          },
        },
      };
    }
    if (method === 'GET' && path === '/v1/version')
      return {
        data: { service: 'neptlium-api', api_version: 'v1', build_id: config.API_BUILD_ID },
      };
    if (method === 'GET' && path === '/v1/status') {
      const ready =
        config.NODE_ENV !== 'production' ||
        (config.databaseConfigured && (await repository.ready()));
      return {
        status: ready ? 200 : 503,
        data: {
          status: ready ? 'ready' : 'not_ready',
          mainnet: false,
          supported_assets: ['USDC'],
          networks: ['BASE-SEPOLIA'],
          capabilities: [
            {
              asset: 'USDC',
              network: 'BASE-SEPOLIA',
              environment: 'testnet',
              state: 'testnet-enabled',
            },
          ],
        },
      };
    }

    if (method === 'GET' && path === '/v1/account/context') {
      const user = await owner(context);
      return { data: await repository.getAccountContext(user.id) };
    }
    if (method === 'GET' && path === '/v1/account/settings') {
      const user = await owner(context);
      return { data: await repository.getAccountSettings(user.id) };
    }
    if (method === 'GET' && path === '/v1/account/onboarding-draft') {
      const user = await owner(context);
      return { data: await repository.getOnboardingDraft(user.id) };
    }
    if (method === 'POST' && path === '/v1/account/onboarding-draft') {
      const user = await owner(context);
      assertObject(context.body);
      const data = context.body.data;
      const stepIndex = context.body.step_index;
      if (!data || typeof data !== 'object' || Array.isArray(data) || !Number.isInteger(stepIndex))
        throw new ApiError(422, 'validation_failed', 'Invalid onboarding draft');
      const safeStepIndex = Number(stepIndex);
      if (safeStepIndex < 0 || safeStepIndex > 7)
        throw new ApiError(422, 'validation_failed', 'Invalid onboarding step');
      await repository.saveOnboardingDraft(user.id, {
        data: data as Record<string, unknown>,
        stepIndex: safeStepIndex,
      });
      return { data: { status: 'saved' } };
    }
    if (method === 'POST' && path === '/v1/account/provision') {
      const user = await owner(context);
      const result = await repository.provisionAccount(user.id);
      return { data: { status: 'provisioned', profile_id: result.profileId } };
    }
    if (method === 'POST' && path === '/v1/account/onboarding') {
      const user = await owner(context);
      const result = await repository.completeOnboarding(user.id, context.body);
      return { data: { status: 'completed', profile_id: result.profileId } };
    }

    if (method === 'GET' && path === '/v1/customer/overview') {
      const user = await owner(context);
      const activity = await repository.listCustomerActivity(user.id, { offset: 0, limit: 5 });
      return {
        data: {
          capital: {
            total: unavailable('canonical_capital_balance_unavailable'),
            available: unavailable('canonical_available_balance_unavailable'),
            reserved: unavailable('reservation_balance_unavailable'),
            allocated: unavailable('canonical_allocation_balance_unavailable'),
          },
          portfolio: unavailable('canonical_portfolio_unavailable'),
          treasury: unavailable('canonical_treasury_state_unavailable'),
          allocation: notConfigured('allocation_policy_not_configured'),
          activity: activity.data.length
            ? ({ state: 'VALUE', value: activity.data } satisfies ResourceState<typeof activity.data>)
            : ({ state: 'EMPTY' } satisfies ResourceState<typeof activity.data>),
        },
      };
    }
    if (method === 'GET' && path === '/v1/customer/portfolio') {
      await owner(context);
      return {
        data: {
          value: unavailable('canonical_portfolio_value_unavailable'),
          positions: unavailable('canonical_positions_unavailable'),
          performance: unavailable('canonical_reporting_history_unavailable'),
        },
      };
    }
    if (method === 'GET' && path === '/v1/customer/treasury') {
      await owner(context);
      return {
        data: {
          available_liquidity: unavailable('canonical_liquidity_unavailable'),
          reserved: unavailable('reservation_balance_unavailable'),
          committed: unavailable('canonical_commitment_balance_unavailable'),
          funding: notConfigured('live_funding_not_configured'),
          transfers: unavailable('governed_transfer_execution_unavailable'),
        },
      };
    }
    if (method === 'GET' && path === '/v1/customer/allocation') {
      await owner(context);
      return {
        data: {
          observed: unavailable('canonical_allocation_observation_unavailable'),
          modeled: { state: 'EMPTY' },
          authorized: unavailable('allocation_authorization_unavailable'),
          executed: unavailable('allocation_execution_unavailable'),
          reconciled: unavailable('allocation_reconciliation_unavailable'),
        },
      };
    }
    if (method === 'GET' && path === '/v1/capital-activity') {
      const user = await owner(context);
      const offset = Math.max(0, Number(context.query.get('offset') ?? 0) || 0);
      const limit = positiveInt(context.query.get('limit'), 20, 50);
      const optional = (name: string) => {
        const value = context.query.get(name)?.trim();
        return value ? value.slice(0, 80) : undefined;
      };
      const page = await repository.listCustomerActivity(user.id, {
        offset,
        limit,
        ...(optional('status') ? { status: optional('status') } : {}),
        ...(optional('asset') ? { asset: optional('asset') } : {}),
        ...(optional('network') ? { network: optional('network') } : {}),
        ...(optional('q') ? { search: optional('q') } : {}),
      });
      return {
        data: {
          state: page.data.length ? 'VALUE' : 'EMPTY',
          data: page.data,
          total: page.total,
          assets: page.assets,
          networks: page.networks,
          next_offset: offset + page.data.length < page.total ? offset + page.data.length : null,
        },
      };
    }

    if (method === 'GET' && path === '/v1/notifications') {
      const user = await owner(context);
      const notifications = await repository.listNotifications(user.id);
      return { data: { state: notifications.length ? 'VALUE' : 'EMPTY', data: notifications } };
    }
    const notificationMatch = path.match(/^\/v1\/notifications\/([^/]+)\/read$/);
    if (method === 'POST' && notificationMatch?.[1]) {
      const user = await owner(context);
      await repository.markNotificationRead(user.id, notificationMatch[1]);
      return { data: { status: 'updated' } };
    }
    if (method === 'POST' && path === '/v1/notifications/read-all') {
      const user = await owner(context);
      await repository.markAllNotificationsRead(user.id);
      return { data: { status: 'updated' } };
    }

    if (method === 'GET' && path === '/v1/documents') {
      const user = await owner(context);
      const documents = await repository.listDocuments(user.id);
      return { data: { state: documents.length ? 'VALUE' : 'EMPTY', data: documents } };
    }
    const documentMatch = path.match(/^\/v1\/documents\/([^/]+)\/download$/);
    if (method === 'POST' && documentMatch?.[1]) {
      const user = await owner(context);
      return {
        data: {
          url: await repository.createDocumentDownloadUrl(user.id, documentMatch[1], 60),
          expires_in: 60,
        },
      };
    }

    if (method === 'GET' && path === '/v1/capital-account/state') {
      const user = await owner(context);
      const link = await repository.getProviderWallet(user.id);
      const canonical = {
        total: unavailable('canonical_capital_balance_unavailable'),
        available: unavailable('canonical_available_balance_unavailable'),
        reserved: unavailable('reservation_balance_unavailable'),
        pending: unavailable('canonical_pending_balance_unavailable'),
      };
      if (!link) {
        return {
          data: {
            canonical,
            provider_observation: notConfigured('provider_wallet_not_linked'),
            funding: notConfigured('provider_wallet_not_linked'),
          },
        };
      }
      const balances = await capitalProvider.getBalances(link);
      return {
        data: {
          canonical,
          provider_observation: {
            state: 'VALUE',
            value: {
              balances,
              reconciliation_state: 'unreconciled',
              environment: link.environment,
            },
          },
          funding: { state: 'VALUE', value: { environment: link.environment } },
        },
      };
    }

    if (method === 'POST' && path === '/v1/wallet/deposit-addresses') {
      await owner(context);
      const body = mutation(context.body);
      validatePair(body.asset, body.network);
      throw new ApiError(410, 'route_replaced', 'Use the Capital Account deposit-address route');
    }
    if (method === 'POST' && path === '/v1/capital-account/provider-wallet') {
      const user = await owner(context);
      const key = idempotencyKey(context);
      const existing = await repository.getProviderWallet(user.id);
      if (existing) return { data: { status: existing.status, environment: existing.environment } };
      if (!capitalProvider.supports('USDC', 'BASE-SEPOLIA'))
        throw new ApiError(503, 'provider_not_configured', 'Capital provider is not configured');
      const link = await capitalProvider.provisionWallet({
        refId: `neptlium:${user.id}`,
        idempotencyKey: key,
      });
      await repository.linkProviderWallet(user.id, link);
      await repository.audit({
        actorId: user.id,
        operation: 'provider_wallet.linked',
        resourceId: link.providerWalletId,
        newState: link.status,
        requestId: context.requestId,
      });
      return { status: 201, data: { status: link.status, environment: link.environment } };
    }
    if (method === 'GET' && path === '/v1/capital-account/deposit-address') {
      const user = await owner(context);
      const asset = context.query.get('asset');
      const network = context.query.get('network');
      if (!capitalProvider.supports(asset ?? '', network ?? ''))
        throw new ApiError(422, 'unsupported_capability', 'Asset or network is unavailable');
      const link = await repository.getProviderWallet(user.id);
      if (!link)
        throw new ApiError(
          404,
          'provider_wallet_not_linked',
          'Capital Account provider wallet is not linked',
        );
      const destination = await capitalProvider.getDepositAddress(link);
      return {
        data: {
          asset: 'USDC',
          network: 'BASE-SEPOLIA',
          address: destination.address,
          provider_state: destination.status,
          environment: destination.environment,
        },
      };
    }
    if (method === 'GET' && path === '/v1/capital-account/balances') {
      const user = await owner(context);
      const link = await repository.getProviderWallet(user.id);
      if (!link)
        throw new ApiError(
          404,
          'provider_wallet_not_linked',
          'Capital Account provider wallet is not linked',
        );
      return {
        data: {
          balances: await capitalProvider.getBalances(link),
          reconciliation_state: 'unreconciled',
          canonical_ledger_balance: null,
        },
      };
    }
    if (method === 'GET' && path === '/v1/wallet/deposits') {
      const user = await owner(context);
      return {
        data: {
          data: await repository.listDeposits(user.id),
          next_cursor: null,
        },
      };
    }
    if (method === 'POST' && path === '/v1/wallet/withdrawals') {
      const user = await owner(context);
      const key = idempotencyKey(context);
      const pair = mutation(context.body);
      assertObject(context.body);
      const amount = context.body.amount;
      const destination = context.body.destination;
      if (
        typeof amount !== 'string' ||
        !/^\d+$/.test(amount) ||
        BigInt(amount) <= 0n ||
        typeof destination !== 'string' ||
        destination.length < 14 ||
        destination.length > 128
      )
        throw new ApiError(422, 'validation_failed', 'Invalid amount or destination');
      validatePair(pair.asset, pair.network);
      const requestDigest = digest(context.body);
      const creation = await repository.createWithdrawalIdempotently({
        ownerId: user.id,
        operation: 'create_withdrawal',
        key,
        requestDigest,
        requestId: context.requestId,
        withdrawal: { ownerId: user.id, ...pair, amount, destination },
      });
      if (creation.replayed) return { data: creation.value };
      return { status: 202, data: creation.value };
    }
    const match = path.match(/^\/v1\/wallet\/withdrawals\/([^/]+)(\/cancel)?$/);
    if (match && match[1] && method === 'GET' && !match[2])
      return { data: await repository.getWithdrawal((await owner(context)).id, match[1]) };
    if (match && match[1] && method === 'POST' && match[2]) {
      const user = await owner(context);
      const cancellation = await repository.cancelWithdrawalIdempotently({
        ownerId: user.id,
        withdrawalId: match[1],
        key: idempotencyKey(context),
        requestId: context.requestId,
      });
      return { data: cancellation.value };
    }
    if (method === 'GET' && path === '/v1/wallet/transactions') {
      const user = await owner(context);
      const cursor = Math.max(0, Number(context.query.get('cursor') ?? 0) || 0);
      const data = await repository.listTransactions(user.id, cursor, 50);
      return { data: { data, next_cursor: data.length === 50 ? String(cursor + 50) : null } };
    }
    if (
      method === 'POST' &&
      (path === '/v1/webhooks/alchemy' ||
        path === '/v1/webhooks/coinbase' ||
        path === '/v1/webhooks/circle')
    ) {
      const provider = path.endsWith('alchemy')
        ? 'alchemy'
        : path.endsWith('circle')
          ? 'circle'
          : 'coinbase';
      if (provider === 'circle')
        throw new ApiError(
          503,
          'provider_not_configured',
          'Circle webhook verification is disabled pending implementation against the reviewed official contract',
        );
      const verifier = deps.webhookVerifiers?.[provider];
      if (!verifier)
        throw new ApiError(
          503,
          'provider_not_configured',
          `${provider} webhook verification is not configured`,
        );
      await verifier.verify({ rawBody: context.rawBody, headers: context.headers });
      const eventId = context.headers['x-webhook-id'];
      if (!eventId) throw new ApiError(401, 'invalid_webhook', 'Missing webhook event ID');
      const eventDigest = digest(context.rawBody);
      const insertion = await repository.recordWebhook(
        { provider, eventId, digest: eventDigest, state: 'verified' },
        context.requestId,
      );
      if (insertion === 'duplicate') return { data: { received: true, duplicate: true } };
      return { status: 202, data: { received: true, duplicate: false } };
    }
    throw new ApiError(404, 'not_found', 'Route not found');
  }
  async function execute(input: Injection): Promise<InjectionResponse> {
    const startedAt = performance.now();
    const target = new URL(input.url, 'http://localhost');
    const headers = Object.fromEntries(
      Object.entries(input.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
    );
    const suppliedRequestId = headers['x-request-id'];
    const requestId =
      suppliedRequestId && /^[A-Za-z0-9._:-]{1,128}$/.test(suppliedRequestId)
        ? suppliedRequestId
        : randomUUID();
    const rawBody =
      input.payload === undefined
        ? Buffer.alloc(0)
        : Buffer.from(
            typeof input.payload === 'string' ? input.payload : JSON.stringify(input.payload),
          );
    const responseHeaders = {
      ...jsonHeaders,
      'x-request-id': requestId,
      ...(headers.origin && config.allowedOrigins.includes(headers.origin)
        ? { 'access-control-allow-origin': headers.origin, vary: 'Origin' }
        : {}),
    };
    try {
      if (headers.origin && !config.allowedOrigins.includes(headers.origin))
        throw new ApiError(403, 'forbidden', 'Origin is not allowed');
      if (rawBody.length > 1_048_576)
        throw new ApiError(413, 'payload_too_large', 'Request body exceeds 1 MiB');
      let body: unknown;
      try {
        body = rawBody.length ? JSON.parse(rawBody.toString('utf8')) : undefined;
      } catch {
        throw new ApiError(422, 'validation_failed', 'Malformed JSON');
      }
      if (input.method.toUpperCase() === 'OPTIONS') {
        return {
          statusCode: 204,
          headers: {
            ...responseHeaders,
            'access-control-allow-methods': 'GET,POST,OPTIONS',
            'access-control-allow-headers':
              'Authorization,Content-Type,Idempotency-Key,X-Request-Id',
          },
          body: '',
          json: () => undefined,
        };
      }
      const result = await route({
        method: input.method.toUpperCase(),
        path: target.pathname,
        query: target.searchParams,
        headers,
        body,
        rawBody,
        requestId,
        clientAddress: input.clientAddress ?? 'local',
      });
      const responseBody = JSON.stringify(result.data);
      observer.increment('http_requests_total', {
        method: input.method.toUpperCase(),
        status: String(result.status ?? 200),
      });
      observer.timing('http_request_duration_ms', performance.now() - startedAt, {
        method: input.method.toUpperCase(),
      });
      observer.log({
        level: 'info',
        operation: 'http.request',
        requestId,
        durationMs: performance.now() - startedAt,
        outcome: 'success',
      });
      return {
        statusCode: result.status ?? 200,
        headers: responseHeaders,
        body: responseBody,
        json: () => JSON.parse(responseBody),
      };
    } catch (error) {
      const safe =
        error instanceof ApiError
          ? error
          : new ApiError(500, 'internal_error', 'An unexpected error occurred');
      const responseBody = JSON.stringify({
        error: {
          code: safe.code,
          message: safe.message,
          ...(safe.details === undefined ? {} : { details: safe.details }),
        },
        request_id: requestId,
      });
      observer.increment('http_requests_total', {
        method: input.method.toUpperCase(),
        status: String(safe.status),
        error_code: safe.code,
      });
      observer.timing('http_request_duration_ms', performance.now() - startedAt, {
        method: input.method.toUpperCase(),
      });
      observer.log({
        level: safe.status >= 500 ? 'error' : 'warn',
        operation: 'http.request',
        requestId,
        durationMs: performance.now() - startedAt,
        outcome: 'failure',
        errorCode: safe.code,
      });
      return {
        statusCode: safe.status,
        headers: {
          ...responseHeaders,
          ...(safe.code === 'rate_limited' &&
          typeof safe.details === 'object' &&
          safe.details &&
          'retry_after_seconds' in safe.details
            ? {
                'retry-after': String(
                  (safe.details as { retry_after_seconds: number }).retry_after_seconds,
                ),
              }
            : {}),
        },
        body: responseBody,
        json: () => JSON.parse(responseBody),
      };
    }
  }
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    let received = 0;
    for await (const chunk of req) {
      const buffer = Buffer.from(chunk);
      received += buffer.length;
      if (received > 1_048_576) {
        const requestId = randomUUID();
        res.writeHead(413, { ...jsonHeaders, 'x-request-id': requestId });
        res.end(
          JSON.stringify({
            error: { code: 'payload_too_large', message: 'Request body exceeds 1 MiB' },
            request_id: requestId,
          }),
        );
        return;
      }
      chunks.push(buffer);
    }
    const response = await execute({
      method: req.method ?? 'GET',
      url: req.url ?? '/',
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(([, v]) => typeof v === 'string'),
      ) as Record<string, string>,
      payload: Buffer.concat(chunks).toString() || undefined,
      clientAddress: req.socket?.remoteAddress ?? 'unknown',
    });
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  });
  return {
    server,
    inject: execute,
    listen: (options: { host: string; port: number }) =>
      new Promise<void>((resolve) => server.listen(options.port, options.host, resolve)),
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}
