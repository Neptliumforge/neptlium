export type PlatformOwnerType = 'individual' | 'organization';
export type PlatformOwnerStatus = 'active' | 'suspended' | 'retired';
export type OrganizationRole = 'owner' | 'admin' | 'approver' | 'operator' | 'viewer' | 'auditor';
export type AccountOwnerType = PlatformOwnerType;
export type FinancialAccountClass = 'asset' | 'liability' | 'equity' | 'income' | 'expense' | 'memo';
export type CanonicalAssetKind = 'native' | 'token' | 'fiat' | 'security' | 'fund' | 'other';

export interface PlatformOwnerRef {
  readonly type: PlatformOwnerType;
  readonly id: string;
}

export interface OrganizationMembership {
  readonly organizationId: string;
  readonly userId: string;
  readonly role: OrganizationRole;
  readonly status: 'active' | 'suspended' | 'revoked';
}

export interface CanonicalAssetIdentity {
  readonly symbol: string;
  readonly networkIdentifier: string;
  readonly contractAddress?: string | null;
  readonly decimals: number;
  readonly kind: CanonicalAssetKind;
}

export interface LedgerPostingInput {
  readonly accountId: string;
  readonly owner: PlatformOwnerRef;
  readonly assetKey: string;
  readonly direction: 'debit' | 'credit';
  readonly amountAtomic: string;
}

export function normalizeUuid(value: string, field = 'id'): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
    throw new Error(`${field} must be a UUID`);
  }
  return normalized;
}

export function normalizeOwner(owner: PlatformOwnerRef): PlatformOwnerRef {
  if (owner.type !== 'individual' && owner.type !== 'organization') throw new Error('unsupported owner type');
  return { type: owner.type, id: normalizeUuid(owner.id, 'owner id') };
}

export function canonicalAssetKey(input: Pick<CanonicalAssetIdentity, 'symbol' | 'networkIdentifier' | 'contractAddress'>): string {
  const symbol = input.symbol.trim().toUpperCase();
  const network = input.networkIdentifier.trim().toLowerCase();
  if (!/^[A-Z0-9._-]{1,32}$/.test(symbol)) throw new Error('invalid asset symbol');
  if (!/^[a-z0-9._:-]{2,64}$/.test(network)) throw new Error('invalid network identifier');
  const contract = input.contractAddress?.trim().toLowerCase() || 'native';
  if (contract !== 'native' && !/^0x[0-9a-f]{40}$/.test(contract)) throw new Error('invalid contract address');
  return `${network}:${symbol}:${contract}`;
}

export function validateCanonicalAsset(input: CanonicalAssetIdentity): CanonicalAssetIdentity & { readonly assetKey: string } {
  if (!Number.isInteger(input.decimals) || input.decimals < 0 || input.decimals > 36) throw new Error('asset decimals out of range');
  const normalizedContract = input.contractAddress?.trim().toLowerCase() || null;
  if (input.kind === 'token' && !normalizedContract) throw new Error('token assets require a contract address');
  if ((input.kind === 'native' || input.kind === 'fiat') && normalizedContract) throw new Error(`${input.kind} assets cannot have a contract address`);
  const assetKey = canonicalAssetKey({ ...input, contractAddress: normalizedContract });
  return {
    ...input,
    symbol: input.symbol.trim().toUpperCase(),
    networkIdentifier: input.networkIdentifier.trim().toLowerCase(),
    contractAddress: normalizedContract,
    assetKey,
  };
}

export function canActForOrganization(role: OrganizationRole, action: 'read' | 'operate' | 'approve' | 'administer'): boolean {
  const grants: Record<OrganizationRole, readonly string[]> = {
    owner: ['read', 'operate', 'approve', 'administer'],
    admin: ['read', 'operate', 'approve', 'administer'],
    approver: ['read', 'approve'],
    operator: ['read', 'operate'],
    viewer: ['read'],
    auditor: ['read'],
  };
  return grants[role].includes(action);
}

export function requireActiveMembership(membership: OrganizationMembership, organizationId: string): OrganizationMembership {
  if (membership.status !== 'active') throw new Error('organization membership is not active');
  if (normalizeUuid(membership.organizationId, 'organization id') !== normalizeUuid(organizationId, 'organization id')) {
    throw new Error('organization membership scope mismatch');
  }
  return membership;
}

export function validateBalancedLedgerPostings(postings: readonly LedgerPostingInput[]): void {
  if (postings.length < 2) throw new Error('ledger journal requires at least two postings');
  const owner = normalizeOwner(postings[0]!.owner);
  const totals = new Map<string, bigint>();
  for (const posting of postings) {
    const postingOwner = normalizeOwner(posting.owner);
    if (postingOwner.type !== owner.type || postingOwner.id !== owner.id) throw new Error('cross-owner ledger journal is forbidden');
    if (!/^\d+$/.test(posting.amountAtomic) || BigInt(posting.amountAtomic) <= 0n) throw new Error('posting amount must be a positive atomic integer');
    if (!posting.assetKey.trim()) throw new Error('posting asset key is required');
    const signed = posting.direction === 'debit' ? BigInt(posting.amountAtomic) : -BigInt(posting.amountAtomic);
    totals.set(posting.assetKey, (totals.get(posting.assetKey) ?? 0n) + signed);
  }
  for (const [assetKey, total] of totals) {
    if (total !== 0n) throw new Error(`ledger journal is unbalanced for ${assetKey}`);
  }
}
