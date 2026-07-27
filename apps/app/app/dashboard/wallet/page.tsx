import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireProvisionedUser } from "@/lib/auth";
import { WalletView, type WalletTransaction } from "./WalletView";
export default async function WalletPage() {
  const { profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("wallet_transactions").select("id,type,asset,network,amount,status,created_at").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(50);
  return <WalletView transactions={(data ?? []) as WalletTransaction[]} historyError={Boolean(error)} />;
}
