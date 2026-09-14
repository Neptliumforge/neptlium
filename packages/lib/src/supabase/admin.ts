import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase administration client.
 * This client is restricted to trusted server-side persistence and authority
 * workflows. Supabase Auth session clients must never expose the service role.
 */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createSupabaseAdminClient requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
