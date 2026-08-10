import type { CSSProperties, ReactElement } from "react";

export type NeptliumMarkTone = "blue" | "ink" | "paper" | "current";

export interface NeptliumMarkProps {
  readonly size?: number;
  readonly className?: string;
  readonly animated?: boolean;
  readonly tone?: NeptliumMarkTone;
}

const toneColor: Record<NeptliumMarkTone, string> = {
  blue: "#2764FF",
  ink: "#090B0F",
  paper: "#FFFFFF",
  current: "currentColor",
};

/**
 * Canonical production Neptlium mark.
 *
 * Geometry is derived from the approved abstract capital-structure identity.
 * Routine product chrome uses a flat, transparent rendering. Expressive
 * dimensional artwork remains reserved for selective brand contexts.
 */
export function NeptliumMark({
  size = 22,
  className,
  animated = false,
  tone = "blue",
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
      <path
        fill="currentColor"
        d="M6.07 9.85 6.2 19.75 7.13 21.34 10.72 25.06 10.72 25.86 7.79 30.17 7.06 32.83 7.13 54.02 22.54 43.72 23.73 41.86 23.67 31.17 24.73 31.44 33.16 43.79 37.61 49.3 41.13 52.69 43.99 54.02 46.98 54.15 49.03 53.42 51.16 51.89 55.48 46.05 57.07 42.26 57.73 39.07 57.54 11.78 43.06 22.87 42.13 24.66 42.26 31.17 41.4 31.24 34.22 23.13 29.44 19.28 26.45 13.9 23.93 11.38 22.01 10.45 19.15 9.79Z"
      />
    </svg>
  );
}
