import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';
import styles from './status.module.css';

export const metadata = createPageMetadata({
  title: 'Neptlium Status',
  description: 'Public operational status for Neptlium services. Unknown state is shown when verified monitoring data is unavailable.',
  path: '/status',
  index: false,
});

const components = [
  ['Web', 'Public website'],
  ['Capital app', 'Authenticated customer application'],
  ['API', 'Privileged application programming interface'],
  ['Authentication', 'Identity and session services'],
  ['Provider integrations', 'External systems used by supported workflows'],
] as const;

export default function StatusPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.shell}>
          <strong>Neptlium Status</strong>
          <Link href="/">neptlium.com</Link>
        </div>
      </header>

      <section className={styles.state} aria-labelledby="status-title">
        <div className={styles.shell}>
          <div className={styles.stateMark} aria-hidden="true" />
          <div>
            <p>Current state</p>
            <h1 id="status-title">Status data unavailable</h1>
            <span>This public surface is not connected to a verified monitoring source, so Neptlium does not infer that systems are operational.</span>
          </div>
        </div>
      </section>

      <section className={styles.components} aria-labelledby="components-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <h2 id="components-title">Components</h2>
            <p>Unknown is a first-class state when current operational evidence is unavailable.</p>
          </div>
          <div className={styles.componentList}>
            {components.map(([name, description]) => (
              <div className={styles.component} key={name}>
                <div><strong>{name}</strong><span>{description}</span></div>
                <span className={styles.unknown}><i aria-hidden="true" />Unknown</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.history} aria-labelledby="history-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <h2 id="history-title">Incident history</h2>
            <p>No verified incident-history feed is connected to this surface. Incident counts and uptime percentages are therefore omitted rather than fabricated.</p>
          </div>
          <div className={styles.empty}>Historical status data unavailable</div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <span>Neptlium Status</span>
          <span>Operational information before brand expression.</span>
        </div>
      </footer>
    </main>
  );
}
