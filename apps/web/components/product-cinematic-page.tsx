import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export type ProductCinematicProps = {
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
      <section className="product-cinema-hero">
        <div className="product-cinema-copy">
          <p className="product-name">{props.eyebrow}</p>
          <h1>{props.title}</h1>
          <p>{props.lead}</p>
          <Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="product-cinema-object" aria-label={props.imageAlt}>
          <img src={props.image} alt={props.imageAlt} />
        </div>
      </section>

      <section className="product-cinema-thesis">
        <h2>{props.thesis}</h2>
      </section>

      <section className="product-cinema-chapters">
        {props.chapters.map((chapter) => (
          <article key={chapter.title}>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </article>
        ))}
      </section>

      <section className="product-cinema-lifecycle" aria-label={`${props.eyebrow} lifecycle`}>
        <div className="lifecycle-track">
          {props.lifecycle.map((item, index) => <span key={item}>{item}{index < props.lifecycle.length - 1 ? <i>→</i> : null}</span>)}
        </div>
        <p>State changes are shown as state changes. Financial consequence remains explicit.</p>
      </section>

      <section className="product-cinema-close">
        <h2>{props.closing}</h2>
        <div>
          <Link className="cin-pill cin-pill-dark" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true" /></Link>
          {props.next ? <Link className="quiet-next" href={props.next.href}>Next: {props.next.label}<ArrowRight aria-hidden="true" /></Link> : null}
        </div>
      </section>
    </div>
  );
}
