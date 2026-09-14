import { NextResponse, type NextRequest } from 'next/server';
import { refreshSupabaseSession } from '@neptlium/lib/supabase/proxy';

const protectedPrefixes = ['/dashboard', '/onboarding'];

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function withRefreshedCookies(target: NextResponse, refreshed: NextResponse) {
  for (const cookie of refreshed.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

export default async function proxy(request: NextRequest) {
  const { response, user } = await refreshSupabaseSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = '/auth/sign-in';
    signIn.search = '';
    signIn.searchParams.set('next', `${pathname}${search}`);
    return withRefreshedCookies(NextResponse.redirect(signIn), response);
  }

  if (user && (pathname === '/' || pathname === '/auth/sign-in' || pathname === '/auth/sign-up')) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = '/dashboard';
    dashboard.search = '';
    return withRefreshedCookies(NextResponse.redirect(dashboard), response);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
