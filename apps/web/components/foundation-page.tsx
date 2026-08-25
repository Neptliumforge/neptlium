import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export type FoundationCard = { title: string; body: string; href?: string };

const anchorId = (anchor: string | undefined, fallback: string) =>
  anchor?.toLowerCase().replaceAll(' ', '-') || fallback;

export function FoundationPage({
  eyebrow,
  title,
  intro,
  anchors,
  cards,
  lead,
  principle,
  visual,
  cta = 'Explore Neptlium',
  ctaHref = '/contact',
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  anchors: string[];
  cards: FoundationCard[];
  lead?: readonly [string, string];
  principle?: string;
  visual?: React.ReactNode;
  cta?: string;
  ctaHref?: string;
}) {
  const overviewId = anchorId(anchors[0], 'overview');
  const systemsId = anchorId(anchors[1], 'systems');
  const principleId = anchorId(anchors[2], 'principle');

  return (
    <div className="route-product-page">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: title }]}
      />

      <nav className="route-product-nav" aria-label="Page sections">
        <div className="container-page">
          {anchors.map((anchor) => (
            <a key={anchor} href={`#${anchorId(anchor, 'section')}`}>
              {anchor}
            </a>
          ))}
        </div>
      </nav>

      <section className="route-product-showcase" id={overviewId}>
        <div className="container-page route-product-showcase-grid">
          <div className="route-product-copy">
            <span className="route-product-kicker">Product overview</span>
            <h2>{lead?.[0] ?? cards[0]?.title}</h2>
            <p>{lead?.[1] ?? cards[0]?.body}</p>
            {principle && (
              <strong className="route-product-principle" id={principleId}>
                {principle}
              </strong>
            )}
            <Link className="route-product-link" href={ctaHref}>
              {cta} <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {visual && <div className="route-product-visual">{visual}</div>}
        </div>
      </section>

      <section className="route-product-capabilities" id={systemsId}>
        <div className="container-page">
          <div className="route-product-capability-grid">
            {cards.map((card) => (
              <article key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                {card.href && (
                  <Link href={card.href}>
                    Explore <ArrowRight aria-hidden="true" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
