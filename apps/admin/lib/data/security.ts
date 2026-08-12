import { adminApiRequest } from "@/lib/api";
export interface LoginHistoryRow {
  id: string; user_id: string; event_type: string; user_agent: string | null; created_at: string; user_email: string | null;
}
export interface TrustedDeviceRow {
  id: string; user_id: string; device_id: string; user_agent: string | null; last_seen_at: string; user_email: string | null;
}
export async function getLoginHistory(params: { limit?: number; userId?: string }) {
  const query = new URLSearchParams({ limit: String(params.limit ?? 100) });
  if (params.userId) query.set("user_id", params.userId);
  return adminApiRequest<LoginHistoryRow[]>(`/v1/admin/security/login-history?${query}`);
}
export async function getTrustedDevices() {
  return adminApiRequest<TrustedDeviceRow[]>("/v1/admin/security/trusted-devices");
}
