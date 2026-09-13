import { createBrowserClient } from '@supabase/ssr';

function requiredPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error('Supabase Auth public configuration is unavailable');
  }
  return { url, publishableKey };
}

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requiredPublicConfig();
  return createBrowserClient(url, publishableKey);
}
