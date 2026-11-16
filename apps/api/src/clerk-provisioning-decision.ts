/**
 * Preview-only provisioning decision boundary. This does not write to the DB.
 * Provisioning must occur in one separately reviewed atomic server-side command;
 * a matching email must never be treated as proof of account ownership.
 */
export type ClerkProvisioningDecision =
  | { readonly action: 'existing'; readonly principalId: string }
  | { readonly action: 'create-new' }
  | { readonly action: 'deny'; readonly reason: 'invalid-subject' | 'ambiguous-link' | 'inactive-principal' | 'storage-unavailable' };

export interface ClerkProvisioningLookup {
  findActiveLinks(subject: string): Promise<readonly { principalId: string; principalActive: boolean }[]>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function decideClerkPreviewProvisioning(
  environment: string | undefined,
  verifiedSubject: string,
  lookup: ClerkProvisioningLookup,
): Promise<ClerkProvisioningDecision> {
  if (environment !== 'preview' || !/^user_[A-Za-z0-9]{8,128}$/.test(verifiedSubject))
    return { action: 'deny', reason: 'invalid-subject' };
  let links: readonly { principalId: string; principalActive: boolean }[];
  try {
    links = await lookup.findActiveLinks(verifiedSubject);
  } catch {
    return { action: 'deny', reason: 'storage-unavailable' };
  }
  if (!Array.isArray(links)) return { action: 'deny', reason: 'storage-unavailable' };
  if (links.length > 1) return { action: 'deny', reason: 'ambiguous-link' };
  if (links.length === 0) return { action: 'create-new' };
  const link = links[0];
  if (!link || !UUID.test(link.principalId) || !link.principalActive)
    return { action: 'deny', reason: 'inactive-principal' };
  return { action: 'existing', principalId: link.principalId };
}
