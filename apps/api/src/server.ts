import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { SupabaseRepository } from './supabase-repository.js';
import { SupabaseRateLimiter } from './security.js';
const config = loadConfig();
const repository =
  config.NODE_ENV === 'production'
    ? new SupabaseRepository(config.SUPABASE_URL!, config.SUPABASE_SERVICE_ROLE_KEY!)
    : undefined;
const app = await buildApp({
  config,
  ...(repository ? {
    repository,
    rateLimiter: new SupabaseRateLimiter(config.SUPABASE_URL!, config.SUPABASE_SERVICE_ROLE_KEY!),
  } : {}),
});
await app.listen({ host: config.API_HOST, port: config.API_PORT });
