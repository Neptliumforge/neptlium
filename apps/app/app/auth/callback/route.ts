import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { accountEntryHref, resolveReturnDestination } from '@/app/(auth)/auth-utils';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = resolveReturnDestination(url.searchParams);

  if (!code) {
    return NextResponse.redirect(
      new URL(accountEntryHref('sign-in', next, 'missing_auth_code'), url.origin),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(accountEntryHref('sign-in', next, 'auth_callback_failed'), url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
