import type { CSSProperties, ReactElement } from "react";

export type NeptliumMarkTone = "teal" | "ink" | "paper" | "current";

export interface NeptliumMarkProps {
  readonly size?: number;
  readonly className?: string;
  readonly animated?: boolean;
  readonly tone?: NeptliumMarkTone;
}

const toneColor: Record<NeptliumMarkTone, string> = {
  teal: "#0F8F86",
  ink: "#101214",
  paper: "#F5F3EE",
  current: "currentColor",
};

/**
 * Canonical Neptlium flow mark.
 *
 * Three independent structural strokes express capital movement, coordination,
 * and convergence. This is the sole production mark geometry across Web, App,
 * Admin, icons, and generated brand assets.
 */
export function NeptliumMark({
  size = 22,
  className,
  animated = false,
  tone = "current",
}: NeptliumMarkProps): ReactElement {
  const style: CSSProperties = {
    color: toneColor[tone],
    ...(animated
      ? { animation: "neptlium-breathe 2.4s var(--motion-ease-in-out) infinite" }
      : {}),
  };

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label="Neptlium"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 17.5C23 17.5 38 13.5 54 6.5" />
        <path d="M10 38.5C19.5 36.5 25.5 28.5 34.5 27.5C43 26.5 49 21.5 54.5 16" />
        <path d="M30.5 52C35.5 45.5 44.5 45.5 50.5 51.5" />
      </g>
    </svg>
  );
}
