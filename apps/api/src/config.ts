export type Environment = 'development' | 'test' | 'preview' | 'production';
export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const environment = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'preview', 'production'].includes(environment))
    throw new Error('Invalid API configuration: NODE_ENV');
  const port = Number(env.API_PORT ?? 3003);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid API configuration: API_PORT');
  if (env.ENABLE_MAINNET === 'true')
    throw new Error('Mainnet cannot be enabled by the API Foundation runtime');
  const validUrl = (value: string | undefined, name: string) => {
    if (value) {
      try {
        new URL(value);
      } catch {
        throw new Error(`Invalid API configuration: ${name}`);
      }
    }
    return value;
  };
  const SUPABASE_URL = validUrl(env.SUPABASE_URL, 'SUPABASE_URL');
  const ALCHEMY_RPC_URL = validUrl(env.ALCHEMY_RPC_URL, 'ALCHEMY_RPC_URL');
  const webhookToleranceSeconds = Number(env.WEBHOOK_TOLERANCE_SECONDS ?? 300);
  if (
    !Number.isInteger(webhookToleranceSeconds) ||
    webhookToleranceSeconds < 1 ||
    webhookToleranceSeconds > 3600
  )
    throw new Error('Invalid API configuration: WEBHOOK_TOLERANCE_SECONDS');
  return {
    NODE_ENV: environment as Environment,
    API_HOST: env.API_HOST ?? '0.0.0.0',
    API_PORT: port,
    API_LOG_LEVEL: env.API_LOG_LEVEL ?? 'info',
    API_BUILD_ID: env.API_BUILD_ID ?? 'local',
    SUPABASE_URL,
    ALCHEMY_RPC_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    CDP_API_KEY_ID: env.CDP_API_KEY_ID,
    CDP_API_KEY_SECRET: env.CDP_API_KEY_SECRET,
    CDP_WALLET_SECRET: env.CDP_WALLET_SECRET,
    ALCHEMY_API_KEY: env.ALCHEMY_API_KEY,
    ALCHEMY_WEBHOOK_SIGNING_KEY: env.ALCHEMY_WEBHOOK_SIGNING_KEY,
    COINBASE_WEBHOOK_SIGNING_KEY: env.COINBASE_WEBHOOK_SIGNING_KEY,
    WEBHOOK_TOLERANCE_SECONDS: webhookToleranceSeconds,
    allowedOrigins: (env.API_ALLOWED_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((v) => v.trim()),
    databaseConfigured: Boolean(
      SUPABASE_URL && env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    coinbaseConfigured: Boolean(
      env.CDP_API_KEY_ID && env.CDP_API_KEY_SECRET && env.CDP_WALLET_SECRET,
    ),
    alchemyConfigured: Boolean(env.ALCHEMY_API_KEY && ALCHEMY_RPC_URL),
  };
}
export type Config = ReturnType<typeof loadConfig>;
