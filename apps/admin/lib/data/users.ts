import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";

export const PAGE_SIZE = 50;

export interface AdminUserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  compliance_status: string | null;
  investor_type: string | null;
  provisioned_at: string | null;
  role: string | null;
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  compliance_status: string | null;
  investor_type: string | null;
  provisioned_at: string | null;
  role: string | null;
  wallets: Array<{ id: string; provider: string | null; created_at: string }>;
  transactions: Array<{
    id: string;
    type: string;
    asset: string | null;
    amount: number | null;
    status: string;
    created_at: string;
  }>;
  loginHistory: Array<{
    id: string;
    event_type: string;
    user_agent: string | null;
    created_at: string;
  }>;
}

export async function getUsers(params: {
  page?: number;
  search?: string;
  status?: string;
}): Promise<{ rows: AdminUserRow[]; total: number }> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 0;
  const offset = page * PAGE_SIZE;

  let query = db
    .from("profiles")
    .select("id, email, full_name, display_name, compliance_status, investor_type, provisioned_at", {
      count: "exact"
    })
    .order("provisioned_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.search) {
    query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`);
  }
  if (params.status) {
    query = query.eq("compliance_status", params.status);
  }

  const { data: profiles, count } = await query;

  if (!profiles) return { rows: [], total: 0 };

  // Fetch roles for all returned profiles
  const ids = profiles.map((p) => p.id);
  const { data: roleRows } = await db
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", ids);

  const roleMap = new Map((roleRows ?? []).map((r) => [r.user_id, r.role]));

  const rows: AdminUserRow[] = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    display_name: p.display_name,
    compliance_status: p.compliance_status,
    investor_type: p.investor_type,
    provisioned_at: p.provisioned_at,
    role: roleMap.get(p.id) ?? null
  }));

  return { rows, total: count ?? 0 };
}

export async function getUserById(id: string): Promise<AdminUserDetail | null> {
  const db = createSupabaseAdminClient();

  const [{ data: profile }, { data: roleRow }, { data: wallets }, { data: transactions }, { data: loginHistory }] =
    await Promise.all([
      db
        .from("profiles")
        .select("id, email, full_name, display_name, compliance_status, investor_type, provisioned_at")
        .eq("id", id)
        .maybeSingle(),
      db.from("user_roles").select("role").eq("user_id", id).maybeSingle(),
      db.from("wallets").select("id, provider, created_at").eq("profile_id", id),
      db
        .from("wallet_transactions")
        .select("id, type, asset, amount, status, created_at")
        .eq("profile_id", id)
        .order("created_at", { ascending: false })
        .limit(25),
      db
        .from("login_history")
        .select("id, event_type, user_agent, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    display_name: profile.display_name,
    compliance_status: profile.compliance_status,
    investor_type: profile.investor_type,
    provisioned_at: profile.provisioned_at,
    role: roleRow?.role ?? null,
    wallets: (wallets ?? []).map((w) => ({
      id: w.id,
      provider: w.provider,
      created_at: w.created_at
    })),
    transactions: (transactions ?? []).map((t) => ({
      id: t.id,
      type: t.type,
      asset: t.asset,
      amount: t.amount,
      status: t.status,
      created_at: t.created_at
    })),
    loginHistory: (loginHistory ?? []).map((l) => ({
      id: l.id,
      event_type: l.event_type,
      user_agent: l.user_agent,
      created_at: l.created_at
    }))
  };
}

export async function getDashboardStats() {
  const db = createSupabaseAdminClient();

  const [
    { count: totalUsers },
    { count: pendingCompliance },
    { count: pendingWithdrawals },
    { count: pendingAllocations },
    { data: recentTransactions }
  ] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("compliance_status", "pending"),
    db
      .from("wallet_transactions")
      .select("id", { count: "exact", head: true })
      .eq("type", "withdrawal")
      .in("status", ["pending", "pending_review"]),
    db
      .from("capital_allocation_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    db
      .from("wallet_transactions")
      .select("id, type, asset, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    pendingCompliance: pendingCompliance ?? 0,
    pendingWithdrawals: pendingWithdrawals ?? 0,
    pendingAllocations: pendingAllocations ?? 0,
    recentTransactions: recentTransactions ?? []
  };
}
