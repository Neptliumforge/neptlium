'use client';

import { useEffect, useRef, useState } from 'react';

const stages = [
  {
    label: 'Capital state',
    title: 'Know what exists.',
    body: 'Accounts, positions, liquidity and movement become one evidence-backed view of the capital you actually have.',
    chips: ['Accounts', 'Positions', 'Liquidity', 'Movement'],
  },
  {
    label: 'Operating context',
    title: 'Understand what it means.',
    body: 'Intent, constraints, exposure, timing and counterparties stay attached to financial state so the number never loses its meaning.',
    chips: ['Intent', 'Constraints', 'Exposure', 'Timing'],
  },
  {
    label: 'Governed work',
    title: 'Know what may happen next.',
    body: 'Review, authority and evidence remain explicit so analysis can become action only when the operating state supports it.',
    chips: ['Review', 'Authority', 'Evidence', 'Consequence'],
  },
] as const;

export function CinematicScrollStory() {
  const root = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const node = root.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const next = Math.min(1, Math.max(0, -rect.top / travel));
      setProgress(next);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const active = progress < .34 ? 0 : progress < .68 ? 1 : 2;
  const rotation = -18 + progress * 36;
  const scale = .9 + progress * .13;

  return (
    <section className="story-engine" ref={root} aria-labelledby="story-engine-title">
      <div className="story-engine-sticky">
        <div className="story-engine-copy">
          <p className="story-engine-overline">One environment. Distinct states of meaning.</p>
          <h2 id="story-engine-title">{stages[active].title}</h2>
          <p className="story-engine-body">{stages[active].body}</p>
          <div className="story-engine-dots" aria-label="Operating model progress">
            {stages.map((stage, index) => <button key={stage.label} type="button" data-active={active === index} aria-label={stage.label} />)}
          </div>
        </div>
        <div className="story-engine-stage" aria-hidden="true">
          <div className="capital-object" style={{ transform: `perspective(1400px) rotateY(${rotation}deg) rotateX(${4 - progress * 8}deg) scale(${scale})` }}>
            <img src="/marketing/overview.webp" alt="" />
            <div className="capital-object-face capital-object-front">
              <span>{stages[active].label}</span>
              <strong>{active === 0 ? 'Observed state' : active === 1 ? 'Operating context' : 'Governed work'}</strong>
            </div>
            <div className="capital-object-grid">
              {stages[active].chips.map((chip) => <i key={chip}>{chip}</i>)}
            </div>
            <span className="capital-object-plane plane-a" />
            <span className="capital-object-plane plane-b" />
            <span className="capital-object-plane plane-c" />
          </div>
        </div>
      </div>
      <div className="story-engine-steps" aria-hidden="true">
        {stages.map((stage) => <div key={stage.label} />)}
      </div>
    </section>
  );
}
