/** Explicit development transition; production continues using Supabase. */
export function clerkDevelopmentEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const provider = env.NEXT_PUBLIC_AUTH_PROVIDER ?? 'supabase';
  if (!['supabase', 'clerk'].includes(provider)) throw new Error('Invalid authentication provider');
  if (provider !== 'clerk') return false;
  if (
    env.VERCEL_ENV === 'production' ||
    env.NEPTLIUM_AUTH_ENVIRONMENT !== 'development' ||
    !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') ||
    !env.CLERK_SECRET_KEY?.startsWith('sk_test_')
  )
    throw new Error('Clerk requires an explicit development environment and test keys');
  const api = new URL(env.NEPTLIUM_API_URL ?? '');
  if (!['localhost', '127.0.0.1'].includes(api.hostname))
    throw new Error('Clerk development requires a local API');
  return true;
}
