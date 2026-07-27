import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";

export interface LoginHistoryRow {
  id: string;
  user_id: string;
  event_type: string;
  user_agent: string | null;
  created_at: string;
  user_email: string | null;
}

export interface TrustedDeviceRow {
  id: string;
  user_id: string;
  device_id: string;
  user_agent: string | null;
  last_seen_at: string;
  user_email: string | null;
}

export async function getLoginHistory(params: {
  limit?: number;
  userId?: string;
}): Promise<LoginHistoryRow[]> {
  const db = createSupabaseAdminClient();
  const limit = params.limit ?? 100;

  let query = db
    .from("login_history")
    .select("id, user_id, event_type, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (params.userId) query = query.eq("user_id", params.userId);

  const { data } = await query;
  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: profiles } = await db
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return data.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    event_type: r.event_type,
    user_agent: r.user_agent,
    created_at: r.created_at,
    user_email: profileMap.get(r.user_id) ?? null
  }));
}

export async function getTrustedDevices(): Promise<TrustedDeviceRow[]> {
  const db = createSupabaseAdminClient();

  const { data } = await db
    .from("trusted_devices")
    .select("id, user_id, device_id, user_agent, last_seen_at")
    .order("last_seen_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: profiles } = await db
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return data.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    device_id: r.device_id,
    user_agent: r.user_agent,
    last_seen_at: r.last_seen_at,
    user_email: profileMap.get(r.user_id) ?? null
  }));
}
