import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';

export type FoundationCard = { title: string; body: string; href?: string };

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
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: title }]}
      />
      <nav className="border-b border-line" aria-label="Page sections">
        <div className="container-page flex gap-5 overflow-x-auto py-4 text-sm text-muted">
          {anchors.map((anchor) => (
            <a
              key={anchor}
              href={`#${anchor.toLowerCase().replaceAll(' ', '-')}`}
              className="whitespace-nowrap hover:text-ink"
            >
              {anchor}
            </a>
          ))}
        </div>
      </nav>
      <Section>
        <div id={anchors[0].toLowerCase().replaceAll(' ', '-')} className="mx-auto max-w-3xl">
          <h2 className="mt-3 text-2xl font-semibold text-ink md:text-3xl">
            {lead?.[0] ?? cards[0]?.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            {lead?.[1] ?? cards[0]?.body}
          </p>
        </div>
      </Section>
      {visual && <Section className="product-visual-section">{visual}</Section>}
      <Section tone="surface">
        <div id={anchors[1]?.toLowerCase().replaceAll(' ', '-')} className="container-page">
          <div className="route-rows">
            {cards.map((card) => (
              <article
                key={card.title}
              >
                <h2>{card.title}</h2>
                <p>{card.body}</p>
                {card.href && (
                  <Link
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink"
                    href={card.href}
                  >
                    Explore <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div
          id={anchors[2]?.toLowerCase().replaceAll(' ', '-')}
          className="mx-auto flex max-w-3xl flex-col items-start gap-5"
        >
          {principle && <p className="route-principle">{principle}</p>}
          <Link className="button" href={ctaHref}>
            {cta} <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </Section>
    </>
  );
}
