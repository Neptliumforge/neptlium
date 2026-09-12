import Link from 'next/link';
import { ArrowLeft, ArrowRight, Banknote, Coins, ShieldCheck } from 'lucide-react';
import { requireProvisionedUser } from '@/lib/auth';
import { getFundingCapabilities } from '@/lib/api/financial';

export default async function DepositRoute() {
  await requireProvisionedUser();
  const capabilityResult = await getFundingCapabilities().catch(() => null);
  const capabilities = capabilityResult?.capabilities ?? [];
  const enabled = capabilities.filter((capability) => capability.state === 'ENABLED');

  return (
    <div className="deposit-experience">
      <header className="deposit-header">
        <Link className="deposit-back-link" href="/dashboard/capital-account">
          <ArrowLeft size={15} aria-hidden="true" /> Capital Account
        </Link>
        <p className="investor-eyebrow">Funding</p>
        <h1>Deposit funds</h1>
        <p>Choose how you want to fund your Neptlium capital account. Availability is determined by your account and the currently verified funding rails.</p>
      </header>

      <section className="deposit-method-grid" aria-label="Deposit methods">
        <Link className="deposit-method-card" href="/dashboard/deposit/crypto">
          <div className="deposit-method-icon"><Coins size={22} aria-hidden="true" /></div>
          <div>
            <span>Crypto</span>
            <h2>Deposit digital assets</h2>
            <p>Select an available asset and network, create a governed funding intent, and receive network-specific deposit instructions.</p>
          </div>
          <div className="deposit-method-footer">
            <span>{capabilityResult ? `${enabled.length} rail${enabled.length === 1 ? '' : 's'} currently enabled` : 'Availability unavailable'}</span>
            <strong>Continue <ArrowRight size={15} aria-hidden="true" /></strong>
          </div>
        </Link>

        <div className="deposit-method-card is-disabled" aria-disabled="true">
          <div className="deposit-method-icon"><Banknote size={22} aria-hidden="true" /></div>
          <div>
            <span>USD</span>
            <h2>Deposit U.S. dollars</h2>
            <p>USD funding will use a dedicated Stripe capital-funding flow after the approved payment contract, webhook attribution, settlement, and reconciliation path are production verified.</p>
          </div>
          <div className="deposit-method-footer">
            <span>Not yet enabled</span>
            <strong>Stripe capital funding pending</strong>
          </div>
        </div>
      </section>

      <section className="deposit-trust-panel" aria-label="Funding safeguards">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>Funding instructions are account-specific.</strong>
          <p>Neptlium does not credit a balance because a user clicks Done. Deposits become financial state only after verified observation, posting, settlement, and reconciliation.</p>
        </div>
      </section>
    </div>
  );
}
