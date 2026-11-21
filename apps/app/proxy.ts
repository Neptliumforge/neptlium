import { clerkMiddleware } from '@clerk/nextjs/server';
import { clerkPreviewConfig, clerkPreviewPaths, isClerkPreviewPath } from './lib/auth/clerk-preview-config';
import { NextResponse, type NextRequest } from 'next/server';
import { refreshSupabaseSession } from '@neptlium/lib/supabase/proxy';
import {
  ACCOUNT_RETURN_HEADER,
  accountEntryHref,
  resolveReturnDestination,
  safeInternalPath,
} from './app/(auth)/auth-utils';

const protectedPrefixes = ['/dashboard', '/onboarding'];

function isProtected(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function withRefreshedCookies(target: NextResponse, refreshed: NextResponse) {
  for (const cookie of refreshed.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

export default async function proxy(request: NextRequest, event: import('next/server').NextFetchEvent) {
  if (isClerkPreviewPath(request.nextUrl.pathname)) {
    const preview = clerkPreviewConfig();
    if (!preview || request.nextUrl.origin !== preview.appOrigin)
      return new NextResponse(null, { status: 404, headers: { 'cache-control': 'no-store' } });
    return clerkMiddleware({
      publishableKey: preview.publishableKey,
      secretKey: preview.secretKey,
      authorizedParties: [preview.appOrigin],
      signInUrl: clerkPreviewPaths.signIn,
      signUpUrl: clerkPreviewPaths.signUp,
    })(request, event);
  }

  // Never trust a caller-supplied return header. Set it before session refresh creates
  // its forwarded request response, preserving the existing refreshed-cookie handling.
  request.headers.delete(ACCOUNT_RETURN_HEADER);
  if (isProtected(request.nextUrl.pathname)) {
    request.headers.set(
      ACCOUNT_RETURN_HEADER,
      safeInternalPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );
  }
  const { response, user } = await refreshSupabaseSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const signIn = new URL(accountEntryHref('sign-in', `${pathname}${search}`), request.url);
    return withRefreshedCookies(NextResponse.redirect(signIn), response);
  }

  if (user && (pathname === '/' || pathname === '/auth/sign-in' || pathname === '/auth/sign-up')) {
    const destination =
      pathname === '/' ? '/dashboard' : resolveReturnDestination(request.nextUrl.searchParams);
    return withRefreshedCookies(NextResponse.redirect(new URL(destination, request.url)), response);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
