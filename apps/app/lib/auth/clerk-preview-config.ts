const PREVIEW_ROOT = '/preview/clerk';

export const clerkPreviewPaths = {
  root: PREVIEW_ROOT,
  signIn: `${PREVIEW_ROOT}/sign-in`,
  signUp: `${PREVIEW_ROOT}/sign-up`,
  session: `${PREVIEW_ROOT}/session`,
};

export function isClerkPreviewPath(pathname: string) {
  return pathname === PREVIEW_ROOT || pathname.startsWith(`${PREVIEW_ROOT}/`);
}

function httpsOrigin(value: string | undefined) {
  if (!value) return undefined;
  const url = URL.parse(value);
  return url?.protocol === 'https:' && url.origin === value ? value : undefined;
}

export function clerkPreviewConfig(env: Readonly<Record<string, string | undefined>> = process.env) {
  if (env.VERCEL_ENV !== 'preview' || env.VERCEL_TARGET_ENV === 'production' ||
      env.NEPTLIUM_API_AUTH_PROVIDER !== 'clerk-preview') return undefined;
  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = env.CLERK_SECRET_KEY;
  const appOrigin = httpsOrigin(env.NEPTLIUM_CLERK_PREVIEW_APP_ORIGIN);
  const apiOrigin = httpsOrigin(env.NEPTLIUM_CLERK_PREVIEW_API_ORIGIN);
  const template = env.NEPTLIUM_CLERK_PREVIEW_TOKEN_TEMPLATE?.trim();
  if (!publishableKey?.startsWith('pk_test_') || !secretKey?.startsWith('sk_test_') ||
      !appOrigin || !apiOrigin || !template || appOrigin === apiOrigin) return undefined;
  return { publishableKey, secretKey, appOrigin, apiOrigin, template };
}
