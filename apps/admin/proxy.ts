import { NextResponse, type NextRequest } from 'next/server';
import { refreshSupabaseSession } from '@neptlium/lib/supabase/proxy';

function withRefreshedCookies(target: NextResponse, refreshed: NextResponse) {
  for (const cookie of refreshed.cookies.getAll()) target.cookies.set(cookie);
  return target;
}

export default async function proxy(request: NextRequest) {
  const { response, user } = await refreshSupabaseSession(request);
  const { pathname } = request.nextUrl;
  const protectedRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  if (!user && protectedRoute) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = '';
    return withRefreshedCookies(NextResponse.redirect(login), response);
  }

  if (user && pathname === '/login') {
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
