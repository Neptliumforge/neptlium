import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export function DetailPage({
  eyebrow,
  title,
  intro,
  sections,
  visual,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: readonly (readonly [string, string])[];
  visual?: React.ReactNode;
}) {
  return (
    <div className="route-detail-page">
      <section className="route-detail-hero">
        <div className="container-page">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>

      {(visual || sections.length > 0) && (
        <section className="route-detail-showcase">
          <div className={`container-page ${visual ? 'has-visual' : ''}`}>
            <div className="route-detail-points">
              {sections.map(([heading, body]) => (
                <article key={heading}>
                  <h2>{heading}</h2>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            {visual && <div className="route-detail-visual">{visual}</div>}
          </div>
        </section>
      )}

      <section className="route-detail-action">
        <div className="container-page">
          <span>Neptlium</span>
          <h2>One operating environment for modern digital capital.</h2>
          <div>
            <a className="button" href={SITE.accessUrl}>
              Open Neptlium <ArrowRight aria-hidden="true" />
            </a>
            <Link href="/platform">Explore platform</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
