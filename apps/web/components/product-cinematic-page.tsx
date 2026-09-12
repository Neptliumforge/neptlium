import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export type ProductCinematicProps = {
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  tone: 'carbon' | 'marine' | 'stone' | 'navy';
  thesis: string;
  chapters: readonly { title: string; body: string }[];
  lifecycle: readonly string[];
  closing: string;
  next?: { label: string; href: string };
};

export function ProductCinematicPage(props: ProductCinematicProps) {
  return (
    <div className={`cin-product-page cin-tone-${props.tone}`}>
      <section className="cin-product-hero">
        <div className="cin-product-hero-copy">
          <p className="cin-kicker">{props.index} · {props.eyebrow}</p>
          <h1>{props.title}</h1>
          <p className="cin-product-lead">{props.lead}</p>
          <Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>
            {SITE.publicAccessLabel}<ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <figure className="cin-product-object">
          <img src={props.image} alt={props.imageAlt} />
          <figcaption>Illustrative product interface concept. Values shown are fictional examples.</figcaption>
        </figure>
      </section>

      <section className="cin-product-thesis">
        <p className="cin-kicker">Operating responsibility</p>
        <h2>{props.thesis}</h2>
      </section>

      <section className="cin-product-chapters">
        {props.chapters.map((chapter, index) => (
          <article key={chapter.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </article>
        ))}
      </section>

      <section className="cin-product-lifecycle" aria-label={`${props.eyebrow} operating lifecycle`}>
        <p className="cin-kicker">Clarity before consequence</p>
        <div>{props.lifecycle.map((item, index) => <span key={item}>{item}{index < props.lifecycle.length - 1 ? <i>→</i> : null}</span>)}</div>
      </section>

      <section className="cin-product-close">
        <h2>{props.closing}</h2>
        {props.next ? <Link href={props.next.href}>Continue to {props.next.label}<ArrowRight aria-hidden="true" /></Link> : null}
      </section>
    </div>
  );
}
