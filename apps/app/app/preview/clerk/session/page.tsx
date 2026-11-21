import { SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { clerkPreviewConfig, clerkPreviewPaths } from '@/lib/auth/clerk-preview-config';
import { resolvePreviewClerkApiSession } from '@/lib/auth/preview-clerk-api-session';

export default async function PreviewClerkSessionPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ organization_id?: string | string[] }>;
}) {
  const config = clerkPreviewConfig();
  if (!config) notFound();

  const api = config.api;
  const session = await auth().catch(() => null);
  if (session && !session.userId) redirect(clerkPreviewPaths.signIn);
  const { organization_id: organization } = await searchParams;
  const tenant = typeof organization === 'string' ? organization : undefined;
  const verified = api && session?.userId && tenant
    ? await resolvePreviewClerkApiSession(tenant, {
        environment: 'preview',
        apiProvider: 'clerk-preview',
        apiOrigin: api.origin,
        getSessionToken: () => session.getToken({ template: api.template }),
      })
    : null;

  return (
    <>
      <h1>Verify organization access</h1>
      {!session && <p role="status">The authentication service is unavailable. Try again shortly.</p>}
      {session?.userId && (
        <>
          {api ? (
            <>
              <form method="get" action={clerkPreviewPaths.session}>
                <label htmlFor="organization_id">Organization ID</label>
                <input id="organization_id" name="organization_id" required />
                <button type="submit">Verify access</button>
              </form>
              {organization !== undefined && (
                <p role="status">{verified ? 'Organization access verified.' : 'Organization access could not be verified.'}</p>
              )}
            </>
          ) : <p role="status">Organization verification is unavailable in this Preview.</p>}
          <SignOutButton redirectUrl={clerkPreviewPaths.signIn}><button type="button">Sign out</button></SignOutButton>
        </>
      )}
    </>
  );
}
