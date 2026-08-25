import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AllocationVisual, OperatingModelVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Allocation — Neptlium Products',
  description:
    'See how Neptlium Allocation helps teams shape capital intent, review it deliberately and keep planning distinct from financial outcome.',
  path: '/products/allocation',
});

const decisionStages = [
  ['Intent', 'Describe how capital could be positioned.'],
  ['Constraints', 'Keep capital roles and operating limits visible in the model.'],
  ['Review', 'Make the proposed structure legible before it becomes consequential.'],
  ['Outcome', 'Keep any later financial result distinct from the model that preceded it.'],
] as const;

export default function AllocationPage() {
  return (
    <div className="product-story allocation-story">
      <section className="allocation-hero">
        <div className="web-shell allocation-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products · Allocation</p>
            <h1>Shape the decision before capital moves.</h1>
            <p>
              Allocation is where intent becomes explicit enough to inspect, challenge and review
              without pretending that a model is already an outcome.
            </p>
          </div>
          <div className="product-story-visual allocation-model-visual"><OperatingModelVisual /></div>
        </div>
      </section>

      <section className="allocation-decision-sequence" aria-labelledby="allocation-sequence-title">
        <div className="web-shell">
          <p className="web-eyebrow on-light">Decision structure</p>
          <h2 id="allocation-sequence-title">A useful allocation process preserves the distance between idea and consequence.</h2>
          <ol>
            {decisionStages.map(([title, body], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="allocation-workbench architecture-dark">
        <div className="web-shell allocation-workbench-grid">
          <div>
            <p className="web-eyebrow">Modeling</p>
            <h2>Capital roles make the model easier to reason about.</h2>
            <p>
              Allocation can express reserve, core, growth or other strategic roles without implying
              that an asset, provider or execution path is available.
            </p>
            <Link className="text-arrow-link on-dark" href="/products/capital-universe">
              Explore Capital Universe <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="product-story-visual"><AllocationVisual /></div>
        </div>
      </section>

      <section className="product-story-close">
        <div className="web-shell product-story-close-grid">
          <h2>Model clearly. Review deliberately. Keep intent separate from outcome.</h2>
          <Link className="text-arrow-link" href="/products/portfolio-intelligence">
            Continue to Portfolio Intelligence <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
