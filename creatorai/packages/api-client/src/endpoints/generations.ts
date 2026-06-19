import { api } from '../client';
import type { Generation, GenerationRequest } from '@creatorai/shared';

export async function createGeneration(input: GenerationRequest): Promise<Generation> {
  const { data } = await api.post('/generations', input);
  return data;
}

export async function getGeneration(id: string): Promise<Generation> {
  const { data } = await api.get(`/generations/${id}`);
  return data;
}

export async function listGenerations(params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<{ data: Generation[]; total: number }> {
  const { data } = await api.get('/generations', { params });
  return data;
}

export async function deleteGeneration(id: string): Promise<void> {
  await api.delete(`/generations/${id}`);
}
