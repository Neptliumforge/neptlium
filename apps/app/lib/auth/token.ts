import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { clerkDevelopmentEnabled } from './provider';
export async function getIdentityToken(): Promise<string | null> {
  if (clerkDevelopmentEnabled()) {
    const session = await auth();
    return session.userId ? session.getToken() : null;
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
