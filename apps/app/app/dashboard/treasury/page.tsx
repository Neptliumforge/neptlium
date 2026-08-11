import { requireProvisionedUser } from '@/lib/auth';
import {
  getCanonicalBalances,
  getFundingCapabilities,
  getTransferAliases,
  getTransferActivity,
  getTransferCapabilities,
} from '@/lib/api/financial';
import { TreasuryView } from './TreasuryView';

export default async function TreasuryPage() {
  await requireProvisionedUser();

  const [balances, funding, aliases, transfers, transferCapabilities] = await Promise.allSettled([
    getCanonicalBalances(),
    getFundingCapabilities(),
    getTransferAliases(),
    getTransferActivity(),
    getTransferCapabilities(),
  ]);

  return (
    <TreasuryView
      balances={balances.status === 'fulfilled' ? balances.value.balances : []}
      balanceError={balances.status === 'rejected'}
      fundingCapabilities={funding.status === 'fulfilled' ? funding.value.capabilities : []}
      fundingError={funding.status === 'rejected'}
      aliases={aliases.status === 'fulfilled' ? aliases.value.data : []}
      aliasError={aliases.status === 'rejected'}
      transfers={transfers.status === 'fulfilled' ? transfers.value.data : []}
      transferError={transfers.status === 'rejected'}
      transferCapabilities={transferCapabilities.status === 'fulfilled' ? transferCapabilities.value.capabilities : []}
    />
  );
}
