import { ApiError } from './errors.js';

export type StripeSubscriptionPlan = 'free' | 'pro' | 'elite';
export type StripeSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete';

export type StripeSubscriptionCommand =
  | {
      kind: 'activate_checkout';
      userId: string;
      plan: Exclude<StripeSubscriptionPlan, 'free'>;
      customerId: string;
      subscriptionId: string;
    }
  | { kind: 'renew_customer'; customerId: string }
  | {
      kind: 'sync_subscription';
      customerId: string;
      subscriptionId: string;
      userId?: string;
      plan?: Exclude<StripeSubscriptionPlan, 'free'>;
      status: StripeSubscriptionStatus;
    };

type Fetch = typeof fetch;

function queryValue(value: string) {
  return encodeURIComponent(value);
}

export class StripeSubscriptionRepository {
  private readonly baseUrl: string;
  private readonly key: string;
  private readonly fetchImpl: Fetch;

  constructor(supabaseUrl: string, serviceRoleKey: string, fetchImpl: Fetch = fetch) {
    this.baseUrl = supabaseUrl.replace(/\/$/, '');
    this.key = serviceRoleKey;
    this.fetchImpl = fetchImpl;
  }

  private async patchOne(filters: string[], payload: Record<string, unknown>) {
    const url = `${this.baseUrl}/rest/v1/subscriptions?${filters.join('&')}&select=id`;
    const response = await this.fetchImpl(url, {
      method: 'PATCH',
      headers: {
        apikey: this.key,
        authorization: `Bearer ${this.key}`,
        'content-type': 'application/json',
        prefer: 'return=representation',
      },
      body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
    });
    if (!response.ok)
      throw new ApiError(
        503,
        'stripe_subscription_persistence_failed',
        'Stripe subscription state could not be persisted',
      );

    const rows = (await response.json()) as Array<{ id?: string }>;
    if (rows.length !== 1)
      throw new ApiError(
        409,
        'stripe_subscription_unmatched',
        'Stripe subscription event did not resolve to exactly one Neptlium subscription',
      );
  }

  async apply(command: StripeSubscriptionCommand) {
    if (command.kind === 'activate_checkout') {
      await this.patchOne(
        [
          `user_id=eq.${queryValue(command.userId)}`,
          `stripe_customer_id=eq.${queryValue(command.customerId)}`,
        ],
        {
          plan: command.plan,
          status: 'active',
          stripe_subscription_id: command.subscriptionId,
        },
      );
      return;
    }

    if (command.kind === 'renew_customer') {
      await this.patchOne(
        [`stripe_customer_id=eq.${queryValue(command.customerId)}`],
        { status: 'active' },
      );
      return;
    }

    const filters = [`stripe_customer_id=eq.${queryValue(command.customerId)}`];
    if (command.userId) filters.push(`user_id=eq.${queryValue(command.userId)}`);
    await this.patchOne(filters, {
      status: command.status,
      stripe_subscription_id: command.subscriptionId,
      ...(command.plan ? { plan: command.plan } : {}),
      ...(command.status === 'canceled' ? { plan: 'free' } : {}),
    });
  }
}
