import type { SubscriptionPlan } from './user';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED';
export type PaymentProvider = 'STRIPE' | 'APP_STORE' | 'PLAY_STORE';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  monthlyCredits: number;
}

export interface PlanInfo {
  plan: SubscriptionPlan;
  name: string;
  priceUsd: number;
  monthlyCredits: number;
  features: string[];
}
