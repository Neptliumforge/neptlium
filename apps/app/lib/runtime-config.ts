import 'server-only';

const PRODUCTION_SITE_ORIGIN = 'https://app.neptlium.com';
const PRODUCTION_API_ORIGIN = 'https://api.neptlium.com';

function exactOrigin(value: string | undefined, expected: string, name: string) {
  if (!value) throw new Error(`Invalid production application configuration: ${name}`);
  let origin: string;
  try {
    origin = new URL(value).origin;
  } catch {
    throw new Error(`Invalid production application configuration: ${name}`);
  }
  if (origin !== expected) throw new Error(`Invalid production application configuration: ${name}`);
}

export function assertProductionRuntimeConfig(env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL_ENV !== 'production') return;

  exactOrigin(env.NEXT_PUBLIC_SITE_URL, PRODUCTION_SITE_ORIGIN, 'NEXT_PUBLIC_SITE_URL');
  exactOrigin(env.NEPTLIUM_API_URL, PRODUCTION_API_ORIGIN, 'NEPTLIUM_API_URL');

  if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Invalid production application configuration: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  if (!env.CLERK_SECRET_KEY) {
    throw new Error('Invalid production application configuration: CLERK_SECRET_KEY');
  }
}
