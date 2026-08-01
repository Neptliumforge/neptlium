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
  cta = 'Explore Neptlium',
  ctaHref = '/contact',
}: {
  eyebrow: string;
  title: string;
  intro: string;
  anchors: string[];
  cards: FoundationCard[];
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
      <nav className="border-b border-line bg-surface-subtle" aria-label="Page sections">
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
          <p className="eyebrow">The role</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink md:text-3xl">
            A clear foundation for deliberate capital decisions.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            This experience is designed to connect information, context and control. It gives the
            wider Neptlium platform a coherent place to grow without implying data, advice or
            execution that is not available.
          </p>
        </div>
      </Section>
      <Section tone="surface">
        <div id={anchors[1]?.toLowerCase().replaceAll(' ', '-')} className="container-page">
          <div className="grid gap-5 md:grid-cols-2">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-line bg-background p-6 md:p-8"
              >
                <p className="eyebrow">Foundation</p>
                <h2 className="mt-3 text-xl font-semibold text-ink">{card.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{card.body}</p>
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
          <p className="eyebrow">Next step</p>
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">
            Continue with the wider operating environment.
          </h2>
          <Link className="button" href={ctaHref}>
            {cta} <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </Section>
    </>
  );
}
