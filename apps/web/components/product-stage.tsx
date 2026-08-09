'use client';
import { useState } from 'react';
import { Activity, Landmark, Layers3, LockKeyhole, ScanSearch } from 'lucide-react';
import { Reveal } from './reveal';
const views = [
  [
    'Overview',
    'Capital position',
    'A concise command surface for accounts, allocation and activity.',
    Activity,
  ],
  [
    'Portfolio',
    'Portfolio Intelligence',
    'Composition and asset structure begin with authoritative portfolio data.',
    Layers3,
  ],
  [
    'Capital Account',
    'Governed account',
    'Funding and capital movement remain inside explicit account controls.',
    Landmark,
  ],
  [
    'Treasury',
    'Capital readiness',
    'Liquidity and reserve belong in the context of the whole portfolio.',
    ScanSearch,
  ],
  [
    'Allocation',
    'Deliberate decisions',
    'Observe, model, review and authorize without collapsing intent into execution.',
    LockKeyhole,
  ],
] as const;
export function ProductStage() {
  const [active, setActive] = useState(0);
  const [name, title, copy, Icon] = views[active];
  return (
    <section className="product-stage">
      <Reveal>
        <div className="section-lead">
          <h2>Built around the capital decision, not the transaction.</h2>
          <p>
            Real Neptlium product areas, shown without illustrative balances or fabricated activity.
          </p>
        </div>
      </Reveal>
      <Reveal className="stage-shell">
        <div className="stage-rail">
          <span>Neptlium / {name}</span>
          <span className="status">Interface architecture</span>
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
              <p className="status">Product system</p>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </div>
          <aside>
            <p className="eyebrow">Operating principle</p>
            <dl>
              <div>
                <dt>Observe</dt>
                <dd>See clearly</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>Act deliberately</dd>
              </div>
              <div>
                <dt>Authorize</dt>
                <dd>Keep control explicit</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}
