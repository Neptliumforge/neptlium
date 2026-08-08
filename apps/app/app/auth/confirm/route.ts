import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { recordSecurityEvent } from '@/lib/security/events';
import { recordTrustedDevice } from '@/lib/security/deviceCookie';
import { ensureAccountProvisioned } from '@/lib/api/client';
import { safeInternalPath } from '@/app/(auth)/auth-utils';

/**
 * Landing target for Supabase's signup confirmation and password-recovery
 * email links. Not under (auth) — the link must resolve to a stable,
 * non-route-group path. verifyOtp establishes the session cookie here (route
 * handlers, unlike Server Components, can write cookies).
 *
 * Recovery links land on /update-password to set a new credential; every
 * other type redirects to /dashboard, whose provisioning gate
 * (requireProvisionedUser) is the single place that decides whether an
 * authenticated user still needs to complete /onboarding.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = safeInternalPath(searchParams.get('next'));

  if ((tokenHash && type) || code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });

    if (!error && data.user) {
      if (type === 'signup') {
        await recordSecurityEvent(supabase, data.user.id, 'signup');
      }
      await recordTrustedDevice(supabase, data.user.id);

      if (type !== 'recovery') {
        try {
          await ensureAccountProvisioned();
        } catch {
          return NextResponse.redirect(
            new URL('/auth-error?reason=provisioning_unavailable', request.url),
          );
        }
      }

      const destination = type === 'recovery' ? '/update-password' : next;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth-error', request.url));
}
