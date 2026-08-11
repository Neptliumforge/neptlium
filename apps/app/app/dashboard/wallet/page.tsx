import { requireProvisionedUser } from '@/lib/auth';
import {
  getCanonicalBalances,
  getFundingActivity,
  getFundingCapabilities,
  getTransferActivity,
  getTransferAliases,
  getTransferCapabilities,
} from '@/lib/api/financial';
import { WalletView } from './WalletView';

export default async function WalletPage() {
  await requireProvisionedUser();

  const [capabilities, balances, funding, transferCapabilities, transfers, aliases] = await Promise.allSettled([
    getFundingCapabilities(),
    getCanonicalBalances(),
    getFundingActivity(),
    getTransferCapabilities(),
    getTransferActivity(),
    getTransferAliases(),
  ]);

  return (
    <WalletView
      capabilities={capabilities.status === 'fulfilled' ? capabilities.value.capabilities : []}
      capabilityError={capabilities.status === 'rejected'}
      balances={balances.status === 'fulfilled' ? balances.value.balances : []}
      balanceError={balances.status === 'rejected'}
      fundingActivity={funding.status === 'fulfilled' ? funding.value.data : []}
      fundingActivityError={funding.status === 'rejected'}
      transferCapabilities={transferCapabilities.status === 'fulfilled' ? transferCapabilities.value.capabilities : []}
      transferActivity={transfers.status === 'fulfilled' ? transfers.value.data : []}
      aliases={aliases.status === 'fulfilled' ? aliases.value.data : []}
    />
  );
}
