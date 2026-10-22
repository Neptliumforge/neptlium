'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export function GlobalConversionCta() {
  const isHome = usePathname() === '/';
  if (isHome)
    return (
      <section
        className="elite-conversion marketing-conversion"
        aria-labelledby="global-conversion-title"
      >
        <div className="elite-conversion-shell">
          <div className="elite-conversion-copy">
            <p className="elite-conversion-eyebrow">Capital, intelligently managed.</p>
            <h2 id="global-conversion-title">Your capital deserves a clearer perspective.</h2>
            <p className="elite-conversion-lead">Begin with a more informed view.</p>
          </div>
          <div className="elite-conversion-actions">
            <a className="elite-conversion-primary" href={SITE.personalSignUpUrl}>
              Get started <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    );
  return (
    <section
      className="elite-conversion marketing-conversion"
      aria-labelledby="global-conversion-title"
    >
      <div className="elite-conversion-shell">
        <div className="elite-conversion-copy">
          <p className="elite-conversion-eyebrow">Neptlium</p>
          <h2 id="global-conversion-title">Choose how you use Neptlium.</h2>
          <p className="elite-conversion-lead">
            Explore capital for personal investing or treasury for organizational financial
            operations.
          </p>
        </div>
        <div className="elite-conversion-actions elite-conversion-dual">
          <a className="elite-conversion-primary" href={SITE.personalSignUpUrl}>
            <span>Open Neptlium Capital</span>
            <ArrowRight aria-hidden="true" />
          </a>
          <Link className="elite-conversion-secondary" href="/treasury">
            <span>Explore Neptlium Treasury</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
