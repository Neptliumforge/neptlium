import { notFound } from 'next/navigation';
import { clerkDevelopmentEnabled } from '@/lib/auth/provider';
import { AuthShell } from '@/app/(auth)/components/AuthShell';
import { resolveReturnDestination, type ReturnSearchParams } from '@/app/(auth)/auth-utils';
import { Completion } from './Completion';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ReturnSearchParams>;
}) {
  if (!clerkDevelopmentEnabled()) notFound();
  return (
    <AuthShell>
      <Completion returnTo={resolveReturnDestination(await searchParams)} />
    </AuthShell>
  );
}
