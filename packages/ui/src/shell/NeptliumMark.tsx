import {
  useId,
  type CSSProperties,
  type ReactElement,
} from "react";

export interface NeptliumMarkProps {
  readonly size?: number;
  readonly className?: string;
  readonly animated?: boolean;
}

/**
 * Canonical Neptlium mark.
 *
 * Geometry matches:
 * apps/web/public/icon.svg
 */
export function NeptliumMark({
  size = 22,
  className,
  animated = false,
}: NeptliumMarkProps): ReactElement {
  const gradientId = "neptlium-" + useId().replace(/:/g, "");
  const style: CSSProperties | undefined = animated
    ? {
        animation:
          "neptlium-breathe 2.4s var(--motion-ease-in-out) infinite",
      }
    : undefined;

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
      <defs>
        <linearGradient
          id={gradientId}
          x1="8"
          y1="8"
          x2="56"
          y2="56"
        >
          <stop stopColor="#2474ff" />
          <stop offset="1" stopColor="#55d9ff" />
        </linearGradient>
      </defs>

      <rect
        width="64"
        height="64"
        rx="10"
        fill="#030508"
      />

      <path
        d="M10 11h29l-8 14H10V11Z"
        fill={`url(#${gradientId})`}
      />

      <path
        d="M33 39h21v14H25l8-14Z"
        fill={`url(#${gradientId})`}
      />

      <circle
        cx="32"
        cy="32"
        r="8.5"
        fill="#030508"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
      />
    </svg>
  );
}
