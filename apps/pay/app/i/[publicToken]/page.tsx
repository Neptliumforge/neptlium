export default async function PublicPaymentIntent({ params }: { readonly params: Promise<{ publicToken: string }> }) {
  const { publicToken } = await params;
  const tokenPresent = publicToken.trim().length >= 16;

  return <main className="pay-shell"><section className="pay-card">
    <div className="pay-brand">NEPTLIUM</div>
    <p className="pay-kicker">Secure payment</p>
    <h1 className="pay-title">Payment intent</h1>
    <p className="pay-copy">This public surface presents only server-authoritative payment intent state. A public token identifies the presentation context; it does not itself authorize settlement or mark an invoice paid.</p>
    <div className="pay-grid">
      <div className="pay-field"><span>Invoice</span><strong>—</strong></div>
      <div className="pay-field"><span>Amount due</span><strong>—</strong></div>
      <div className="pay-field"><span>Payment method</span><strong>Unavailable</strong></div>
      <div className="pay-field"><span>Network</span><strong>Unavailable</strong></div>
    </div>
    <div className="pay-state"><strong>{tokenPresent ? 'Payment execution unavailable' : 'Invalid payment link'}</strong><span>{tokenPresent ? 'No production payment-execution capability is connected to this public foundation. No Pay or Connect action is rendered until a governed server capability exists.' : 'The public payment token does not meet the required opaque-token shape.'}</span></div>
  </section></main>;
}
