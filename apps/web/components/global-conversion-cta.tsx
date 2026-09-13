import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export function GlobalConversionCta() {
  return (
    <section className="elite-conversion marketing-conversion" aria-labelledby="global-conversion-title">
      <div className="elite-conversion-shell">
        <div className="elite-conversion-copy">
          <p className="elite-conversion-eyebrow">Neptlium</p>
          <h2 id="global-conversion-title">Build a clearer view of your capital.</h2>
          <p className="elite-conversion-lead">Create an account to enter the Neptlium capital environment, or explore the platform before you begin.</p>
        </div>
        <div className="elite-conversion-actions">
          <Link className="elite-conversion-primary" href={SITE.signUpUrl}>Get Started <ArrowRight aria-hidden="true" /></Link>
          <Link className="elite-conversion-secondary" href={SITE.exploreUrl}>Explore the Platform</Link>
        </div>
      </div>
    </section>
  );
}
