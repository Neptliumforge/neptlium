import { adminApiRequest } from "@/lib/api";
export const PAGE_SIZE = 50;
export interface AllocationRow {
  id: string; profile_id: string; asset: string | null; amount: number | null; status: string; notes: string | null;
  reviewed_by: string | null; reviewed_at: string | null; created_at: string; user_email: string | null; user_name: string | null;
}
export async function getPendingAllocations() {
  return adminApiRequest<AllocationRow[]>("/v1/admin/allocations/pending");
}
export async function getAllocationHistory(params: { page?: number; status?: string }) {
  const query = new URLSearchParams({ page: String(params.page ?? 0) });
  if (params.status) query.set("status", params.status);
  return adminApiRequest<{ rows: AllocationRow[]; total: number }>(`/v1/admin/allocations?${query}`);
}
