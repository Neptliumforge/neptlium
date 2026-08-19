import { ApiError } from './errors.js';
import type { AdminRepository } from './admin-repository.js';
import type { TreasuryDestinationRepository } from './treasury-destination-repository.js';
import { governedAssetDefinition } from './asset-registry.js';
import {
  assertChallengeUsable,
  assertTreasuryActivationReady,
  issueTreasuryOwnershipChallenge,
  normalizeTreasuryDestinationAddress,
  sha256,
  verifyEvmTreasuryOwnership,
  verifyBitcoinTreasuryOwnership,
  verifySolanaTreasuryOwnership,
} from './treasury-destination-domain.js';
import type { ProviderEnvironment } from './funding-domain.js';

type AdminContext = {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string | undefined>;
  body: unknown;
  requestId: string;
  clientAddress: string;
};
type User = { id: string };

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
}
function requireIdempotencyKey(context: AdminContext) {
  const value = context.headers['idempotency-key'];
  if (!value || value.length < 8 || value.length > 128)
    throw new ApiError(
      400,
      'idempotency_key_required',
      'A valid Idempotency-Key header is required',
    );
  return value;
}

export async function handleAdminRoute(
  context: AdminContext,
  deps: {
    repository: AdminRepository;
    treasuryRepository: TreasuryDestinationRepository;
    principal: User;
    environment: ProviderEnvironment;
  },
): Promise<{ status?: number; data: unknown }> {
  const actor = deps.principal;
  const role = await deps.repository.getRole(actor.id);
  if (role !== 'super_admin') {
    await deps.repository
      .audit(actor.id, 'admin.authorization.denied', 'admin_console', null, context.requestId, {
        required_role: 'super_admin',
        actual_role: role,
      })
      .catch(() => undefined);
    throw new ApiError(
      403,
      'admin_forbidden',
      'General Platform Administrator authorization is required',
    );
  }

  const audit = (
    operation: string,
    resourceType: string,
    resourceId: string | null,
    metadata: Record<string, unknown> = {},
  ) =>
    deps.repository.audit(
      actor.id,
      operation,
      resourceType,
      resourceId,
      context.requestId,
      metadata,
    );

  const { method, path, query } = context;
  if (method === 'GET' && path === '/v1/admin/session') {
    await audit('admin.session.read', 'admin_session', actor.id);
    return { data: await deps.repository.getSession(actor.id) };
  }
  if (method === 'GET' && path === '/v1/admin/treasury-destinations')
    return { data: await deps.treasuryRepository.list() };

  if (method === 'POST' && path === '/v1/admin/treasury-destinations') {
    assertObject(context.body);
    const idempotencyKey = requireIdempotencyKey(context);
    const asset = String(context.body.asset ?? '').toUpperCase();
    const network = String(context.body.network ?? '').toUpperCase();
    const address = String(context.body.address ?? '');
    const definition = governedAssetDefinition(asset, network, deps.environment);
    if (!definition)
      throw new ApiError(
        422,
        'unsupported_treasury_destination',
        'Asset, network, and runtime environment are not governed',
      );
    const normalizedAddress = normalizeTreasuryDestinationAddress(
      definition.addressFormat,
      address,
    );
    const requestDigest = sha256(
      JSON.stringify([asset, network, deps.environment, normalizedAddress]),
    );
    const destination = await deps.treasuryRepository.create({
      p_actor_id: actor.id,
      p_request_id: context.requestId,
      p_idempotency_key: idempotencyKey,
      p_request_digest: requestDigest,
      p_asset: asset,
      p_network: network,
      p_network_identifier: definition.chainId
        ? `eip155:${definition.chainId}`
        : definition.networkIdentifier,
      p_environment: deps.environment.toLowerCase(),
      p_address: address,
      p_normalized_address: normalizedAddress,
      p_address_format: definition.addressFormat.toLowerCase(),
    });
    return { status: 201, data: destination };
  }

  const destinationRead = path.match(/^\/v1\/admin\/treasury-destinations\/([^/]+)$/);
  if (method === 'GET' && destinationRead?.[1])
    return { data: await deps.treasuryRepository.get(decodeURIComponent(destinationRead[1])) };

  const challengeIssue = path.match(/^\/v1\/admin\/treasury-destinations\/([^/]+)\/challenges$/);
  if (method === 'POST' && challengeIssue?.[1]) {
    const idempotencyKey = requireIdempotencyKey(context);
    const destination = await deps.treasuryRepository.get(decodeURIComponent(challengeIssue[1]));
    if (destination.custody_model !== 'self_custody' || destination.controller_type !== 'neptlium')
      throw new ApiError(
        409,
        'treasury_challenge_not_applicable',
        'Ownership challenges apply only to Neptlium-controlled self-custody destinations',
      );
    if (destination.environment !== deps.environment.toLowerCase())
      throw new ApiError(
        409,
        'treasury_environment_mismatch',
        'Destination environment does not match runtime',
      );
    const challenge = issueTreasuryOwnershipChallenge({
      destinationId: String(destination.id),
      normalizedAddress: String(destination.normalized_address),
      network: String(destination.network),
      networkIdentifier: String(destination.network_identifier),
      environment: deps.environment,
    });
    const stored = await deps.treasuryRepository.issueChallenge({
      p_destination_id: destination.id,
      p_actor_id: actor.id,
      p_request_id: context.requestId,
      p_idempotency_key: idempotencyKey,
      p_nonce_digest: challenge.nonceDigest,
      p_message_digest: challenge.messageDigest,
      p_issued_at: challenge.binding.issuedAt,
      p_expires_at: challenge.binding.expiresAt,
    });
    return {
      status: 201,
      data: {
        id: stored.id,
        purpose: stored.purpose,
        message: challenge.message,
        nonce: challenge.binding.nonce,
        issued_at: challenge.binding.issuedAt,
        expires_at: challenge.binding.expiresAt,
      },
    };
  }

  const challengeVerify = path.match(
    /^\/v1\/admin\/treasury-destinations\/([^/]+)\/challenges\/([^/]+)\/verify$/,
  );
  if (method === 'POST' && challengeVerify?.[1] && challengeVerify[2]) {
    assertObject(context.body);
    const idempotencyKey = requireIdempotencyKey(context);
    const destinationId = decodeURIComponent(challengeVerify[1]);
    const challengeId = decodeURIComponent(challengeVerify[2]);
    const [destination, challenge] = await Promise.all([
      deps.treasuryRepository.get(destinationId),
      deps.treasuryRepository.getChallenge(challengeId),
    ]);
    if (String(challenge.treasury_destination_id) !== destinationId)
      throw new ApiError(
        409,
        'treasury_challenge_binding_mismatch',
        'Challenge is not bound to this destination',
      );
    assertChallengeUsable({
      consumedAt: challenge.consumed_at ? String(challenge.consumed_at) : null,
      expiresAt: String(challenge.expires_at),
      attempts: Number(challenge.verification_attempts),
    });
    const message = String(context.body.message ?? '');
    const nonce = String(context.body.nonce ?? '');
    if (sha256(message) !== challenge.message_digest || sha256(nonce) !== challenge.nonce_digest)
      throw new ApiError(
        400,
        'treasury_challenge_binding_mismatch',
        'Challenge message or nonce does not match durable evidence',
      );
    const signature = String(context.body.signature ?? '');
    try {
      if (destination.address_format === 'evm')
        await verifyEvmTreasuryOwnership({
          address: String(destination.normalized_address),
          message,
          signature: signature as `0x${string}`,
        });
      else if (destination.address_format === 'solana')
        verifySolanaTreasuryOwnership({
          address: String(destination.normalized_address),
          message,
          signature,
        });
      else if (destination.address_format === 'bitcoin')
        verifyBitcoinTreasuryOwnership({
          address: String(destination.normalized_address),
          message,
          signature,
        });
      else
        throw new ApiError(
          503,
          'treasury_ownership_verification_unavailable',
          'Ownership verifier is unavailable for this address format',
        );
    } catch (error) {
      if (error instanceof ApiError && error.status < 500) {
        await deps.treasuryRepository.recordVerificationFailure({
          p_challenge_id: challengeId,
          p_destination_id: destinationId,
          p_actor_id: actor.id,
          p_request_id: context.requestId,
          p_idempotency_key: idempotencyKey,
          p_failure_code: error.code,
        });
      }
      throw error;
    }
    const result = await deps.treasuryRepository.verify({
      p_challenge_id: challengeId,
      p_destination_id: destinationId,
      p_actor_id: actor.id,
      p_request_id: context.requestId,
      p_idempotency_key: idempotencyKey,
      p_nonce_digest: sha256(nonce),
      p_message_digest: sha256(message),
      p_verification_method:
        destination.address_format === 'evm'
          ? 'EIP_191_PERSONAL_SIGN'
          : destination.address_format === 'bitcoin'
            ? 'BIP_322_SIMPLE'
            : 'ED25519_MESSAGE',
      p_evidence_digest: sha256(signature),
    });
    return { data: result };
  }

  const transition = path.match(
    /^\/v1\/admin\/treasury-destinations\/([^/]+)\/(activate|suspend|retire)$/,
  );
  if (method === 'POST' && transition?.[1] && transition[2]) {
    const idempotencyKey = requireIdempotencyKey(context);
    const destination = await deps.treasuryRepository.get(decodeURIComponent(transition[1]));
    if (transition[2] === 'activate' && destination.status !== 'active')
      assertTreasuryActivationReady({
        asset: String(destination.asset),
        network: String(destination.network),
        environment: deps.environment,
        verificationState: String(destination.verification_state).toUpperCase() as 'VERIFIED',
        status: String(destination.status).toUpperCase() as 'INACTIVE',
      });
    const result = await deps.treasuryRepository.transition({
      p_destination_id: destination.id,
      p_actor_id: actor.id,
      p_request_id: context.requestId,
      p_idempotency_key: idempotencyKey,
      p_operation: transition[2],
    });
    return { data: result };
  }
  if (method === 'GET' && path === '/v1/admin/dashboard')
    return { data: await deps.repository.getDashboard() };
  if (method === 'GET' && path === '/v1/admin/users')
    return { data: await deps.repository.listUsers(query) };

  const userMatch = path.match(/^\/v1\/admin\/users\/([^/]+)$/);
  if (method === 'GET' && userMatch?.[1])
    return { data: await deps.repository.getUser(decodeURIComponent(userMatch[1])) };

  const roleMatch = path.match(/^\/v1\/admin\/users\/([^/]+)\/role$/);
  if (method === 'PATCH' && roleMatch?.[1]) {
    assertObject(context.body);
    const target = decodeURIComponent(roleMatch[1]);
    const nextRole = String(context.body.role ?? '');
    await deps.repository.updateUserRole(target, nextRole);
    await audit('admin.user_role.update', 'user', target, { role: nextRole });
    return { data: { status: 'updated' } };
  }

  const complianceMatch = path.match(/^\/v1\/admin\/users\/([^/]+)\/(suspend|activate)$/);
  if (method === 'POST' && complianceMatch?.[1] && complianceMatch[2]) {
    const target = decodeURIComponent(complianceMatch[1]);
    const action = complianceMatch[2];
    await deps.repository.setCompliance(target, action === 'suspend' ? 'suspended' : 'active');
    await audit(`admin.user.${action}`, 'user', target);
    return { data: { status: action === 'suspend' ? 'suspended' : 'active' } };
  }

  if (method === 'GET' && path === '/v1/admin/deposits')
    return { data: await deps.repository.listDeposits(query) };

  const depositCompletion = path.match(/^\/v1\/admin\/deposits\/([^/]+)\/complete$/);
  if (method === 'POST' && depositCompletion?.[1]) {
    requireIdempotencyKey(context);
    const depositId = decodeURIComponent(depositCompletion[1]);
    await audit('admin.deposit.complete.blocked', 'deposit', depositId, {
      reason: 'legacy_deposit_not_mapped_to_governed_funding_reconciliation_lifecycle',
    });
    throw new ApiError(
      409,
      'deposit_completion_unavailable',
      'This deposit cannot be completed manually until it is mapped to the governed funding and reconciliation lifecycle.',
    );
  }

  if (method === 'GET' && path === '/v1/admin/withdrawals/pending')
    return { data: await deps.repository.listWithdrawals(query, true) };
  if (method === 'GET' && path === '/v1/admin/withdrawals')
    return { data: await deps.repository.listWithdrawals(query, false) };
  if (method === 'GET' && path === '/v1/admin/transactions')
    return { data: await deps.repository.listTransactions(query) };

  const withdrawalDecision = path.match(/^\/v1\/admin\/withdrawals\/([^/]+)\/(approve|reject)$/);
  if (method === 'POST' && withdrawalDecision?.[1] && withdrawalDecision[2]) {
    const idempotencyKey = requireIdempotencyKey(context);
    const withdrawalId = decodeURIComponent(withdrawalDecision[1]);
    const decision = withdrawalDecision[2];

    if (decision === 'approve') {
      await deps.repository.approveWithdrawal(
        withdrawalId,
        actor.id,
        context.requestId,
        idempotencyKey,
      );
      await audit('admin.withdrawal.approve', 'transfer_execution', withdrawalId, {
        result: 'approved_only',
        provider_submission: false,
        settlement: false,
      });
      return {
        data: {
          status: 'approved',
          transfer_id: withdrawalId,
          provider_submission: 'not_performed',
        },
      };
    }

    await audit('admin.withdrawal.reject.blocked', 'withdrawal', withdrawalId, {
      reason: 'governed_rejection_and_reservation_release_policy_not_available',
    });
    throw new ApiError(
      409,
      'withdrawal_rejection_unavailable',
      'This withdrawal cannot be rejected until governed rejection and reservation-release policy is available.',
    );
  }

  if (method === 'GET' && path === '/v1/admin/allocations/pending')
    return { data: await deps.repository.listAllocations(query, true) };
  if (method === 'GET' && path === '/v1/admin/allocations')
    return { data: await deps.repository.listAllocations(query, false) };

  const allocationDecision = path.match(/^\/v1\/admin\/allocations\/([^/]+)\/(approve|reject)$/);
  if (method === 'POST' && allocationDecision?.[1] && allocationDecision[2]) {
    requireIdempotencyKey(context);
    const allocationId = decodeURIComponent(allocationDecision[1]);
    const action = allocationDecision[2];
    await audit(`admin.allocation.${action}.blocked`, 'allocation_request', allocationId, {
      reason: 'legacy_allocation_request_not_mapped_to_governed_allocation_domain',
    });
    throw new ApiError(
      409,
      'allocation_authorization_unavailable',
      'This legacy allocation request cannot be authorized until it is mapped to the governed Allocation policy/plan lifecycle.',
    );
  }

  if (method === 'GET' && path === '/v1/admin/security/login-history')
    return { data: await deps.repository.listLoginHistory(query) };
  if (method === 'GET' && path === '/v1/admin/security/trusted-devices')
    return { data: await deps.repository.listTrustedDevices() };

  throw new ApiError(404, 'admin_route_not_found', 'Administrative route was not found');
}
