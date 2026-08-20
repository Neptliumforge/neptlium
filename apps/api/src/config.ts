export type Environment = 'development' | 'test' | 'preview' | 'production';
export type ProviderRuntimeEnvironment = 'testnet' | 'production';
export type ApiAuthMode = 'SUPABASE' | 'DUAL' | 'CLERK';

function providerEnvironment(value: string | undefined, name: string): ProviderRuntimeEnvironment | undefined {
  if (!value) return undefined;
  if (value !== 'testnet' && value !== 'production')
    throw new Error(`Invalid API configuration: ${name}`);
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const environment = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'preview', 'production'].includes(environment))
    throw new Error('Invalid API configuration: NODE_ENV');
  const port = Number(env.API_PORT ?? 3003);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid API configuration: API_PORT');

  const mainnetPermitted = env.ENABLE_MAINNET === 'true';
  const CIRCLE_ENVIRONMENT = providerEnvironment(env.CIRCLE_ENVIRONMENT, 'CIRCLE_ENVIRONMENT');
  const ALCHEMY_ENVIRONMENT = providerEnvironment(env.ALCHEMY_ENVIRONMENT, 'ALCHEMY_ENVIRONMENT');
  if ((CIRCLE_ENVIRONMENT === 'production' || ALCHEMY_ENVIRONMENT === 'production') && !mainnetPermitted)
    throw new Error('Production provider environments require ENABLE_MAINNET=true for mainnet');

  const circleCredentialsPresent = Boolean(env.CIRCLE_API_KEY || env.CIRCLE_ENTITY_SECRET);
  if (circleCredentialsPresent && (!env.CIRCLE_API_KEY || !env.CIRCLE_ENTITY_SECRET || !CIRCLE_ENVIRONMENT))
    throw new Error(
      'Circle requires both credentials (CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET) plus CIRCLE_ENVIRONMENT',
    );
  if (env.CIRCLE_WALLET_SET_ID && !circleCredentialsPresent)
    throw new Error('Circle wallet set configuration requires Circle credentials');

  const validUrl = (value: string | undefined, name: string) => {
    if (value) {
      try { new URL(value); } catch { throw new Error(`Invalid API configuration: ${name}`); }
    }
    return value;
  };
  const SUPABASE_URL = validUrl(env.SUPABASE_URL, 'SUPABASE_URL');
  const AUTH_MODE = (env.API_AUTH_MODE ?? 'SUPABASE').toUpperCase() as ApiAuthMode;
  if (!['SUPABASE', 'DUAL', 'CLERK'].includes(AUTH_MODE))
    throw new Error('Invalid API configuration: API_AUTH_MODE');
  const clerkAuthorizedParties = (env.CLERK_AUTHORIZED_PARTIES ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  if (AUTH_MODE !== 'SUPABASE' && (!env.CLERK_SECRET_KEY || clerkAuthorizedParties.length === 0))
    throw new Error('Clerk API authentication requires CLERK_SECRET_KEY and CLERK_AUTHORIZED_PARTIES');
  const ALCHEMY_RPC_URL = validUrl(env.ALCHEMY_RPC_URL, 'ALCHEMY_RPC_URL');
  if ((env.ALCHEMY_API_KEY || ALCHEMY_RPC_URL) && (!env.ALCHEMY_API_KEY || !ALCHEMY_RPC_URL || !ALCHEMY_ENVIRONMENT))
    throw new Error('Alchemy requires ALCHEMY_API_KEY, ALCHEMY_RPC_URL, and ALCHEMY_ENVIRONMENT');
  if (ALCHEMY_ENVIRONMENT === 'production' && ALCHEMY_RPC_URL && !/\/base-mainnet\.g\.alchemy\.com\//.test(ALCHEMY_RPC_URL))
    throw new Error('Alchemy production runtime requires the Base mainnet RPC endpoint');
  if (ALCHEMY_ENVIRONMENT === 'testnet' && ALCHEMY_RPC_URL && !/\/base-sepolia\.g\.alchemy\.com\//.test(ALCHEMY_RPC_URL))
    throw new Error('Alchemy testnet runtime requires the Base Sepolia RPC endpoint');

  const webhookToleranceSeconds = Number(env.WEBHOOK_TOLERANCE_SECONDS ?? 300);
  if (!Number.isInteger(webhookToleranceSeconds) || webhookToleranceSeconds < 1 || webhookToleranceSeconds > 3600)
    throw new Error('Invalid API configuration: WEBHOOK_TOLERANCE_SECONDS');

  const stripeTreasuryEligibilityVerified = env.STRIPE_TREASURY_ELIGIBILITY_VERIFIED === 'true';
  const stripeTreasuryLiveExecutionEnabled = env.STRIPE_TREASURY_LIVE_EXECUTION_ENABLED === 'true';
  if (stripeTreasuryLiveExecutionEnabled && !stripeTreasuryEligibilityVerified)
    throw new Error('Stripe Treasury live execution requires verified Treasury eligibility');
  const circleLiveCapabilityVerified = env.CIRCLE_LIVE_CAPABILITY_VERIFIED === 'true';
  const circleLiveExecutionEnabled = env.CIRCLE_LIVE_EXECUTION_ENABLED === 'true';
  if (circleLiveCapabilityVerified && CIRCLE_ENVIRONMENT !== 'production')
    throw new Error('Circle live capability verification requires CIRCLE_ENVIRONMENT=production');
  if (circleLiveExecutionEnabled && (!circleLiveCapabilityVerified || CIRCLE_ENVIRONMENT !== 'production'))
    throw new Error('Circle live execution requires verified production capability');

  const alchemyProductionCapabilityVerified = env.ALCHEMY_PRODUCTION_CAPABILITY_VERIFIED === 'true';
  if (alchemyProductionCapabilityVerified && ALCHEMY_ENVIRONMENT !== 'production')
    throw new Error('Alchemy production capability verification requires ALCHEMY_ENVIRONMENT=production');

  return {
    NODE_ENV: environment as Environment,
    API_HOST: env.API_HOST ?? '0.0.0.0', API_PORT: port, API_LOG_LEVEL: env.API_LOG_LEVEL ?? 'info', API_BUILD_ID: env.API_BUILD_ID ?? 'local',
    ENABLE_MAINNET: mainnetPermitted,
    SUPABASE_URL, SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH_MODE, CLERK_SECRET_KEY: env.CLERK_SECRET_KEY, CLERK_JWT_KEY: env.CLERK_JWT_KEY,
    CLERK_WEBHOOK_SIGNING_SECRET: env.CLERK_WEBHOOK_SIGNING_SECRET,
    CLERK_AUTHORIZED_PARTIES: clerkAuthorizedParties,
    ALCHEMY_RPC_URL, ALCHEMY_API_KEY: env.ALCHEMY_API_KEY, ALCHEMY_ENVIRONMENT,
    ALCHEMY_WEBHOOK_SIGNING_KEY: env.ALCHEMY_WEBHOOK_SIGNING_KEY,
    ALCHEMY_PRODUCTION_CAPABILITY_VERIFIED: alchemyProductionCapabilityVerified,
    CIRCLE_API_KEY: env.CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET: env.CIRCLE_ENTITY_SECRET, CIRCLE_ENVIRONMENT,
    CIRCLE_WALLET_SET_ID: env.CIRCLE_WALLET_SET_ID,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    STRIPE_TREASURY_FINANCIAL_ACCOUNT_ID: env.STRIPE_TREASURY_FINANCIAL_ACCOUNT_ID,
    STRIPE_TREASURY_ELIGIBILITY_VERIFIED: stripeTreasuryEligibilityVerified,
    STRIPE_TREASURY_LIVE_EXECUTION_ENABLED: stripeTreasuryLiveExecutionEnabled,
    CIRCLE_LIVE_CAPABILITY_VERIFIED: circleLiveCapabilityVerified,
    CIRCLE_LIVE_EXECUTION_ENABLED: circleLiveExecutionEnabled,
    WEBHOOK_TOLERANCE_SECONDS: webhookToleranceSeconds,
    allowedOrigins: (
      env.API_ALLOWED_ORIGINS ??
      (environment === 'production'
        ? 'https://app.neptlium.com,https://admin.neptlium.com'
        : 'http://localhost:3000,http://localhost:3002')
    ).split(',').map((v) => v.trim()).filter(Boolean),
    databaseConfigured: Boolean(SUPABASE_URL && env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY),
    alchemyConfigured: Boolean(env.ALCHEMY_API_KEY && ALCHEMY_RPC_URL && ALCHEMY_ENVIRONMENT),
    circleConfigured: Boolean(circleCredentialsPresent && CIRCLE_ENVIRONMENT),
    stripeTreasuryConfigured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.STRIPE_TREASURY_FINANCIAL_ACCOUNT_ID),
  };
}
export type Config = ReturnType<typeof loadConfig>;
