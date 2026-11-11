import { InvestExperience } from '@/components/product/OperatingExperience';
import Link from 'next/link';

export default function InvestPage() {
  return <div className="op-stack"><InvestExperience /><section className="op-panel">
    <div className="op-section-heading"><div><span>Investment Order Enrollment · Preview</span><h2>Neptlium Listings</h2></div></div>
    <p>Review proposed investment orders. Enrollment is unavailable and no funds are being accepted.</p>
    <Link className="op-button" href="/dashboard/listings">Explore proposed listings</Link>
  </section></div>;
}
