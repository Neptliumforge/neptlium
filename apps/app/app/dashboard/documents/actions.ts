"use server";

import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type SignedDownloadResult = { readonly ok: true; readonly url: string } | { readonly ok: false; readonly error: string };

const SIGNED_URL_EXPIRY_SECONDS = 60;

export async function getSignedDownloadUrlAction(documentId: string): Promise<SignedDownloadResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: document } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!document) {
    return { ok: false, error: "Document not found." };
  }

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.storage_path, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data) {
    return { ok: false, error: "Unable to generate a download link. Please try again." };
  }

  return { ok: true, url: data.signedUrl };
}
