'use client';

import { useEffect, useRef, useState } from 'react';

const stages = [
  {
    label: 'Capital state',
    title: 'Know what exists.',
    body: 'Accounts, positions, liquidity and movement remain visible as evidence-backed state—not just numbers detached from their source.',
  },
  {
    label: 'Operating context',
    title: 'Know what it means.',
    body: 'Intent, constraints, timing, counterparties and exposure give financial state the context required for institutional understanding.',
  },
  {
    label: 'Governed work',
    title: 'Know what may happen next.',
    body: 'Review, authority and evidence stay explicit so proposed work does not become consequential simply because it moved through software.',
  },
] as const;

export function CinematicScrollStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(Number((visible.target as HTMLElement).dataset.stage ?? 0));
      },
      { rootMargin: '-34% 0px -34% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cin-story" aria-labelledby="operating-story-title">
      <div className="cin-story-stage" data-stage={active}>
        <div className="cin-story-visual" aria-hidden="true">
          <img src="/marketing/overview.webp" alt="" />
          <span className="cin-story-plane cin-story-plane-one" />
          <span className="cin-story-plane cin-story-plane-two" />
          <span className="cin-story-plane cin-story-plane-three" />
        </div>
      </div>
      <div className="cin-story-copy">
        <header className="cin-story-intro"><h2 id="operating-story-title">One environment. Distinct states of meaning.</h2></header>
        {stages.map((stage, index) => (
          <article className="cin-story-step" data-stage={index} ref={(node) => { refs.current[index] = node; }} key={stage.label}>
            <p className="cin-stage-label">{stage.label}</p>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </article>
        ))}
        <div className="cin-story-resolution"><span>Capital state</span><i>→</i><span>Context</span><i>→</i><span>Governance</span><i>→</i><span>Consequence</span></div>
      </div>
    </section>
  );
}
