export type StripeSubscriptionPlan = 'free' | 'pro' | 'elite';
export type StripeSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export type StripeSubscriptionMutation =
  | {
      kind: 'activate_checkout';
      userId: string;
      plan: Exclude<StripeSubscriptionPlan, 'free'>;
      customerId: string;
      subscriptionId: string;
    }
  | {
      kind: 'sync_subscription';
      customerId: string;
      subscriptionId: string;
      userId?: string;
      plan?: Exclude<StripeSubscriptionPlan, 'free'>;
      status: StripeSubscriptionStatus;
    };

export type StripeSubscriptionCommand = StripeSubscriptionMutation & { eventCreated: number; eventId: string; environment: 'test' | 'live' };
