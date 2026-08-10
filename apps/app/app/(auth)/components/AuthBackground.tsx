/**
 * Capital Precision authentication field.
 *
 * Authentication uses the same Paper environment as the customer product.
 * Depth comes from neutral Paper planes and hairlines, not Blue atmosphere.
 */
export function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-border-hairline" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-border-hairline opacity-40" />
      <div className="absolute inset-x-0 top-[38%] h-px bg-border-hairline opacity-35" />
    </div>
  );
}
