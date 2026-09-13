import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next');
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=missing_auth_code', url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=auth_callback_failed', url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
