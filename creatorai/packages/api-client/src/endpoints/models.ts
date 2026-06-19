import { api } from '../client';
import type { AiModel } from '@creatorai/shared';

export async function listModels(type?: string): Promise<AiModel[]> {
  const { data } = await api.get('/models', { params: { type } });
  return data;
}

export async function getModel(slug: string): Promise<AiModel> {
  const { data } = await api.get(`/models/${slug}`);
  return data;
}
