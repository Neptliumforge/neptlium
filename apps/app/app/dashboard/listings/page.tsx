import Link from 'next/link';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { Badge } from '@neptlium/ui';
import { loadProposedOrders, proposedOrderAmount } from '@/lib/api/investment-orders';
import styles from './styles.module.css';

export default async function ListingsPage() {
  const catalog = await loadProposedOrders();
  return (
    <div className={`op-stack ${styles.workspace}`}>
      <header className="op-page-header">
        <div>
          <p className="op-eyebrow">Investment Order Enrollment · Preview</p>
          <h1>Neptlium Listings</h1>
          <p>Explore proposed investment orders. Enrollment is not available.</p>
        </div>
        <Link className="op-button" href="/dashboard/invest">
          Back to Invest
        </Link>
      </header>
      <aside className={styles.notice} aria-label="Offering availability">
        <LockKeyhole size={20} aria-hidden="true" />
        <div>
          <strong>Proposed products. Not open for investment.</strong>
          <p>
            Offering terms, eligibility, custody and legal approval remain pending. No funds are
            being accepted.
          </p>
        </div>
      </aside>
      {catalog ? (
        <section aria-label="Proposed investment orders" className={styles.grid}>
          {catalog.listings.map((order, index) => (
            <article key={order.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className="op-eyebrow">Order {String(index + 1).padStart(2, '0')}</span>
                <Badge tone="neutral">Proposed</Badge>
              </div>
              <h2>{order.name}</h2>
              <p className={styles.amount}>
                {proposedOrderAmount(order)} <span>USD</span>
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Proposed term</dt>
                  <dd>{order.durationMonths} months</dd>
                </div>
                <div>
                  <dt>Return terms</dt>
                  <dd>Not established</dd>
                </div>
              </dl>
              <p className={styles.caption}>
                Proposed amount only. Final terms and availability require approval.
              </p>
              <Link
                className={styles.details}
                href={`/dashboard/listings/${order.id}`}
                aria-label={`View ${order.name} proposal`}
              >
                View proposal <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>
      ) : (
        <section className="op-panel" role="status">
          <h2>Listings are temporarily unavailable</h2>
          <p>Proposed order details could not be loaded. Enrollment remains closed.</p>
        </section>
      )}
      <section className="op-panel">
        <div className="op-section-heading">
          <div>
            <span>Before enrollment</span>
            <h2>Understand the proposal</h2>
          </div>
        </div>
        <p>
          These concepts are intended as investment products, with potential loss of capital. Return
          rates, payout schedules and principal protection have not been established.
        </p>
        <p className="op-footnote">
          A proposed term is not a promise of liquidity or a payout date. No investment position is
          created by viewing a listing.
        </p>
      </section>
    </div>
  );
}
