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
        <Link className="deposit-back-link" href="/dashboard/capital">
          <ArrowLeft size={15} aria-hidden="true" /> Capital
        </Link>
        <p className="investor-eyebrow">Add money</p>
        <h1>Fund your account</h1>
        <p>Choose an available way to add money to your personal Neptlium Capital account.</p>
      </header>

      <section className="deposit-method-grid" aria-label="Funding methods">
        <Link className="deposit-method-card" href="/dashboard/deposit/crypto">
          <div className="deposit-method-icon"><Coins size={22} aria-hidden="true" /></div>
          <div>
            <span>Digital assets</span>
            <h2>Fund with crypto</h2>
            <p>Choose an available asset and network, then receive account-specific deposit instructions.</p>
          </div>
          <div className="deposit-method-footer">
            <span>{capabilityResult ? `${enabled.length} method${enabled.length === 1 ? '' : 's'} available` : 'Availability could not be verified'}</span>
            <strong>Continue <ArrowRight size={15} aria-hidden="true" /></strong>
          </div>
        </Link>

        <div className="deposit-method-card is-disabled" aria-disabled="true">
          <div className="deposit-method-icon"><Banknote size={22} aria-hidden="true" /></div>
          <div>
            <span>Bank / USD</span>
            <h2>Fund with U.S. dollars</h2>
            <p>Bank and USD funding will appear here after the payment, settlement and reconciliation path is verified for customer capital.</p>
          </div>
          <div className="deposit-method-footer"><span>Not yet available</span><strong>Coming after verification</strong></div>
        </div>
      </section>

      <section className="deposit-trust-panel" aria-label="Funding safeguards">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>Your balance changes only after funds are verified.</strong>
          <p>Creating deposit instructions does not credit your account. Pending funding appears in Activity while Neptlium verifies the transaction and updates your financial record.</p>
        </div>
      </section>
    </div>
  );
}
