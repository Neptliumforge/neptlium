import Link from 'next/link';
import chrome from './site-chrome.module.css';
import { SITE } from '@/lib/content/site';

export function GlobalConversionCta() {
  return (
    <section className={chrome.conversionSection} aria-labelledby="global-conversion-title">
      <div className={chrome.conversionShell}>
        <div className={chrome.conversionCopy}>
          <p className={chrome.conversionEyebrow}>Capital operating infrastructure</p>
          <h2 id="global-conversion-title">Capital deserves an operating environment.</h2>
          <p className={chrome.conversionLead}>
            Bring capital state, operating context and governed action into one intelligible system.
          </p>
        </div>

        <div className={chrome.conversionActions}>
          <Link className={chrome.conversionPrimary} href={SITE.publicAccessUrl}>
            {SITE.publicAccessLabel}
          </Link>
          <Link className={chrome.conversionSecondary} href={SITE.exploreUrl}>
            {SITE.exploreLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
