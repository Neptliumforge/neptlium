import { createHash, createPublicKey, randomBytes, verify as verifySignature } from 'node:crypto';
import bs58 from 'bs58';
import { address as bitcoinAddress, networks as bitcoinNetworks } from 'bitcoinjs-lib';
import { Verifier as Bip322Verifier } from 'bip322-js';
import { verifyMessage } from 'viem';
import { ApiError } from './errors.js';
import type { AddressFormat } from './asset-registry.js';
import { governedAssetDefinition } from './asset-registry.js';
import type { ProviderEnvironment } from './funding-domain.js';

export type TreasuryControllerType = 'NEPTLIUM' | 'PROVIDER';
export type TreasuryCustodyModel = 'SELF_CUSTODY' | 'PROVIDER_CUSTODY';
export type TreasuryDestinationVerificationState = 'PENDING_VERIFICATION' | 'VERIFIED' | 'FAILED';
export type TreasuryDestinationStatus = 'INACTIVE' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED';

export interface TreasuryDestinationIdentity {
  readonly environment: 'TEST' | 'LIVE';
  readonly asset: string;
  readonly network: string | null;
  readonly normalizedAddress: string | null;
}

export interface TreasuryDestinationSemantics {
  readonly controllerType: TreasuryControllerType;
  readonly custodyModel: TreasuryCustodyModel;
  readonly provider: string | null;
  readonly providerTreasuryId: string | null;
  readonly address: string | null;
  readonly normalizedAddress: string | null;
  readonly verificationState: TreasuryDestinationVerificationState;
  readonly verificationMethod: string | null;
  readonly verificationEvidenceDigest: string | null;
  readonly verifiedAt: string | null;
  readonly status: TreasuryDestinationStatus;
  readonly activatedAt: string | null;
}

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
export const TREASURY_OWNERSHIP_PURPOSE = 'NEPTLIUM_TREASURY_OWNERSHIP_VERIFICATION' as const;
export const TREASURY_CHALLENGE_TTL_MS = 5 * 60 * 1000;

export function normalizeEvmAddress(address: string): string {
  if (!EVM_ADDRESS.test(address)) {
    throw new ApiError(
      400,
      'invalid_treasury_destination_address',
      'EVM treasury destination must be 0x followed by exactly 40 hexadecimal characters',
    );
  }
  return address.toLowerCase();
}

/** Server-only normalization boundary. Unsupported formats fail closed. */
export function normalizeTreasuryDestinationAddress(
  format: AddressFormat,
  address: string,
): string {
  if (format === 'EVM') return normalizeEvmAddress(address);
  if (format === 'BITCOIN') {
    try {
      bitcoinAddress.toOutputScript(address, bitcoinNetworks.bitcoin);
      // Bech32/Bech32m may be canonicalized to lowercase after checksum and
      // mixed-case validation. Base58Check is case-sensitive and must remain
      // byte-for-byte stable.
      return /^bc1/i.test(address) ? address.toLowerCase() : address;
    } catch {
      throw new ApiError(
        400,
        'invalid_treasury_destination_address',
        'Bitcoin treasury destination must be a valid mainnet address with a valid checksum',
      );
    }
  }
  if (format === 'SOLANA') {
    try {
      const decoded = bs58.decode(address);
      if (decoded.length !== 32) throw new Error('invalid length');
      return bs58.encode(decoded);
    } catch {
      throw new ApiError(
        400,
        'invalid_treasury_destination_address',
        'Solana treasury destination must decode to exactly 32 bytes',
      );
    }
  }
  throw new ApiError(
    503,
    'treasury_address_validation_unavailable',
    `Treasury destination validation is not implemented for ${format}`,
  );
}

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export interface TreasuryOwnershipChallengeBinding {
  destinationId: string;
  normalizedAddress: string;
  network: string;
  networkIdentifier: string;
  environment: ProviderEnvironment;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
}

export function issueTreasuryOwnershipChallenge(
  input: Omit<TreasuryOwnershipChallengeBinding, 'nonce' | 'issuedAt' | 'expiresAt'>,
  now = new Date(),
) {
  const nonce = randomBytes(32).toString('base64url');
  const binding: TreasuryOwnershipChallengeBinding = {
    ...input,
    nonce,
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TREASURY_CHALLENGE_TTL_MS).toISOString(),
  };
  const message = [
    'Neptlium Treasury Ownership Verification',
    `purpose: ${TREASURY_OWNERSHIP_PURPOSE}`,
    `destination_id: ${binding.destinationId}`,
    `address: ${binding.normalizedAddress}`,
    `network: ${binding.network}`,
    `network_identifier: ${binding.networkIdentifier}`,
    `environment: ${binding.environment}`,
    `nonce: ${binding.nonce}`,
    `issued_at: ${binding.issuedAt}`,
    `expires_at: ${binding.expiresAt}`,
  ].join('\n');
  return { binding, message, nonceDigest: sha256(nonce), messageDigest: sha256(message) };
}

export function assertChallengeUsable(
  input: { consumedAt: string | null; expiresAt: string; attempts: number },
  now = new Date(),
) {
  if (input.consumedAt)
    throw new ApiError(
      409,
      'treasury_challenge_consumed',
      'Ownership challenge has already been consumed',
    );
  if (new Date(input.expiresAt).getTime() <= now.getTime())
    throw new ApiError(410, 'treasury_challenge_expired', 'Ownership challenge has expired');
  if (input.attempts >= 5)
    throw new ApiError(
      429,
      'treasury_challenge_attempts_exceeded',
      'Ownership challenge verification attempts are exhausted',
    );
}

export async function verifyEvmTreasuryOwnership(input: {
  address: string;
  message: string;
  signature: `0x${string}`;
}) {
  const valid = await verifyMessage({
    address: normalizeEvmAddress(input.address) as `0x${string}`,
    message: input.message,
    signature: input.signature,
  });
  if (!valid)
    throw new ApiError(
      400,
      'treasury_ownership_verification_failed',
      'Signature does not prove control of the treasury destination',
    );
}

export function verifySolanaTreasuryOwnership(input: {
  address: string;
  message: string;
  signature: string;
}) {
  const publicKey = bs58.decode(normalizeTreasuryDestinationAddress('SOLANA', input.address));
  let signature: Uint8Array;
  try {
    signature = Uint8Array.from(Buffer.from(input.signature, 'base64'));
  } catch {
    throw new ApiError(
      400,
      'treasury_ownership_verification_failed',
      'Invalid Solana signature encoding',
    );
  }
  if (signature.length !== 64)
    throw new ApiError(
      400,
      'treasury_ownership_verification_failed',
      'Invalid Solana signature length',
    );
  const spki = Buffer.concat([
    Buffer.from('302a300506032b6570032100', 'hex'),
    Buffer.from(publicKey),
  ]);
  const valid = verifySignature(
    null,
    Buffer.from(input.message, 'utf8'),
    createPublicKey({ key: spki, format: 'der', type: 'spki' }),
    signature,
  );
  if (!valid)
    throw new ApiError(
      400,
      'treasury_ownership_verification_failed',
      'Signature does not prove control of the treasury destination',
    );
}

export function verifyBitcoinTreasuryOwnership(input: {
  address: string;
  message: string;
  signature: string;
}) {
  const address = normalizeTreasuryDestinationAddress('BITCOIN', input.address);
  if (!input.signature || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.signature)) {
    throw new ApiError(
      400,
      'treasury_ownership_verification_failed',
      'Invalid Bitcoin BIP-322 signature encoding',
    );
  }
  try {
    // Strict mode prevents loose BIP-137 header substitution. Phantom returns the
    // BIP-322 signature bytes as base64, which is the verifier's accepted format.
    if (!Bip322Verifier.verifySignature(address, input.message, input.signature, true)) {
      throw new Error('signature mismatch');
    }
  } catch {
    throw new ApiError(
      400,
      'treasury_ownership_verification_failed',
      'Signature does not prove control of the treasury destination',
    );
  }
}

export function assertTreasuryActivationReady(input: {
  asset: string;
  network: string;
  environment: ProviderEnvironment;
  verificationState: TreasuryDestinationVerificationState;
  status: TreasuryDestinationStatus;
}) {
  if (input.verificationState !== 'VERIFIED' || input.status !== 'INACTIVE')
    throw new ApiError(
      409,
      'treasury_destination_not_activatable',
      'Destination must be verified and inactive before activation',
    );
  const definition = governedAssetDefinition(input.asset, input.network, input.environment);
  if (
    !definition ||
    !definition.productionEnabled ||
    definition.depositCapability !== 'ENABLED' ||
    definition.reconciliationCapability !== 'ENABLED'
  ) {
    throw new ApiError(
      409,
      'treasury_destination_operational_readiness_unavailable',
      'Governed observation, finality, deposit, and reconciliation readiness has not been proven',
    );
  }
}

export function treasuryDestinationIdentityKey(identity: TreasuryDestinationIdentity): string {
  return JSON.stringify([
    identity.environment,
    identity.asset,
    identity.network,
    identity.normalizedAddress,
  ]);
}

export function assertTreasuryDestinationSemantics(
  destination: TreasuryDestinationSemantics,
): void {
  if (
    destination.custodyModel === 'SELF_CUSTODY' &&
    (destination.controllerType !== 'NEPTLIUM' ||
      destination.provider !== null ||
      destination.providerTreasuryId !== null ||
      destination.address === null ||
      destination.normalizedAddress === null)
  ) {
    throw new ApiError(
      400,
      'validation_failed',
      'Self-custody treasury destination semantics are inconsistent',
    );
  }
  if (
    destination.custodyModel === 'PROVIDER_CUSTODY' &&
    (destination.controllerType !== 'PROVIDER' ||
      destination.provider === null ||
      destination.providerTreasuryId === null)
  ) {
    throw new ApiError(
      400,
      'validation_failed',
      'Provider-custody treasury destination semantics are inconsistent',
    );
  }
  if (
    destination.verificationState === 'VERIFIED' &&
    (destination.verifiedAt === null ||
      destination.verificationMethod === null ||
      destination.verificationMethod.trim().length === 0 ||
      destination.verificationEvidenceDigest === null ||
      destination.verificationEvidenceDigest.trim().length === 0)
  ) {
    throw new ApiError(
      400,
      'validation_failed',
      'Verified treasury destination requires method, evidence, and timestamp',
    );
  }
  if (
    destination.status === 'ACTIVE' &&
    (destination.verificationState !== 'VERIFIED' ||
      destination.verifiedAt === null ||
      destination.activatedAt === null)
  ) {
    throw new ApiError(
      400,
      'validation_failed',
      'Active treasury destination requires completed verification and activation',
    );
  }
}
