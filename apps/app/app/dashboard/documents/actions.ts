"use server";

import { requireUser } from "@/lib/auth";
import { getDocumentDownloadUrl } from "@/lib/api/client";

export type SignedDownloadResult = { readonly ok: true; readonly url: string } | { readonly ok: false; readonly error: string };

export async function getSignedDownloadUrlAction(documentId: string): Promise<SignedDownloadResult> {
  await requireUser();
  try {
    const result = await getDocumentDownloadUrl(documentId);
    return { ok: true, url: result.url };
  } catch {
    return { ok: false, error: "Unable to generate a download link. Please try again." };
  }
}
