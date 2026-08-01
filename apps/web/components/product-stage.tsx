'use client';
import { useState } from 'react';
import { Activity, CircleSlash2, Landmark, Layers3, LockKeyhole } from 'lucide-react';
import { Reveal } from './reveal';
const views = [
  [
    'Overview',
    'Backend required',
    'Capital overview unavailable',
    'Connect verified data infrastructure to establish an operating view.',
    Activity,
  ],
  [
    'Portfolio',
    'Observed allocation unavailable',
    'Portfolio data unavailable',
    'Portfolio intelligence depends on connected, verified sources.',
    Layers3,
  ],
  [
    'Capital Account',
    'Provider not configured',
    'Capital Account unavailable',
    'Account provisioning and provider configuration are required before this capability can be accessed.',
    Landmark,
  ],
  [
    'Treasury',
    'Backend required',
    'Treasury position unavailable',
    'Liquidity, reserves and readiness require authoritative backend data.',
    CircleSlash2,
  ],
  [
    'Allocation',
    'Authorization unavailable',
    'Authorization unavailable',
    'Modeling does not move capital. Execution infrastructure is not represented as active.',
    LockKeyhole,
  ],
] as const;
export function ProductStage() {
  const [active, setActive] = useState(0);
  const [name, state, title, copy, Icon] = views[active];
  return (
    <section className="product-stage">
      <Reveal>
        <div className="section-lead">
          <p className="eyebrow">Product experience</p>
          <h2>Truthful state is an interface decision.</h2>
          <p>
            Move through the exact operating areas used by the authenticated application. Every view
            remains explicit about missing infrastructure.
          </p>
        </div>
      </Reveal>
      <Reveal className="stage-shell">
        <div className="stage-rail">
          <span>Neptlium / {name}</span>
          <span className="status">Illustrative interface</span>
        </div>
        <div className="stage-layout">
          <nav aria-label="Product experience views">
            {views.map((item, i) => (
              <button
                key={item[0]}
                type="button"
                className={i === active ? 'active' : ''}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                {item[0]}
              </button>
            ))}
          </nav>
          <div className="stage-canvas" aria-live="polite">
            <div className="stage-diagram" aria-hidden="true">
              <span />
              <i />
              <i />
              <i />
            </div>
            <div className="stage-state">
              <Icon aria-hidden="true" />
              <p className="status">{state}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </div>
          <aside>
            <p className="eyebrow">Infrastructure state</p>
            <dl>
              <div>
                <dt>Data source</dt>
                <dd>Not connected</dd>
              </div>
              <div>
                <dt>Authorization</dt>
                <dd>Unavailable</dd>
              </div>
              <div>
                <dt>Operations</dt>
                <dd>Backend required</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}
