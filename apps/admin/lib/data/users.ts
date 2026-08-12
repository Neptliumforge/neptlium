import { adminApiRequest } from "@/lib/api";

export const PAGE_SIZE = 50;
export interface AdminUserRow {
  id: string; email: string | null; full_name: string | null; display_name: string | null;
  compliance_status: string | null; investor_type: string | null; provisioned_at: string | null; role: string | null;
}
export interface AdminUserDetail extends AdminUserRow {
  wallets: Array<{ id: string; provider: string | null; created_at: string }>;
  transactions: Array<{ id: string; type: string; asset: string | null; amount: number | null; status: string; created_at: string }>;
  loginHistory: Array<{ id: string; event_type: string; user_agent: string | null; created_at: string }>;
}
export async function getUsers(params: { page?: number; search?: string; status?: string }) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  return adminApiRequest<{ rows: AdminUserRow[]; total: number }>(`/v1/admin/users?${query}`);
}
export async function getUserById(id: string): Promise<AdminUserDetail | null> {
  return adminApiRequest<AdminUserDetail | null>(`/v1/admin/users/${encodeURIComponent(id)}`);
}
export async function getDashboardStats() {
  return adminApiRequest<{
    totalUsers: number; pendingCompliance: number; pendingWithdrawals: number; pendingAllocations: number;
    recentTransactions: Array<{ id: string; type: string; asset: string | null; amount: number | null; status: string; created_at: string }>;
  }>("/v1/admin/dashboard");
}
