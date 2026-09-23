import Link from 'next/link';
import type { ReactNode } from 'react';

export const settingsDestinations = [
  ['Profile', '/dashboard/settings/profile'],
  ['Account', '/dashboard/settings/account'],
  ['Security', '/dashboard/settings/security'],
  ['Verification', '/dashboard/settings/verification'],
  ['Addresses', '/dashboard/settings/addresses'],
  ['Payment methods', '/dashboard/settings/payment-methods'],
  ['Appearance', '/dashboard/settings/appearance'],
  ['Notifications', '/dashboard/settings/notifications'],
  ['Support', '/dashboard/settings/support'],
] as const;

export function SettingsShell({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="op-stack settings-experience">
      <header className="op-page-header">
        <div>
          <p className="op-eyebrow">Settings</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <div className="settings-layout">
        <nav aria-label="Settings navigation" className="settings-navigation">
          {settingsDestinations.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="settings-content">{children}</div>
      </div>
    </div>
  );
}

export function TruthfulUnavailable({
  title,
  detail,
}: {
  readonly title: string;
  readonly detail: string;
}) {
  return (
    <section className="op-panel">
      <div className="op-empty-row">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </section>
  );
}
