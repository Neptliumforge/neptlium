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
import {
  MemoryFinancialRepository,
  SupabaseFinancialRepository,
  type FinancialRepository,
} from './financial-repository.js';
import { handleFinancialRoute } from './financial-routes.js';
import { publicFundingDefinitions } from './asset-registry.js';
import { createPrincipalAuthenticator } from './authentication.js';
import { verifyClerkSubject } from './authentication.js';
import {
  SupabaseIdentityCommandRepository,
  SupabaseIdentityPrincipalResolver,
} from './identity-principal.js';
import { verifyWebhook as verifyClerkWebhook } from '@clerk/backend/webhooks';
import type { WebhookEvent as ClerkWebhookEvent } from '@clerk/backend';

export interface Dependencies {
  config?: Config;
  repository?: ApiRepository;
  financialRepository?: FinancialRepository;
  authenticate?: (token: string) => Promise<{ id: string; role?: string } | null>;
  identityCommands?: Pick<
    SupabaseIdentityCommandRepository,
    'linkClerkSubject' | 'syncClerkLifecycle'
  >;
  verifyClerkWebhook?: (request: Request) => Promise<ClerkWebhookEvent>;
  verifyClerkSubject?: (token: string, config: Config) => Promise<string | null>;
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
  if (config.NODE_ENV === 'production' && deps.rateLimiter instanceof MemoryRateLimiter)
    throw new Error('MemoryRateLimiter cannot be used in production');
  const repository = deps.repository ?? new MemoryRepository();
  const financialRepository =
    deps.financialRepository ??
    (config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
      ? new SupabaseFinancialRepository(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
      : new MemoryFinancialRepository());
  if (config.NODE_ENV === 'production' && financialRepository instanceof MemoryFinancialRepository)
    throw new Error('MemoryFinancialRepository cannot be used in production');
  const limiter = deps.rateLimiter ?? new MemoryRateLimiter();
  const observer =
    deps.observer ?? (config.NODE_ENV === 'test' ? new MemoryObserver() : new JsonObserver());
  const capitalProvider =
    deps.capitalProvider ??
    (config.circleConfigured
      ? new CircleCapitalProvider(
          initializeCircleSdk(config.CIRCLE_API_KEY, config.CIRCLE_ENTITY_SECRET),
          config.CIRCLE_ENVIRONMENT!,
          config.CIRCLE_WALLET_SET_ID,
          config.CIRCLE_LIVE_EXECUTION_ENABLED,
        )
      : new DisabledCapitalProvider());
  const identityResolver =
    config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
      ? new SupabaseIdentityPrincipalResolver(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
      : undefined;
  const identityCommands =
    deps.identityCommands ??
    (config.SUPABASE_URL && config.SUPABASE_ANON_KEY && config.SUPABASE_SERVICE_ROLE_KEY
      ? new SupabaseIdentityCommandRepository(
          config.SUPABASE_URL,
          config.SUPABASE_ANON_KEY,
          config.SUPABASE_SERVICE_ROLE_KEY,
        )
      : undefined);
  const authenticate = deps.authenticate ?? createPrincipalAuthenticator(config, identityResolver);
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

    if (method === 'POST' && path === '/v1/auth/link-clerk') {
      if (!identityCommands)
        throw new ApiError(503, 'identity_link_unavailable', 'Identity linking is unavailable');
      const authorization = context.headers.authorization;
      const clerkToken = context.headers['x-clerk-session-token'];
      if (!authorization?.startsWith('Bearer ') || !clerkToken)
        throw new ApiError(
          401,
          'authentication_required',
          'Both authenticated sessions are required',
        );
      const clerkSubject = await (deps.verifyClerkSubject ?? verifyClerkSubject)(
        clerkToken,
        config,
      );
      if (!clerkSubject)
        throw new ApiError(401, 'authentication_required', 'The Clerk session is invalid');
      const linked = await identityCommands.linkClerkSubject({
        supabaseAccessToken: authorization.slice(7),
        clerkSubject,
        idempotencyKey: idempotencyKey(context),
        requestId: context.requestId,
      });
      return { data: linked };
    }

    if (method === 'POST' && path === '/v1/webhooks/clerk') {
      if (!config.CLERK_WEBHOOK_SIGNING_SECRET || !identityCommands)
        throw new ApiError(
          503,
          'identity_link_unavailable',
          'Clerk lifecycle synchronization is unavailable',
        );
      const request = new Request('https://api.neptlium.com/v1/webhooks/clerk', {
        method: 'POST',
        headers: Object.fromEntries(
          Object.entries(context.headers).filter((entry): entry is [string, string] =>
            Boolean(entry[1]),
          ),
        ),
        body: new Uint8Array(context.rawBody),
      });
      let event: ClerkWebhookEvent;
      try {
        event = deps.verifyClerkWebhook
          ? await deps.verifyClerkWebhook(request)
          : await verifyClerkWebhook(request, {
              signingSecret: config.CLERK_WEBHOOK_SIGNING_SECRET,
            });
      } catch {
        throw new ApiError(401, 'invalid_webhook', 'Clerk webhook verification failed');
      }
      if (!['user.created', 'user.updated', 'user.deleted'].includes(event.type))
        return { data: { accepted: true, action: 'ignored' } };
      const subject = 'id' in event.data ? event.data.id : undefined;
      const eventId = context.headers['svix-id'];
      if (!subject || !eventId)
        throw new ApiError(422, 'invalid_webhook', 'Clerk lifecycle event identity is incomplete');
      const result = await identityCommands.syncClerkLifecycle({
        clerkSubject: subject,
        eventId,
        eventType: event.type,
        eventDigest: digest({ type: event.type, data: event.data }),
      });
      return { data: result };
    }

    const financialResult = await handleFinancialRoute(context, {
      config,
      repository: financialRepository,
      ownerId: async () => (await owner(context)).id,
    });
    if (financialResult) return financialResult;

    if (method === 'GET' && (path === '/health' || path === '/v1/health')) {
      const repositoryReady = await repository.ready();
      const governedFinancialStorageReady = await financialRepository.ready();
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
          governed_financial_storage: governedFinancialStorageReady ? 'ready' : 'not_ready',
          providers: {
            coinbase: 'not_configured',
            alchemy:
              config.alchemyConfigured && deps.webhookVerifiers?.alchemy
                ? 'configured'
                : 'not_configured',
            circle: capitalProvider.readiness(),
            stripe_treasury: config.stripeTreasuryConfigured
              ? 'configured_gated'
              : 'not_configured',
          },
        },
      };
    }
    if (method === 'GET' && path === '/v1/version')
      return {
        data: { service: 'neptlium-api', api_version: 'v1', build_id: config.API_BUILD_ID },
      };
    if (method === 'GET' && path === '/v1/status') {
      const [generalReady, financialReady] = await Promise.all([
        repository.ready(),
        financialRepository.ready(),
      ]);
      const ready =
        config.NODE_ENV !== 'production' ||
        (config.databaseConfigured && generalReady && financialReady);
      return {
        status: ready ? 200 : 503,
        data: {
          status: ready ? 'ready' : 'not_ready',
          mainnet: publicFundingDefinitions().some(
            (definition) => definition.environment === 'LIVE' && definition.productionEnabled,
          ),
          database: generalReady ? 'ready' : 'not_ready',
          governed_financial_storage: financialReady ? 'ready' : 'not_ready',
          capabilities: publicFundingDefinitions().map((definition) => ({
            asset: definition.asset,
            network: definition.network,
            environment: definition.environment.toLowerCase(),
            deposit: definition.depositCapability,
            custody: definition.custodyCapability,
            reconciliation: definition.reconciliationCapability,
            production_enabled: definition.productionEnabled,
          })),
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
            ? ({ state: 'VALUE', value: activity.data } satisfies ResourceState<
                typeof activity.data
              >)
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
      const user = await owner(context);
      const balances = await financialRepository.getCanonicalBalances(user.id).catch(() => []);
      const aliases = await financialRepository.listAliases(user.id).catch(() => []);
      const transfers = await financialRepository.listTransfers(user.id, 20).catch(() => []);
      return {
        data: {
          available_liquidity: balances.length
            ? {
                state: 'VALUE',
                value: balances.map((item) => ({
                  asset: item.asset,
                  network: item.network,
                  available_atomic: item.availableAtomic,
                })),
              }
            : unavailable('canonical_liquidity_unavailable'),
          reserved: balances.length
            ? {
                state: 'VALUE',
                value: balances.map((item) => ({
                  asset: item.asset,
                  network: item.network,
                  reserved_atomic: item.reservedAtomic,
                })),
              }
            : unavailable('reservation_balance_unavailable'),
          committed: unavailable('canonical_commitment_balance_unavailable'),
          funding: { state: 'VALUE', value: { capabilities_endpoint: '/v1/funding/capabilities' } },
          transfers: {
            state: transfers.length ? 'VALUE' : 'EMPTY',
            value: transfers.map((item) => ({
              id: item.id,
              state: item.state,
              asset: item.asset,
              network: item.network,
              amount_atomic: item.amountAtomic,
            })),
          },
          aliases: {
            state: aliases.length ? 'VALUE' : 'EMPTY',
            value: aliases.map((item) => ({
              id: item.id,
              alias: item.alias,
              verification_state: item.verificationState,
              activation_state: item.activationState,
            })),
          },
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
      const canonicalBalances = await financialRepository
        .getCanonicalBalances(user.id)
        .catch(() => []);
      const canonical = canonicalBalances.length
        ? {
            total: {
              state: 'VALUE',
              value: canonicalBalances.map((item) => ({
                asset: item.asset,
                network: item.network,
                amount_atomic: item.totalAtomic,
              })),
            },
            available: {
              state: 'VALUE',
              value: canonicalBalances.map((item) => ({
                asset: item.asset,
                network: item.network,
                amount_atomic: item.availableAtomic,
              })),
            },
            reserved: {
              state: 'VALUE',
              value: canonicalBalances.map((item) => ({
                asset: item.asset,
                network: item.network,
                amount_atomic: item.reservedAtomic,
              })),
            },
            pending: {
              state: 'VALUE',
              value: canonicalBalances.map((item) => ({
                asset: item.asset,
                network: item.network,
                amount_atomic: item.pendingAtomic,
              })),
            },
          }
        : {
            total: unavailable('canonical_capital_balance_unavailable'),
            available: unavailable('canonical_available_balance_unavailable'),
            reserved: unavailable('reservation_balance_unavailable'),
            pending: unavailable('canonical_pending_balance_unavailable'),
          };
      return {
        data: {
          canonical,
          provider_observation: notConfigured('legacy_provider_wallet_model_retired'),
          funding: { state: 'VALUE', value: { capabilities_endpoint: '/v1/funding/capabilities' } },
        },
      };
    }

    if (
      path.startsWith('/v1/wallet/') ||
      path === '/v1/capital-account/provider-wallet' ||
      path === '/v1/capital-account/deposit-address'
    ) {
      await owner(context);
      throw new ApiError(
        410,
        'route_replaced',
        'Per-customer provider-wallet routes are superseded by funding_intent → deposit_route → treasury_destination',
      );
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
