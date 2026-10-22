import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COLLECTIONS } from '@/lib/content/invest';
import { DISCLOSURES } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../../home-elite.module.css';
export const dynamicParams = false;
export function generateStaticParams() {
  return COLLECTIONS.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = COLLECTIONS.find((item) => item.slug === slug);
  if (!item) notFound();
  return createPageMetadata({
    title: `${item.title} — Investment research`,
    description: item.summary,
    path: `/investments/${item.slug}`,
  });
}
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = COLLECTIONS.find((item) => item.slug === slug);
  if (!item) notFound();
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/investments">Investments</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{item.title}</span>
        </nav>
      </div>
      <section className={styles.discoveryHero}>
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>{item.eyebrow} / Research only</p>
            <h1>{item.title}</h1>
            <p className={styles.lead}>{item.summary}</p>
            <p>
              Educational collection. Not an investment product, recommendation or offer to buy or
              sell.
            </p>
            <ul className={styles.topicList} aria-label="Research topics">
              {item.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
          <figure className={styles.featureImage}>
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              preload
            />
            <figcaption>Editorial imagery / {item.title}</figcaption>
          </figure>
        </div>
      </section>
      <section className={`${styles.section} ${styles.tonal}`}>
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>A research framework</p>
            <h2>Look beyond the headline.</h2>
            <p>
              The questions below are a starting point for independent research. They do not
              establish a valuation, forecast or investment recommendation.
            </p>
          </div>
          <div className={styles.reading}>
            <ol>
              {item.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
            <h3>Risks to examine</h3>
            <p>{item.risks}</p>
            <p>
              Thematic exposure can concentrate risk. A compelling industry story does not guarantee
              a successful investment.
            </p>
            <Link className={styles.textLink} href="/risk-disclosure">
              Read the risk disclosures →
            </Link>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.shell}>
          <h2>Keep exploring.</h2>
          <nav className={styles.collectionNav} aria-label="More investment collections">
            {COLLECTIONS.filter((other) => other.slug !== item.slug).map((other) => (
              <Link key={other.slug} href={`/investments/${other.slug}`}>
                {other.title} →
              </Link>
            ))}
          </nav>
          <Link className={styles.textLink} href="/investments">
            All research collections →
          </Link>
        </div>
      </section>
      <div className={`${styles.shell} ${styles.disclosure}`}>
        <p>
          {DISCLOSURES.investment} {DISCLOSURES.general}
        </p>
      </div>
    </div>
  );
}
