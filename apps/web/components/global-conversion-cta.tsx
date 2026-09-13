import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export function GlobalConversionCta() {
  return <section className="elite-conversion marketing-conversion" aria-labelledby="global-conversion-title"><div className="elite-conversion-shell">
    <div className="elite-conversion-copy"><p className="elite-conversion-eyebrow">Neptlium</p><h2 id="global-conversion-title">Your capital deserves a better operating system.</h2><p className="elite-conversion-lead">Open an account to enter Neptlium’s governed capital environment, or explore the platform first.</p></div>
    <div className="elite-conversion-actions"><Link className="elite-conversion-primary" href={SITE.signUpUrl}>Open account <ArrowRight aria-hidden="true" /></Link><Link className="elite-conversion-secondary" href={SITE.exploreUrl}>Explore the platform</Link></div>
  </div></section>;
}
