import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireProvisionedUser } from '@/lib/auth';
import { getFundingCapabilities } from '@/lib/api/financial';
import { CryptoDepositFlow } from './CryptoDepositFlow';

export default async function CryptoDepositPage() {
  await requireProvisionedUser();
  const result = await getFundingCapabilities().catch(() => null);

  return (
    <div className="deposit-experience">
      <header className="deposit-header deposit-header-compact">
        <Link className="deposit-back-link" href="/dashboard/deposit">
          <ArrowLeft size={15} aria-hidden="true" /> Deposit methods
        </Link>
        <p className="investor-eyebrow">Crypto deposit</p>
        <h1>Choose an asset and network</h1>
        <p>Only rails returned as enabled by Neptlium can create funding instructions. Never send an asset on a different network than the one shown.</p>
      </header>

      <CryptoDepositFlow
        capabilities={result?.capabilities ?? []}
        capabilityError={!result}
      />
    </div>
  );
}
