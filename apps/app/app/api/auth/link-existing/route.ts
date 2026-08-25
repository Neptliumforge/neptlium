import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ayrgojoiprxyijeshika.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_Xpfhj_p7EUi65DC4MCRQWQ_MD96l3oX';

function apiOrigin() {
  const configured = process.env.NEPTLIUM_API_URL ?? 'https://api.neptlium.com';
  const url = new URL(configured);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new Error('Invalid API origin');
  }
  return url.origin;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }
  const clerkToken = await session.getToken();
  if (!clerkToken) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || email.length > 320 || !password || password.length > 1024) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 422 });
  }

  let legacyResponse: Response;
  try {
    legacyResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return NextResponse.json({ error: 'legacy_auth_unavailable' }, { status: 503 });
  }

  if (!legacyResponse.ok) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }
  const legacy = (await legacyResponse.json()) as { access_token?: string };
  if (!legacy.access_token) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  let linkResponse: Response;
  try {
    linkResponse = await fetch(`${apiOrigin()}/v1/auth/link-clerk`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        authorization: `Bearer ${legacy.access_token}`,
        'x-clerk-session-token': clerkToken,
        'idempotency-key': `app-link-${randomUUID()}`,
        'content-type': 'application/json',
      },
      body: '{}',
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return NextResponse.json({ error: 'identity_link_unavailable' }, { status: 503 });
  }

  const payload = (await linkResponse.json().catch(() => ({}))) as {
    error?: { code?: string };
  };
  if (!linkResponse.ok) {
    return NextResponse.json(
      { error: payload.error?.code ?? 'identity_link_unavailable' },
      { status: linkResponse.status },
    );
  }

  return NextResponse.json({ status: 'linked' }, { status: 200 });
}
