import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@neptlium/ui';
import { loadProposedOrders, proposedOrderAmount } from '@/lib/api/investment-orders';
import styles from '../styles.module.css';

const journey = [
  'Listings',
  'Order details',
  'Eligibility and disclosures',
  'Enrollment intent',
  'Payment instructions',
  'Payment verification',
  'Enrollment processing',
  'Dashboard',
];

export default async function OrderDetailsPage({
  params,
}: {
  readonly params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const catalog = await loadProposedOrders();
  const order = catalog?.listings.find((listing) => listing.id === orderId);
  if (catalog && !order) notFound();
  return (
    <div className={`op-stack ${styles.workspace}`}>
      <header className="op-page-header">
        <div>
          <p className="op-eyebrow">Investment Order Enrollment · Preview</p>
          <h1>{order?.name ?? 'Order details unavailable'}</h1>
          <p>Review the proposal and what must be established before enrollment.</p>
        </div>
        <Link className="op-button" href="/dashboard/listings">
          All listings
        </Link>
      </header>
      {order && (
        <section className={styles.summary}>
          <Badge tone="neutral">Unavailable · approval pending</Badge>
          <p className={styles.amount}>
            {proposedOrderAmount(order)} <span>USD proposed amount</span>
          </p>
          <p>{order.durationMonths} months · proposed term</p>
          <p>Return terms are not established. No funds are being accepted.</p>
          <Button disabled aria-describedby="enrollment-unavailable">
            Enrollment unavailable
          </Button>
          <p id="enrollment-unavailable" className={styles.caption}>
            Enrollment can open only after the required offering and legal approvals.
          </p>
        </section>
      )}
      {!catalog && (
        <p role="status">The proposal could not be loaded. Enrollment remains unavailable.</p>
      )}
      <section className="op-panel" aria-labelledby="disclosures-title">
        <div className="op-section-heading">
          <div>
            <span>Eligibility and disclosures</span>
            <h2 id="disclosures-title">Required before any investment</h2>
          </div>
        </div>
        <dl className={styles.requirements}>
          {(catalog?.requirements ?? ['Offering documentation', 'Legal approval']).map(
            (requirement) => (
              <div key={requirement}>
                <dt>{requirement}</dt>
                <dd>Pending</dd>
              </div>
            ),
          )}
        </dl>
        <p className="op-footnote">
          Capital would be at risk. No return rate, guaranteed profit, payout schedule, principal
          protection or regulatory approval is represented.
        </p>
      </section>
      <section className="op-panel" aria-labelledby="journey-title">
        <div className="op-section-heading">
          <div>
            <span>Proposed journey</span>
            <h2 id="journey-title">From review to enrollment</h2>
          </div>
        </div>
        <ol className={styles.journey}>
          {journey.map((step, index) => (
            <li key={step} aria-current={index === 1 ? 'step' : undefined}>
              <span className={styles.stepIndex}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{step}</strong>
                <p>
                  {index === 1
                    ? 'Proposal review'
                    : index < 1
                      ? 'Preview'
                      : 'Unavailable until approval'}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="op-footnote">
          Payment verification, compliance review and investment allocation are separate decisions.
          A payment confirmation would not establish enrollment or an earned return.
        </p>
      </section>
      <Link className="op-button" href="/dashboard">
        Return to dashboard
      </Link>
    </div>
  );
}
