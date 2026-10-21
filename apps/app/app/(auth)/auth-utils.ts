export function readRequiredField(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

export function isValidEmail(value: string | null): value is string {
  return Boolean(value && emailPattern.test(value));
}

export function meetsPasswordRequirements(value: string | null): value is string {
  return Boolean(value && passwordPattern.test(value));
}

export const DEFAULT_RETURN_PATH = '/dashboard';
// The App proxy overwrites this request header. It is navigation context, never authorization.
export const ACCOUNT_RETURN_HEADER = 'x-neptlium-account-return';

export type ReturnSearchParams =
  { getAll(name: string): string[] } | Record<string, string | string[] | undefined>;

// Actual App page routes, not an origin allowlist or a grant of target access.
const dashboardPages = new Set([
  '/dashboard',
  '/dashboard/activity',
  '/dashboard/administration',
  '/dashboard/allocation',
  '/dashboard/allocations',
  '/dashboard/capital',
  '/dashboard/capital-account',
  '/dashboard/companies',
  '/dashboard/company-intelligence',
  '/dashboard/counterparties',
  '/dashboard/deposit',
  '/dashboard/deposit/crypto',
  '/dashboard/documents',
  '/dashboard/invest',
  '/dashboard/more',
  '/dashboard/notifications',
  '/dashboard/portfolio',
  '/dashboard/reports',
  '/dashboard/research',
  '/dashboard/risk',
  '/dashboard/settings',
  '/dashboard/settings/account',
  '/dashboard/settings/addresses',
  '/dashboard/settings/appearance',
  '/dashboard/settings/notifications',
  '/dashboard/settings/payment-methods',
  '/dashboard/settings/profile',
  '/dashboard/settings/security',
  '/dashboard/settings/support',
  '/dashboard/settings/verification',
  '/dashboard/support',
  '/dashboard/transactions',
  '/dashboard/transfer',
  '/dashboard/treasury',
  '/dashboard/treasury-upgrade',
  '/dashboard/verification',
  '/dashboard/wallet',
  '/dashboard/withdrawals',
]);

function values(params: ReturnSearchParams, name: string): string[] {
  if ('getAll' in params && typeof params.getAll === 'function') return params.getAll(name);
  const value = (params as Record<string, string | string[] | undefined>)[name];
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

/** Canonical next wins, including invalid/empty next. Duplicate keys fail closed. */
export function resolveReturnDestination(
  params: ReturnSearchParams,
  allowOnboarding = true,
): string {
  const next = values(params, 'next');
  const legacy = values(params, 'redirect_url');
  if (next.length > 1 || legacy.length > 1) return DEFAULT_RETURN_PATH;
  return validateInternalPath(next.length ? next[0] : legacy[0], allowOnboarding);
}

export function safeInternalPath(value: string | null | undefined): string {
  return validateInternalPath(value, true);
}

function validateInternalPath(value: string | null | undefined, allowOnboarding: boolean): string {
  if (!value || value.length > 2048 || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_RETURN_PATH;
  }
  try {
    // Inspect decoded text for ambiguity; never use it as a second decoded navigation target.
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u0020\u007f]/.test(value) || /[\\\u0000-\u001f\u007f]/.test(decoded)) {
      return DEFAULT_RETURN_PATH;
    }
    const url = new URL(value, 'https://neptlium.invalid');
    if (url.origin !== 'https://neptlium.invalid' || /%(?:2f|5c|25)/i.test(url.pathname)) {
      return DEFAULT_RETURN_PATH;
    }
    const supported =
      dashboardPages.has(url.pathname) ||
      /^\/dashboard\/(?:research|company-intelligence)\/company\/[^/]+$/.test(url.pathname);
    if (!supported && !(allowOnboarding && url.pathname === '/onboarding'))
      return DEFAULT_RETURN_PATH;
    for (const key of url.searchParams.keys()) {
      const normalized = key.toLowerCase().replace(/[-_]/g, '');
      if (
        /^(?:code|token|accesstoken|refreshtoken|idtoken|password|secret|authorization|credential)$/.test(
          normalized,
        )
      ) {
        return DEFAULT_RETURN_PATH;
      }
      if ((key === 'next' || key === 'redirect_url') && url.pathname !== '/onboarding') {
        return DEFAULT_RETURN_PATH;
      }
    }
    if (
      url.pathname === '/onboarding' &&
      (url.searchParams.has('next') || url.searchParams.has('redirect_url'))
    ) {
      const afterSetup = resolveReturnDestination(url.searchParams, false);
      url.searchParams.delete('next');
      url.searchParams.delete('redirect_url');
      url.searchParams.set('next', afterSetup);
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}

export function accountEntryHref(
  mode: 'sign-in' | 'sign-up',
  destination: string,
  error?: string,
): string {
  const params = new URLSearchParams({ next: safeInternalPath(destination) });
  if (error) params.set('error', error);
  return `/auth/${mode}?${params}`;
}
