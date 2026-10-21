import 'server-only';

import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';

/** Authentication facts for display only. They never grant any Neptlium authority. */
export interface SessionDetails {
  readonly email: string | null;
  readonly emailConfirmedAt: string | null;
  readonly createdAt: string | null;
  readonly lastSignInAt: string | null;
}

export async function getSessionDetails(): Promise<SessionDetails | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return {
    email: user.email ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    createdAt: user.created_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}
