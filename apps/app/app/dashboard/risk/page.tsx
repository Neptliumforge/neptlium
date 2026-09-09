import { redirect } from 'next/navigation';
import { requireProvisionedUser } from '@/lib/auth';

export default async function RiskPage() {
  await requireProvisionedUser();
  redirect('/dashboard/portfolio');
}
