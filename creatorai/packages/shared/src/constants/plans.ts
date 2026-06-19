import type { PlanInfo } from '../types';

export const PLANS: Record<string, PlanInfo> = {
  FREE: {
    plan: 'FREE',
    name: 'Free',
    priceUsd: 0,
    monthlyCredits: 0,
    features: [
      '20 signup bonus credits',
      'Basic models',
      'Standard queue',
      'Watermarked outputs',
    ],
  },
  PRO: {
    plan: 'PRO',
    name: 'Pro',
    priceUsd: 999,
    monthlyCredits: 500,
    features: [
      '500 credits/month',
      'All models',
      'Priority queue',
      'No watermark',
      'HD downloads',
    ],
  },
  BUSINESS: {
    plan: 'BUSINESS',
    name: 'Business',
    priceUsd: 2999,
    monthlyCredits: 2000,
    features: [
      '2000 credits/month',
      'All models',
      'Highest priority',
      'No watermark',
      'HD downloads',
      'API access',
      'Bulk generation',
    ],
  },
};
