import { adminApiRequest } from "@/lib/api";
export const PAGE_SIZE = 50;
export interface DepositRow {
  id: string; profile_id: string; asset: string | null; amount: number | null; status: string;
  reference: string | null; created_at: string; user_email: string | null; user_name: string | null;
}
export async function getDeposits(params: { page?: number; status?: string }) {
  const query = new URLSearchParams({ page: String(params.page ?? 0) });
  if (params.status) query.set("status", params.status);
  return adminApiRequest<{ rows: DepositRow[]; total: number }>(`/v1/admin/deposits?${query}`);
}
