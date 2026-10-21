import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function InvestProductNotFound() {
  return (
    <div className="op-stack invest-detail">
      <section className="op-panel invest-empty" aria-labelledby="invest-not-found-title">
        <h1 id="invest-not-found-title">This product is not in the catalog</h1>
        <p>It may not have been published yet, or it may have been withdrawn.</p>
        <Link href="/dashboard/invest" className="op-inline-link">
          Back to Invest <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
