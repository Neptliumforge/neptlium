'use server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { apiRequest, getAccountContext } from '@/lib/api/client';
import { clerkDevelopmentEnabled } from './provider';
export async function completeClerkSignIn(): Promise<{ ok: boolean; provisioned?: boolean; error?: string }> {
  if (!clerkDevelopmentEnabled()) return { ok: false, error: 'Identity setup is unavailable.' };
  const user = await currentUser();
  if (!user || user.primaryEmailAddress?.verification?.status !== 'verified')
    return { ok: false, error: 'Verify your email before continuing.' };
  try {
    await apiRequest('/v1/account/identity/bootstrap', { method: 'POST' });
    // A successful identity bootstrap does not mean onboarding has completed.
    // Resolve the API-owned account state before choosing the destination.
    const account = await getAccountContext();
    if (!account.id) return { ok: false, error: 'Account identity is unavailable.' };
    return { ok: true, provisioned: Boolean(account.provisionedAt) };
  } catch {
    return {
      ok: false,
      error:
        'Account setup is unavailable or needs a reviewed identity link. Please try again or contact support.',
    };
  }
}
export async function revokeClerkSessions(scope: 'others' | 'global'): Promise<void> {
  if (!clerkDevelopmentEnabled() || !['others', 'global'].includes(scope))
    throw new Error('Invalid session operation');
  const session = await auth();
  if (!session.userId || !session.sessionId) throw new Error('Sign in again');
  const client = await clerkClient();
  // Snapshot all pages before revocation so deleting a page cannot shift the next offset.
  const ids: string[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await client.sessions.getSessionList({
      userId: session.userId,
      status: 'active',
      limit: 100,
      offset,
    });
    ids.push(
      ...page.data.filter((s) => scope === 'global' || s.id !== session.sessionId).map((s) => s.id),
    );
    if (offset + page.data.length >= page.totalCount) break;
  }
  for (const id of ids) await client.sessions.revokeSession(id);
}
