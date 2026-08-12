import { adminApiRequest } from "@/lib/api";
export const PAGE_SIZE = 50;
export interface TransactionRow {
  id: string; profile_id: string; type: string; asset: string | null; amount: number | null; status: string;
  reference: string | null; created_at: string; user_email: string | null; user_name: string | null;
}
export async function getTransactions(params: { page?: number; type?: string; status?: string; search?: string }) {
  const query = new URLSearchParams({ page: String(params.page ?? 0) });
  if (params.type) query.set("type", params.type);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  return adminApiRequest<{ rows: TransactionRow[]; total: number }>(`/v1/admin/transactions?${query}`);
}
