import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { RECOVERY_COOKIE, RECOVERY_COOKIE_MAX_AGE } from '@/app/(auth)/recovery';

// Password-recovery links land here (not /auth/callback) so recovery never depends on
// the general return-destination allowlist and always ends at /reset-password.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code)
    return NextResponse.redirect(
      new URL('/forgot-password?error=recovery_link_invalid', url.origin),
    );

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(
      new URL('/forgot-password?error=recovery_link_invalid', url.origin),
    );

  const response = NextResponse.redirect(new URL('/reset-password', url.origin));
  response.cookies.set(RECOVERY_COOKIE, '1', {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: RECOVERY_COOKIE_MAX_AGE,
  });
  return response;
}
