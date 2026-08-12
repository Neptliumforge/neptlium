import { adminApiRequest } from "@/lib/api";
export const PAGE_SIZE = 50;
export interface WithdrawalRow {
  id: string; profile_id: string; asset: string | null; amount: number | null; status: string;
  reference: string | null; counterparty: string | null; created_at: string;
  user_email: string | null; user_name: string | null; governed: boolean;
}
export async function getPendingWithdrawals() {
  return adminApiRequest<{ rows: WithdrawalRow[]; totalAmount: number }>("/v1/admin/withdrawals/pending");
}
export async function getWithdrawalHistory(params: { page?: number; status?: string }) {
  const query = new URLSearchParams({ page: String(params.page ?? 0) });
  if (params.status) query.set("status", params.status);
  return adminApiRequest<{ rows: WithdrawalRow[]; total: number }>(`/v1/admin/withdrawals?${query}`);
}
