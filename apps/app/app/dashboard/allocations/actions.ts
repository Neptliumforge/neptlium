"use server";

export type AllocationActionResult =
  | { readonly ok: true; readonly requestId: string }
  | { readonly ok: false; readonly error: string };

export async function submitAllocationRequestAction(
  _prevState: AllocationActionResult | null,
  _formData: FormData
): Promise<AllocationActionResult> {
  // Allocation execution is intentionally out of scope for the production
  // funding/treasury phase. Do not bypass apps/api or write allocation state
  // directly from the customer application.
  return {
    ok: false,
    error: "Allocation requests are not available while governed funding and treasury controls are being established."
  };
}
