import { cn } from "@neptlium/ui";

export interface NeptliumMarkProps {
  readonly size?: number;
  readonly animated?: boolean;
  readonly className?: string;
}

/**
 * Official Neptlium geometric mark.
 *
 * Composition: upper-left solid trapezoid, centre circle ring,
 * lower-right solid trapezoid — blue-to-cyan gradient treatment.
 * No bounding box or container shape.
 */
export function NeptliumMark({ size = 40, animated = false, className }: NeptliumMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: (size * 46) / 54 }}
    >
      <svg
        viewBox="0 0 54 46"
        width={size}
        height={(size * 46) / 54}
        className="relative"
        style={animated ? { animation: "neptlium-breathe 2.4s var(--motion-ease-in-out) infinite" } : undefined}
        role="img"
        aria-label="Neptlium"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neptlium-mark-gradient" x1="0" y1="0" x2="54" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1AA7FF" />
            <stop offset="100%" stopColor="#0B8CFF" />
          </linearGradient>
        </defs>
        {/* Upper-left trapezoid */}
        <polygon points="0,0 36,0 28,17 0,17" fill="url(#neptlium-mark-gradient)" />
        {/* Centre circle ring — overlaps the gap between the two trapezoids */}
        <circle cx="32" cy="21" r="8" stroke="url(#neptlium-mark-gradient)" strokeWidth="3" />
        {/* Lower-right trapezoid */}
        <polygon points="18,29 54,29 54,46 26,46" fill="url(#neptlium-mark-gradient)" />
      </svg>
    </span>
  );
}

