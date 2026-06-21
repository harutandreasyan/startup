import { api } from '../client';
import type { CreditBalance, CreditPack, CreditTransaction, Subscription } from '@creatorai/shared';

export async function getCreditBalance(): Promise<CreditBalance> {
  const { data } = await api.get('/credits/balance');
  return data;
}

export async function getCreditHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: CreditTransaction[]; total: number }> {
  const { data } = await api.get('/credits/history', { params });
  return data;
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  const { data } = await api.get('/credits/pricing');
  return data;
}

export async function purchaseCredits(packId: string): Promise<{ url: string }> {
  const { data } = await api.post('/credits/purchase', { packId });
  return data;
}

export async function subscribe(plan: 'PRO' | 'BUSINESS'): Promise<{ url: string }> {
  const { data } = await api.post('/payments/subscribe', { plan });
  return data;
}

export async function getSubscription(): Promise<Subscription | null> {
  const { data } = await api.get('/payments/subscription');
  return data;
}

export async function cancelSubscription(): Promise<{ cancelled: boolean; accessUntil: string }> {
  const { data } = await api.delete('/payments/subscription');
  return data;
}
