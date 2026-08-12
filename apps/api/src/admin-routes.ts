import { ApiError } from './errors.js';
import type { AdminRepository } from './admin-repository.js';

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
    throw new ApiError(400, 'idempotency_key_required', 'A valid Idempotency-Key header is required');
}

export async function handleAdminRoute(
  context: AdminContext,
  deps: { repository: AdminRepository; principal: User },
): Promise<{ status?: number; data: unknown }> {
  const actor = deps.principal;
  const role = await deps.repository.getRole(actor.id);
  if (role !== 'super_admin') {
    await deps.repository.audit(
      actor.id, 'admin.authorization.denied', 'admin_console', null, context.requestId,
      { required_role: 'super_admin', actual_role: role },
    ).catch(() => undefined);
    throw new ApiError(403, 'admin_forbidden', 'General Platform Administrator authorization is required');
  }

  const audit = (operation: string, resourceType: string, resourceId: string | null, metadata: Record<string, unknown> = {}) =>
    deps.repository.audit(actor.id, operation, resourceType, resourceId, context.requestId, metadata);

  const { method, path, query } = context;
  if (method === 'GET' && path === '/v1/admin/session') {
    await audit('admin.session.read', 'admin_session', actor.id);
    return { data: await deps.repository.getSession(actor.id) };
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
  if (method === 'GET' && path === '/v1/admin/withdrawals/pending')
    return { data: await deps.repository.listWithdrawals(query, true) };
  if (method === 'GET' && path === '/v1/admin/withdrawals')
    return { data: await deps.repository.listWithdrawals(query, false) };
  if (method === 'GET' && path === '/v1/admin/transactions')
    return { data: await deps.repository.listTransactions(query) };

  const withdrawalDecision = path.match(/^\/v1\/admin\/withdrawals\/([^/]+)\/(approve|reject)$/);
  if (method === 'POST' && withdrawalDecision?.[1] && withdrawalDecision[2]) {
    requireIdempotencyKey(context);
    const withdrawalId = decodeURIComponent(withdrawalDecision[1]);
    const decision = withdrawalDecision[2];
    await audit(`admin.withdrawal.${decision}.blocked`, 'withdrawal', withdrawalId, {
      reason: 'governed_manual_approval_persistence_not_available',
    });
    throw new ApiError(
      409,
      'withdrawal_approval_unavailable',
      'This withdrawal cannot be authorized until it is represented by the governed reservation and approval lifecycle.',
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
