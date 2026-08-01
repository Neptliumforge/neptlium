'use client';

import { useState } from 'react';
import { ChevronDown, Send } from 'lucide-react';

export function FooterAccordion({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="footer-accordion">
      <button
        type="button"
        className="footer-accordion-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
      <div id={id} className="footer-accordion-panel" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

export function NewsletterBoundary() {
  const [status, setStatus] = useState<'idle' | 'error'>('idle');
  return (
    <form
      className="footer-newsletter-form"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus('error');
      }}
      noValidate
    >
      <label htmlFor="footer-email">Email address</label>
      <div className="footer-newsletter-input">
        <input id="footer-email" name="email" type="email" autoComplete="email" required />
        <button type="submit" aria-label="Subscribe to the Neptlium Briefing">
          <Send aria-hidden="true" />
        </button>
      </div>
      <p className="footer-newsletter-note">
        By subscribing, you consent to receive the Neptlium Briefing. Subscription delivery is not
        connected yet; no address is stored.
      </p>
      {status === 'error' && (
        <p className="footer-form-feedback" role="alert">
          The briefing is not accepting subscriptions yet. Please check back after the subscription
          service is connected.
        </p>
      )}
    </form>
  );
}

export function SocialIcon({ name }: { name: 'X' | 'Instagram' | 'MeWe' | 'GitHub' }) {
  return (
    <span className="social-text-mark" aria-hidden="true">
      {name === 'Instagram' ? 'IG' : name === 'GitHub' ? 'GH' : name === 'MeWe' ? 'M' : 'X'}
    </span>
  );
}
