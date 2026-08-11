/**
 * Capital Precision authentication field.
 *
 * Authentication uses the same Paper environment as the customer product.
 * Depth comes from neutral Paper planes and a single structural boundary,
 * never Blue atmosphere, glow, or decorative grid effects.
 */
export function AuthBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-canvas">
      <div className="absolute inset-x-0 top-0 h-px bg-border-hairline" />
      <div className="absolute inset-x-0 bottom-0 h-[22vh] border-t border-border-hairline bg-surface-2/35" />
    </div>
  );
}
