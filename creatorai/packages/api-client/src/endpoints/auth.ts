import { api } from '../client';
import type { UserProfile } from '@creatorai/shared';

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get('/users/me');
  return data;
}

export async function updateProfile(input: { name?: string }): Promise<UserProfile> {
  const { data } = await api.patch('/users/me', input);
  return data;
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/auth/account');
}
