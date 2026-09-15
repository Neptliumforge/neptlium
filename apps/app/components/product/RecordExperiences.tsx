'use client';

import Link from 'next/link';
import { ArrowRight, Bell, Building2, FileText, ShieldCheck, UserRound } from 'lucide-react';
import { useProductBootstrap } from './ProductBootstrapProvider';
import { ProductStateBadge } from './ProductState';
import { DownloadButton } from '@/app/dashboard/documents/DownloadButton';
import { NotificationItem } from '@/app/dashboard/notifications/NotificationItem';
import { MarkAllReadButton } from '@/app/dashboard/notifications/MarkAllReadButton';

function Header({ eyebrow, title, description, action }: { readonly eyebrow: string; readonly title: string; readonly description: string; readonly action?: React.ReactNode }) {
  return <header className="op-page-header"><div><p className="op-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action ? <div className="op-header-actions">{action}</div> : null}</header>;
}

function Heading({ label, title }: { readonly label: string; readonly title: string }) {
  return <div className="op-section-heading"><div><span>{label}</span><h2>{title}</h2></div></div>;
}

export function CompaniesExperience() {
  return <div className="op-stack">
    <Header eyebrow="Invest" title="Companies" description="Investment entities and portfolio context, without inferred exposure or invented valuation." />
    <section className="op-panel"><Heading label="Investment context" title="Companies"/><div className="op-evidence-canvas"><div className="op-evidence-grid" aria-hidden="true"/><div className="op-evidence-message"><Building2 size={18}/><strong>No authenticated company exposure projection is available</strong><p>Neptlium will not infer portfolio exposure from public market research. Company rows will appear here when investment relationships and position context are provided by an authoritative account projection.</p></div></div></section>
    <section className="op-panel"><Heading label="Research" title="Market context"/><div className="op-empty-row"><strong>Public company research remains separate from customer holdings.</strong><span>This separation prevents research coverage from being mistaken for an investment relationship.</span></div><Link className="op-inline-link" href="/dashboard/research">Open research <ArrowRight size={14}/></Link></section>
  </div>;
}

export function DocumentsExperience() {
  const { snapshot } = useProductBootstrap();
  const documents = snapshot.documents.state === 'READY' ? snapshot.documents.data : null;
  return <div className="op-stack"><Header eyebrow="Records" title="Documents" description="Statements, reports and account evidence associated with your governed capital state."/><section className="op-panel"><Heading label="Document record" title="Available files"/>{documents === null ? <div className="op-empty-row"><strong>Documents unavailable</strong><span>The document projection could not be loaded. No missing file is represented as an empty account.</span></div> : documents.length === 0 ? <div className="op-empty-row"><strong>No documents yet</strong><span>Statements, reports and account files will appear when they are recorded.</span></div> : <div className="op-document-list">{documents.map((document) => <div className="op-document-row" key={document.id}><FileText size={16}/><div><strong>{document.title}</strong><span>{document.category.replaceAll('_',' ')} · {new Date(document.createdAt).toLocaleDateString()}</span></div><DownloadButton documentId={document.id}/></div>)}</div>}</section></div>;
}

export function NotificationsExperience() {
  const { snapshot } = useProductBootstrap();
  const notifications = snapshot.notifications.state === 'READY' ? snapshot.notifications.data : null;
  const unread = notifications?.filter((item) => !item.readAt).length ?? 0;
  return <div className="op-stack"><Header eyebrow="Records" title="Notifications" description="Account, security and financial-lifecycle notices that require awareness or action." action={unread > 0 ? <MarkAllReadButton/> : undefined}/><section className="op-panel"><Heading label="Inbox" title={notifications ? `${unread} unread` : 'Notification state'}/>{notifications === null ? <div className="op-empty-row"><strong>Notifications unavailable</strong><span>The notification projection could not be loaded.</span></div> : notifications.length === 0 ? <div className="op-empty-row"><strong>No notifications</strong><span>There are no account notices recorded for this snapshot.</span></div> : <ul className="op-notification-list">{notifications.map((item) => <NotificationItem key={item.id} {...item}/>)}</ul>}</section></div>;
}

export function SettingsExperience() {
  const { snapshot } = useProductBootstrap();
  const settings = snapshot.settings.state === 'READY' ? snapshot.settings.data : null;
  const account = settings?.profile ?? snapshot.account;
  const security = settings?.securityActivity ?? [];
  return <div className="op-stack">
    <Header eyebrow="Account" title="Settings" description="Profile, identity verification and security for your personal Neptlium Capital account." />
    <section className="op-grid-2">
      <article className="op-panel"><Heading label="Profile" title="Personal account"/><div className="op-settings-list"><div><UserRound size={16}/><span><small>Name</small><strong>{account.fullName ?? account.displayName ?? 'Not provided'}</strong></span></div><div><Bell size={16}/><span><small>Email</small><strong>{account.email ?? 'Not provided'}</strong></span></div><div><ShieldCheck size={16}/><span><small>Identity status</small><strong>{account.complianceStatus ?? 'Not reported'}</strong></span></div></div><Link className="op-inline-link" href="/dashboard/verification">Identity verification <ArrowRight size={14}/></Link></article>
      <article className="op-panel"><Heading label="Business" title="Need an organization workspace?"/><div className="op-empty-row"><strong>Your personal Capital account stays separate.</strong><span>Neptlium Treasury creates or joins an organization with its own ownership, permissions and financial context.</span></div><Link className="op-inline-link" href="/dashboard/treasury-upgrade">Explore Treasury <ArrowRight size={14}/></Link></article>
    </section>
    <section className="op-panel"><Heading label="Security" title="Recent security activity"/>{settings === null ? <div className="op-empty-row"><strong>Security activity unavailable</strong><span>Settings could not be loaded.</span></div> : security.length === 0 ? <div className="op-empty-row"><strong>No recent security activity</strong><span>No security events are present in the current projection.</span></div> : <div className="op-security-list">{security.slice(0,12).map((event) => <div key={event.id}><ShieldCheck size={15}/><span><strong>{event.eventType.replaceAll('_',' ')}</strong><small>{new Date(event.createdAt).toLocaleString()}{event.userAgent ? ` · ${event.userAgent}` : ''}</small></span><ProductStateBadge state="AVAILABLE">Recorded</ProductStateBadge></div>)}</div>}</section>
  </div>;
}
