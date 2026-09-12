import Link from 'next/link';
import { SITE } from '@/lib/content/site';

export function GlobalConversionCta() {
  return (
    <section className="elite-conversion" aria-labelledby="global-conversion-title">
      <div className="elite-conversion-shell">
        <div className="elite-conversion-copy">
          <p className="elite-conversion-eyebrow">Capital operating infrastructure</p>
          <h2 id="global-conversion-title">Capital deserves an operating environment.</h2>
          <p className="elite-conversion-lead">
            Bring capital state, operating context and governed action into one intelligible system.
          </p>
        </div>

        <div className="elite-conversion-actions">
          <Link className="elite-conversion-primary" href={SITE.publicAccessUrl}>
            {SITE.publicAccessLabel}
          </Link>
          <Link className="elite-conversion-secondary" href={SITE.exploreUrl}>
            {SITE.exploreLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
