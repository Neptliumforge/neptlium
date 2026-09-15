import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export function GlobalConversionCta() {
  return <section className="elite-conversion marketing-conversion" aria-labelledby="global-conversion-title"><div className="elite-conversion-shell">
    <div className="elite-conversion-copy"><p className="elite-conversion-eyebrow">Neptlium</p><h2 id="global-conversion-title">Choose how you use Neptlium.</h2><p className="elite-conversion-lead">Personal investors enter Neptlium Capital. Businesses explore Neptlium Treasury for treasury and financial operations.</p></div>
    <div className="elite-conversion-actions elite-conversion-dual"><a className="elite-conversion-primary" href={SITE.personalSignUpUrl}>Open Neptlium Capital <ArrowRight aria-hidden="true" /></a><Link className="elite-conversion-secondary" href="/business">Explore Neptlium Treasury <ArrowRight aria-hidden="true" /></Link></div>
  </div></section>;
}
