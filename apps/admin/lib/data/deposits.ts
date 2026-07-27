import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";

export const PAGE_SIZE = 50;

export interface DepositRow {
  id: string;
  profile_id: string;
  asset: string | null;
  amount: number | null;
  status: string;
  reference: string | null;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

export async function getDeposits(params: {
  page?: number;
  status?: string;
}): Promise<{ rows: DepositRow[]; total: number }> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 0;
  const offset = page * PAGE_SIZE;

  let query = db
    .from("wallet_transactions")
    .select("id, profile_id, asset, amount, status, reference, created_at", {
      count: "exact"
    })
    .eq("type", "deposit")
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

  const rows: DepositRow[] = data.map((r) => {
    const p = profileMap.get(r.profile_id);
    return {
      id: r.id,
      profile_id: r.profile_id,
      asset: r.asset,
      amount: r.amount,
      status: r.status,
      reference: r.reference,
      created_at: r.created_at,
      user_email: p?.email ?? null,
      user_name: p?.full_name ?? null
    };
  });

  return { rows, total: count ?? 0 };
}
