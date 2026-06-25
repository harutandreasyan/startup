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

/** Save a finished client-side tool result (background removal, upscale) to the gallery. */
export async function importGeneration(input: {
  type: string;
  image: string;
  thumbnail?: string;
  prompt?: string;
}): Promise<Generation> {
  const { data } = await api.post('/generations/import', input);
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
