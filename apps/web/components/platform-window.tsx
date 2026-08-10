import {
  ArrowRight,
  Briefcase,
  CircleUserRound,
  Landmark,
  LayoutDashboard,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
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
    <div className="platform-window" aria-label="Illustrative view of the Neptlium platform">
      <div className="platform-window-glow" aria-hidden="true" />
      <aside className="platform-window-sidebar">
        <div className="platform-window-brand">
          <Brand />
        </div>
        <nav aria-label="Neptlium platform preview navigation">
          {nav.map(([label, Icon], index) => (
            <div className={`platform-window-nav-item ${index === 0 ? 'is-active' : ''}`} key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </nav>
        <div className="platform-window-sidebar-foot">
          <span>Governed environment</span>
          <i aria-hidden="true" />
        </div>
      </aside>

      <section className="platform-window-canvas">
        <header className="platform-window-topbar">
          <div>
            <span>Overview</span>
            <small>Capital operating environment</small>
          </div>
          <div className="platform-window-profile" aria-hidden="true">
            <CircleUserRound />
          </div>
        </header>

        <div className="platform-window-content">
          <div className="platform-window-heading">
            <span>Overview</span>
            <h3>Capital position</h3>
            <p>Your capital position and next decisions.</p>
          </div>

          <section className="platform-window-position" aria-label="Capital position preview">
            <div className="platform-window-total">
              <span>Total capital</span>
              <strong>—</strong>
            </div>
            <div className="platform-window-metrics">
              {['Available', 'Allocated', 'Reserve'].map((label) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>—</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="platform-window-account">
            <div className="platform-window-section-head">
              <div>
                <span>Capital Account</span>
                <small>Supported digital capital</small>
              </div>
              <ArrowRight aria-hidden="true" />
            </div>
            <div className="platform-window-assets">
              {assets.map(([asset, network]) => (
                <div key={asset}>
                  <span className="platform-window-asset-mark" aria-hidden="true">
                    {asset.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{asset}</strong>
                    <small>{network}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="platform-window-lower-grid">
            <section>
              <span>Allocation</span>
              <h4>Current policy</h4>
              <p>Not configured</p>
              <a href="/allocation">Create model <ArrowRight aria-hidden="true" /></a>
            </section>
            <section>
              <span>Treasury</span>
              <h4>Liquidity position</h4>
              <div className="platform-window-mini-metrics">
                <div><small>Available</small><strong>—</strong></div>
                <div><small>Reserve</small><strong>—</strong></div>
              </div>
            </section>
          </div>

          <section className="platform-window-activity">
            <div className="platform-window-section-head">
              <div>
                <span>Capital Activity</span>
                <small>Recent account and capital events</small>
              </div>
              <ArrowRight aria-hidden="true" />
            </div>
            <p>No activity yet. Capital activity will appear here.</p>
          </section>
        </div>
      </section>
    </div>
  );
}
