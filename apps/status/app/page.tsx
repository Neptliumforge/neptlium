const services = [
  'Neptlium Website',
  'Neptlium Capital',
  'Neptlium Treasury',
  'Neptlium API',
  'Neptlium Pay',
  'Provider Ingress',
  'Notifications',
  'Documents',
] as const;

export default function StatusPage() {
  return <main className="status-shell">
    <div className="status-brand">NEPTLIUM</div>
    <h1 className="status-title">Neptlium Status</h1>
    <p className="status-copy">Public service health, incidents and scheduled maintenance. This foundation does not infer uptime from deployment state and does not fabricate historical availability.</p>
    <section className="status-overall"><div><span className="status-unknown">Overall state</span><strong> Status data unavailable</strong></div><span className="status-pill">Provider not configured</span></section>
    <section className="status-section"><h2>Services</h2><div className="status-list">{services.map((service) => <div className="status-row" key={service}><strong>{service}</strong><span>Not yet connected to a public status source</span></div>)}</div></section>
    <section className="status-section"><h2>Incidents</h2><div className="status-empty"><strong>No incident history is published yet.</strong>Incident records will support Investigating, Identified, Monitoring and Resolved states once a public status backend or provider is configured.</div></section>
    <section className="status-section"><h2>Scheduled maintenance</h2><div className="status-empty"><strong>No maintenance schedule is published.</strong>This is not equivalent to a claim that no internal maintenance exists.</div></section>
  </main>;
}
