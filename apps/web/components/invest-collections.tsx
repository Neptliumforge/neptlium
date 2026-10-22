import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { COLLECTIONS } from '@/lib/content/invest';
import styles from '@/app/home-elite.module.css';
export function InvestCollections({ compact = false }: { compact?: boolean }) {
  return (
    <div className={styles.collections}>
      {(compact ? COLLECTIONS.slice(0, 3) : COLLECTIONS).map((item, index) => (
        <Link className={styles.collection} href={`/investments/${item.slug}`} key={item.slug}>
          <div className={styles.collectionImage}>
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
            />
          </div>
          <div className={styles.collectionBody}>
            <span className={styles.eyebrow}>0{index + 1} / Research only</span>
            <h3>
              {item.title}
              <ArrowUpRight aria-hidden="true" />
            </h3>
            <p>{item.summary}</p>
            <span className={styles.readLink}>
              Explore collection <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
