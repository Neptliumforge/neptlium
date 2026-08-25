import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CircleUserRound,
  Landmark,
  LayoutDashboard,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import { AssetIdentity } from '@neptlium/ui';
import { Brand } from './brand';

const nav = [
  ['Overview', LayoutDashboard],
  ['Portfolio', Briefcase],
  ['Capital Account', Wallet],
  ['Treasury', Landmark],
  ['Allocation', SlidersHorizontal],
] as const;

const assets = [
  ['USDC', 'Base'],
  ['ETH', 'Base'],
  ['BTC', 'Bitcoin'],
] as const;

export function PlatformWindow() {
  return (
    <section className="platform-window" aria-labelledby="platform-preview-title">
      <div className="platform-window-glow" aria-hidden="true" />
      <aside className="platform-window-sidebar" aria-label="Platform preview navigation">
        <div className="platform-window-brand"><Brand /></div>
        <nav aria-label="Neptlium platform preview navigation">
          {nav.map(([label, Icon], index) => (
            <div className={`platform-window-nav-item ${index === 0 ? 'is-active' : ''}`} aria-current={index === 0 ? 'page' : undefined} key={label}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </div>
          ))}
        </nav>
        <div className="platform-window-sidebar-foot"><span>Governed environment</span><i aria-hidden="true" /></div>
      </aside>

      <div className="platform-window-canvas">
        <header className="platform-window-topbar">
          <div><span>Platform preview</span><small>Capital operating environment</small></div>
          <div className="platform-window-profile" aria-hidden="true"><CircleUserRound /></div>
        </header>

        <div className="platform-window-content">
          <div className="platform-window-heading"><span>Overview</span><h3 id="platform-preview-title">Capital position</h3><p>Your capital position and next decisions.</p></div>
          <section className="platform-window-position" aria-label="Capital position preview">
            <div className="platform-window-total"><span>Total capital</span><strong aria-label="Unavailable">—</strong></div>
            <div className="platform-window-metrics">
              {['Available', 'Allocated', 'Reserve'].map((label) => <div key={label}><span>{label}</span><strong aria-label={`${label} unavailable`}>—</strong></div>)}
            </div>
          </section>

          <section className="platform-window-account" aria-labelledby="preview-capital-account">
            <div className="platform-window-section-head"><div><span id="preview-capital-account">Capital Account</span><small>Supported digital capital</small></div><ArrowRight aria-hidden="true" /></div>
            <div className="platform-window-assets">{assets.map(([asset, network]) => <div key={asset}><AssetIdentity asset={asset} network={network} size="sm" detailed /></div>)}</div>
          </section>

          <div className="platform-window-lower-grid">
            <section aria-labelledby="preview-allocation">
              <span id="preview-allocation">Allocation</span><h4>Current policy</h4><p>Not configured</p>
              <Link href="/products/allocation">Create model <ArrowRight aria-hidden="true" /></Link>
            </section>
            <section aria-labelledby="preview-treasury">
              <span id="preview-treasury">Treasury</span><h4>Liquidity position</h4>
              <div className="platform-window-mini-metrics"><div><small>Available</small><strong aria-label="Available unavailable">—</strong></div><div><small>Reserve</small><strong aria-label="Reserve unavailable">—</strong></div></div>
            </section>
          </div>

          <section className="platform-window-activity" aria-labelledby="preview-activity">
            <div className="platform-window-section-head"><div><span id="preview-activity">Capital Activity</span><small>Recent account and capital events</small></div><ArrowRight aria-hidden="true" /></div>
            <p>No activity yet. Capital activity will appear here.</p>
          </section>
        </div>
      </div>
    </section>
  );
}
