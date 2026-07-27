import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";

export const PAGE_SIZE = 50;

export interface AllocationRow {
  id: string;
  profile_id: string;
  asset: string | null;
  amount: number | null;
  status: string;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

export async function getPendingAllocations(): Promise<AllocationRow[]> {
  const db = createSupabaseAdminClient();

  const { data } = await db
    .from("capital_allocation_requests")
    .select("id, profile_id, asset, amount, status, notes, reviewed_by, reviewed_at, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) return [];

  const profileIds = [...new Set(data.map((r) => r.profile_id))];
  const { data: profiles } = await db
    .from("profiles")
    .select("id, email, full_name")
    .in("id", profileIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return data.map((r) => {
    const p = profileMap.get(r.profile_id);
    return {
      id: r.id,
      profile_id: r.profile_id,
      asset: r.asset,
      amount: r.amount,
      status: r.status,
      notes: r.notes,
      reviewed_by: r.reviewed_by,
      reviewed_at: r.reviewed_at,
      created_at: r.created_at,
      user_email: p?.email ?? null,
      user_name: p?.full_name ?? null
    };
  });
}

export async function getAllocationHistory(params: {
  page?: number;
  status?: string;
}): Promise<{ rows: AllocationRow[]; total: number }> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 0;
  const offset = page * PAGE_SIZE;

  let query = db
    .from("capital_allocation_requests")
    .select("id, profile_id, asset, amount, status, notes, reviewed_by, reviewed_at, created_at", {
      count: "exact"
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.status) query = query.eq("status", params.status);

  const { data, count } = await query;
  if (!data || data.length === 0) return { rows: [], total: count ?? 0 };

  const profileIds = [...new Set(data.map((r) => r.profile_id))];
  const { data: profiles } = await db
    .from("profiles")
    .select("id, email, full_name")
    .in("id", profileIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const rows: AllocationRow[] = data.map((r) => {
    const p = profileMap.get(r.profile_id);
    return {
      id: r.id,
      profile_id: r.profile_id,
      asset: r.asset,
      amount: r.amount,
      status: r.status,
      notes: r.notes,
      reviewed_by: r.reviewed_by,
      reviewed_at: r.reviewed_at,
      created_at: r.created_at,
      user_email: p?.email ?? null,
      user_name: p?.full_name ?? null
    };
  });

  return { rows, total: count ?? 0 };
}
