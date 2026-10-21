import { AccountSetupPrompt } from '@/components/product/AccountSetupPrompt';
import { OverviewExperience } from '@/components/product/OperatingExperience';
import { loadAccountStatus } from '@/lib/account/status';

export default async function DashboardPage() {
  const status = await loadAccountStatus();
  return (
    <>
      <AccountSetupPrompt status={status} />
      <OverviewExperience />
    </>
  );
}
