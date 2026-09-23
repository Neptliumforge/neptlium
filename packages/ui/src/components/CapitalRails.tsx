import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { cn } from './utils/cn';

export type CapitalRailVariant =
  | 'movement'
  | 'position'
  | 'allocation'
  | 'evidence'
  | 'treasury'
  | 'infrastructure'
  | 'security';

export type CapitalRailNodeState =
  | 'neutral'
  | 'active'
  | 'evidence'
  | 'authorized'
  | 'reconciling'
  | 'complete'
  | 'restricted'
  | 'failed';

export interface CapitalRailNode {
  readonly label: string;
  readonly state?: CapitalRailNodeState;
}

const markPaths = [
  'M9 17.5C23 17.5 38 13.5 54 6.5',
  'M10 38.5C19.5 36.5 25.5 28.5 34.5 27.5C43 26.5 49 21.5 54.5 16',
  'M30.5 52C35.5 45.5 44.5 45.5 50.5 51.5',
] as const;

const variantTransform: Record<CapitalRailVariant, readonly [string, string, string]> = {
  movement: ['translate(0 0)', 'translate(0 0)', 'translate(0 0)'],
  position: ['translate(0 2)', 'translate(0 0)', 'translate(0 -2)'],
  allocation: ['translate(-2 -1)', 'translate(0 0)', 'translate(3 1)'],
  evidence: ['translate(0 0)', 'translate(1 -1)', 'translate(-1 1)'],
  treasury: ['translate(-1 2)', 'translate(0 0)', 'translate(2 -3)'],
  infrastructure: ['translate(-2 0)', 'translate(2 0)', 'translate(0 -1)'],
  security: ['translate(0 1)', 'translate(0 -1)', 'translate(0 1)'],
};

const nodeTone: Record<CapitalRailNodeState, string> = {
  neutral: 'var(--rail-node)',
  active: 'var(--rail-active)',
  evidence: 'var(--rail-evidence)',
  authorized: 'var(--rail-authority)',
  reconciling: 'var(--rail-reconciling)',
  complete: 'var(--color-status-complete)',
  restricted: 'var(--color-status-restricted)',
  failed: 'var(--color-status-failed)',
};

export function CapitalRails({
  variant = 'movement',
  nodes = [],
  active = true,
  className,
  label = 'Neptlium Capital Rails',
  decorative = false,
}: {
  readonly variant?: CapitalRailVariant;
  readonly nodes?: readonly CapitalRailNode[];
  readonly active?: boolean;
  readonly className?: string;
  readonly label?: string;
  readonly decorative?: boolean;
}): ReactElement {
  const transforms = variantTransform[variant];
  const positions = [
    [18, 17], [31, 15], [45, 11],
    [17, 36], [34, 28], [49, 20],
    [35, 49], [49, 51],
  ] as const;
  return (
    <figure
      className={cn('n-capital-rails', `n-capital-rails--${variant}`, active && 'is-active', className)}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      data-capital-rails={variant}
    >
      <svg viewBox="0 0 64 64" role={decorative ? undefined : 'img'} aria-hidden="true">
        <g className="n-capital-rails__shadow" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
          {markPaths.map((d, index) => <path key={d} d={d} transform={transforms[index]} />)}
        </g>
        <g className="n-capital-rails__structure" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round">
          {markPaths.map((d, index) => <path key={d} d={d} transform={transforms[index]} pathLength="1" />)}
        </g>
        <g className="n-capital-rails__signal" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round">
          <path d={markPaths[1]} transform={transforms[1]} pathLength="1" />
        </g>
        {nodes.slice(0, positions.length).map((node, index) => (
          <circle
            key={`${node.label}-${index}`}
            cx={positions[index][0]}
            cy={positions[index][1]}
            r={node.state === 'active' ? 1.8 : 1.35}
            fill={nodeTone[node.state ?? 'neutral']}
            className="n-capital-rails__node"
          />
        ))}
      </svg>
      {!decorative && nodes.length > 0 ? (
        <figcaption className="n-capital-rails__legend">
          {nodes.map((node) => (
            <span key={node.label}>
              <i style={{ '--rail-legend-tone': nodeTone[node.state ?? 'neutral'] } as CSSProperties} aria-hidden="true" />
              {node.label}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function CapitalRailStage({
  index,
  label,
  state = 'neutral',
  children,
}: {
  readonly index: number;
  readonly label: string;
  readonly state?: CapitalRailNodeState;
  readonly children?: ReactNode;
}) {
  return (
    <li className="n-capital-rail-stage" data-rail-state={state}>
      <span className="n-capital-rail-stage__index">{String(index + 1).padStart(2, '0')}</span>
      <i className="n-capital-rail-stage__node" style={{ '--rail-stage-tone': nodeTone[state] } as CSSProperties} aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        {children ? <span>{children}</span> : null}
      </div>
    </li>
  );
}
