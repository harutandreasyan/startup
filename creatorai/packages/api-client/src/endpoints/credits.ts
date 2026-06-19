import { api } from '../client';
import type { CreditBalance, CreditPack, CreditTransaction } from '@creatorai/shared';

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
