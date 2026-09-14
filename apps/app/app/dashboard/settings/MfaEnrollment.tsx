export function MfaEnrollment() {
  return (
    <section className="border border-border-subtle bg-surface-primary p-4" aria-labelledby="mfa-heading">
      <h2 id="mfa-heading" className="text-sm font-medium text-text-primary">Multi-factor authentication</h2>
      <p className="mt-2 text-sm leading-6 text-text-muted">
        MFA enrollment is currently unavailable in this interface. No factor is added or removed from the browser without a governed Supabase Auth flow.
      </p>
    </section>
  );
}
