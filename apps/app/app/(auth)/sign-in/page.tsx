import { redirect } from 'next/navigation';
import { accountEntryHref, resolveReturnDestination, type ReturnSearchParams } from '../auth-utils';

export default async function LegacySignInPage({
  searchParams,
}: {
  readonly searchParams: Promise<ReturnSearchParams>;
}) {
  redirect(accountEntryHref('sign-in', resolveReturnDestination(await searchParams)));
}
